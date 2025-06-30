# @title model train recommend product (kết nối MySQL)
# ==============================================================================
# QUY TRÌNH HOÀN CHỈNH: TINH CHỈNH VÀ ĐÁNH GIÁ MÔ HÌNH LAI (HYBRID MODEL)
# ==============================================================================
import pandas as pd
import numpy as np
import time
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import MinMaxScaler

# ------------------------------------------------------------------------------
# ### <<< THAY ĐỔI >>> ###
# BƯỚC 1: KẾT NỐI VÀ TẢI DỮ LIỆU TỪ MYSQL
# ------------------------------------------------------------------------------
print("--- BƯỚC 1: KẾT NỐI VÀ TẢI DỮ LIỆU TỪ MYSQL ---")

# --- Thông tin kết nối CSDL ---
db_user = 'root'
db_password = ''
db_host = 'localhost'
db_port = '3306'
db_name = 'websellproduct'

# Tạo engine kết nối
try:
    db_uri = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine = create_engine(db_uri)
    print("✅ Kết nối thành công đến MySQL.")
except Exception as e:
    print(f"❌ Lỗi kết nối CSDL: {e}")
    exit()

# --- Tải dữ liệu từ các bảng ---
try:
    # 1. Tải bảng sản phẩm (JOIN `products` và `categories`)
    sql_products = """
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        c.name AS category
    FROM
        products AS p
    LEFT JOIN
        categories AS c ON p.category_id = c.id;
    """
    products_df = pd.read_sql(sql_products, engine)
    products_df['category'] = products_df['category'].fillna('Chưa phân loại')
    print(f"✅ Đã tải thành công {len(products_df)} sản phẩm.")

    # 2. Tải dữ liệu tương tác (JOIN `order_items` và `orders`)
    # Đây sẽ là nguồn dữ liệu chính của chúng ta (ratings_df)
    sql_interactions = """
    SELECT
        o.user_id,
        oi.product_id,
        oi.quantity
    FROM
        order_items AS oi
    JOIN
        orders AS o ON oi.order_id = o.id;
    """
    ratings_df = pd.read_sql(sql_interactions, engine)
    print(f"✅ Đã tải {len(ratings_df)} dòng dữ liệu tương tác.")

    if ratings_df.empty:
        print("❌ Cảnh báo: Không có dữ liệu tương tác. Không thể tiếp tục huấn luyện.")
        exit()

except Exception as e:
    print(f"❌ Lỗi khi tải dữ liệu từ CSDL: {e}")
    exit()

# ==============================================================================
# CÁC BƯỚC CÒN LẠI GIỮ NGUYÊN
# ==============================================================================

# ------------------------------------------------------------------------------
# BƯỚC 2: CHIA DỮ LIỆU THÀNH 3 TẬP (60-20-20)
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 2: CHIA DỮ LIỆU THÀNH 3 TẬP (60-20-20) ---")
# Đảm bảo có đủ dữ liệu để chia
if len(ratings_df) < 10:
    print("❌ Lỗi: Dữ liệu quá ít để chia thành các tập train/validation/test.")
    exit()
    
train_val_df, test_df = train_test_split(ratings_df, test_size=0.2, random_state=42)
train_df, val_df = train_test_split(train_val_df, test_size=0.25, random_state=42) # 0.25 * 0.8 = 0.2

print(f"Kích thước tập Train:      {len(train_df)} (~{len(train_df)/len(ratings_df):.0%})")
print(f"Kích thước tập Validation: {len(val_df)} (~{len(val_df)/len(ratings_df):.0%})")
print(f"Kích thước tập Test:        {len(test_df)} (~{len(test_df)/len(ratings_df):.0%})")

# ------------------------------------------------------------------------------
# BƯỚC 3: CHUẨN BỊ MA TRẬN VÀ DỮ LIỆU ĐÁNH GIÁ
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 3: CHUẨN BỊ MA TRẬN VÀ DỮ LIỆU ĐÁNH GIÁ ---")
# Tạo ma trận user-item từ tập train
train_user_item_matrix = train_df.groupby(['user_id', 'product_id'])['quantity'].sum().reset_index().pivot_table(index='user_id', columns='product_id', values='quantity', fill_value=0)

# Thêm các sản phẩm/user có thể bị thiếu vào ma trận train để đảm bảo kích thước nhất quán
all_users = ratings_df['user_id'].unique()
all_products = products_df['product_id'].unique()

missing_users = set(all_users) - set(train_user_item_matrix.index)
for user in missing_users:
    train_user_item_matrix.loc[user] = 0

missing_products = set(all_products) - set(train_user_item_matrix.columns)
for prod in missing_products:
    train_user_item_matrix[prod] = 0

train_user_item_matrix = train_user_item_matrix.sort_index(axis=0).sort_index(axis=1)

# Dữ liệu để kiểm định
val_user_items = val_df.groupby('user_id')['product_id'].apply(set).to_dict()

# Dữ liệu để kiểm thử cuối cùng
test_user_items = test_df.groupby('user_id')['product_id'].apply(set).to_dict()
print("✅ Đã chuẩn bị xong ma trận train và các tập dữ liệu đánh giá.")

# ------------------------------------------------------------------------------
# BƯỚC 3.5: CHUẨN BỊ CHO MÔ HÌNH LỌC DỰA TRÊN NỘI DUNG (CBF)
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 3.5: CHUẨN BỊ CHO MÔ HÌNH LỌC DỰA TRÊN NỘI DUNG (CBF) ---")
df_product_features = pd.get_dummies(products_df.set_index('product_id')['category'])
# Đảm bảo các cột/hàng khớp nhau
product_features_aligned = df_product_features.reindex(train_user_item_matrix.columns).fillna(0)

user_profiles_train = np.dot(train_user_item_matrix, product_features_aligned)
cbf_scores_train = np.dot(user_profiles_train, product_features_aligned.T)
df_cbf_scores_train = pd.DataFrame(cbf_scores_train, index=train_user_item_matrix.index, columns=train_user_item_matrix.columns)
print("✅ Đã tạo ma trận điểm CBF dựa trên tập train.")

# ------------------------------------------------------------------------------
# BƯỚC 4: TINH CHỈNH SIÊU THAM SỐ CHO MÔ HÌNH LAI
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 4: TINH CHỈNH SIÊU THAM SỐ (k, alpha) TRÊN TẬP VALIDATION ---")
start_time_tuning = time.time()

# Điều chỉnh k_values để không lớn hơn số chiều của ma trận
max_k = min(train_user_item_matrix.shape) - 1
k_values_to_try = [k for k in [10, 20, 30, 40] if k <= max_k]
if not k_values_to_try:
    k_values_to_try = [max_k] # Ít nhất phải thử một giá trị k

alpha_values_to_try = [0.2, 0.5, 0.8]
results_val = []
k_for_recommendations = 10
scaler = MinMaxScaler()

for k_value in k_values_to_try:
    # ... (Phần còn lại của code được giữ nguyên)
    # 1. Huấn luyện mô hình CF (SVD)
    svd_model_tune = TruncatedSVD(n_components=k_value, random_state=42)
    matrix_p_tune = svd_model_tune.fit_transform(train_user_item_matrix)
    matrix_q_tune = svd_model_tune.components_
    predicted_ratings_cf = np.dot(matrix_p_tune, matrix_q_tune)
    df_predicted_cf = pd.DataFrame(predicted_ratings_cf, index=train_user_item_matrix.index, columns=train_user_item_matrix.columns)

    # 2. Chuẩn hóa điểm số
    df_cf_normalized = pd.DataFrame(scaler.fit_transform(df_predicted_cf), index=df_predicted_cf.index, columns=df_predicted_cf.columns)
    df_cbf_normalized = pd.DataFrame(scaler.fit_transform(df_cbf_scores_train), index=df_cbf_scores_train.index, columns=df_cbf_scores_train.columns)

    for alpha_value in alpha_values_to_try:
        # 3. Kết hợp điểm số
        df_hybrid_scores = alpha_value * df_cf_normalized + (1 - alpha_value) * df_cbf_normalized

        # 4. Đánh giá trên tập Validation
        all_precisions_val = []
        all_recalls_val = []

        for user_id, true_items in val_user_items.items():
            if user_id in df_hybrid_scores.index:
                predicted_scores = df_hybrid_scores.loc[user_id]
                original_train_scores = train_user_item_matrix.loc[user_id]
                unbought_items_scores = predicted_scores[original_train_scores == 0]
                top_k_recs = set(unbought_items_scores.sort_values(ascending=False).head(k_for_recommendations).index)

                hits = top_k_recs.intersection(true_items)
                precision = len(hits) / k_for_recommendations if k_for_recommendations > 0 else 0
                recall = len(hits) / len(true_items) if len(true_items) > 0 else 0
                all_precisions_val.append(precision)
                all_recalls_val.append(recall)

        mean_precision_val = np.mean(all_precisions_val) if all_precisions_val else 0
        mean_recall_val = np.mean(all_recalls_val) if all_recalls_val else 0
        results_val.append({'k': k_value, 'alpha': alpha_value, 'precision': mean_precision_val, 'recall': mean_recall_val})
        print(f"k = {k_value:2d}, alpha = {alpha_value:.1f} | Val Precision: {mean_precision_val:.4f} | Val Recall: {mean_recall_val:.4f}")

end_time_tuning = time.time()
print(f"✅ Tinh chỉnh tham số hoàn tất. Thời gian: {end_time_tuning - start_time_tuning:.2f} giây.")

# ------------------------------------------------------------------------------
# BƯỚC 5: CHỌN (k, alpha) TỐT NHẤT VÀ ĐÁNH GIÁ CUỐI CÙNG
# ------------------------------------------------------------------------------
if not results_val:
    print("❌ Không có kết quả nào để đánh giá. Dừng chương trình.")
    exit()

print("\n--- BƯỚC 5: ĐÁNH GIÁ CUỐI CÙNG TRÊN TẬP TEST ---")
results_val_df = pd.DataFrame(results_val)
best_params_row = results_val_df.loc[results_val_df['precision'].idxmax()]
best_k = int(best_params_row['k'])
best_alpha = best_params_row['alpha']
print(f"🏆 Tham số tốt nhất tìm được từ tập Validation: k = {best_k}, alpha = {best_alpha}")

# Huấn luyện lại mô hình cuối cùng trên toàn bộ tập train+validation
print(f"Huấn luyện lại mô hình cuối cùng với k={best_k}, alpha={best_alpha} trên Train+Validation set...")
# Tạo ma trận cuối cùng từ train+val
final_train_val_matrix = train_val_df.groupby(['user_id', 'product_id'])['quantity'].sum().reset_index().pivot_table(index='user_id', columns='product_id', values='quantity', fill_value=0)
# Căn chỉnh lại ma trận cuối cùng
final_train_val_matrix = final_train_val_matrix.reindex(index=all_users, columns=all_products, fill_value=0).sort_index(axis=0).sort_index(axis=1)


# 1. Mô hình CF cuối cùng
final_model_cf = TruncatedSVD(n_components=best_k, random_state=42)
final_p = final_model_cf.fit_transform(final_train_val_matrix)
final_q = final_model_cf.components_
final_predicted_cf = pd.DataFrame(np.dot(final_p, final_q), index=final_train_val_matrix.index, columns=final_train_val_matrix.columns)

# 2. Mô hình CBF cuối cùng
final_product_features_aligned = df_product_features.reindex(final_train_val_matrix.columns).fillna(0)
final_user_profiles = np.dot(final_train_val_matrix, final_product_features_aligned)
final_predicted_cbf = pd.DataFrame(np.dot(final_user_profiles, final_product_features_aligned.T), index=final_train_val_matrix.index, columns=final_train_val_matrix.columns)

# 3. Chuẩn hóa và kết hợp
final_cf_norm = pd.DataFrame(scaler.fit_transform(final_predicted_cf), index=final_predicted_cf.index, columns=final_predicted_cf.columns)
final_cbf_norm = pd.DataFrame(scaler.fit_transform(final_predicted_cbf), index=final_cbf_aligned.index, columns=final_cbf_aligned.columns)
final_hybrid_scores = best_alpha * final_cf_norm + (1 - best_alpha) * final_cbf_norm

# 4. Đánh giá trên tập TEST
all_precisions_test = []
all_recalls_test = []
for user_id, true_items in test_user_items.items():
    if user_id in final_hybrid_scores.index:
        predicted_scores = final_hybrid_scores.loc[user_id]
        original_scores = final_train_val_matrix.loc[user_id]
        unbought_items_scores = predicted_scores[original_scores == 0]

        top_k_recs = set(unbought_items_scores.sort_values(ascending=False).head(k_for_recommendations).index)

        hits = top_k_recs.intersection(true_items)
        precision = len(hits) / k_for_recommendations if k_for_recommendations > 0 else 0
        recall = len(hits) / len(true_items) if len(true_items) > 0 else 0
        all_precisions_test.append(precision)
        all_recalls_test.append(recall)

final_precision = np.mean(all_precisions_test) if all_precisions_test else 0
final_recall = np.mean(all_recalls_test) if all_recalls_test else 0

print("\n--- KẾT QUẢ CUỐI CÙNG, KHÁCH QUAN TRÊN TẬP TEST ---")
print(f"📊 Final Precision@{k_for_recommendations} (với k={best_k}, alpha={best_alpha}): {final_precision:.4f}")
print(f"📊 Final Recall@{k_for_recommendations}    (với k={best_k}, alpha={best_alpha}): {final_recall:.4f}")