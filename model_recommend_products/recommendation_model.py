# ==============================================================================
# QUY TRÌNH HOÀN CHỈNH - ĐIỀU CHỈNH THEO CSDL 'websellproduct'
# ==============================================================================
import pandas as pd
import numpy as np
import joblib
import os
import time

from sqlalchemy import create_engine
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

# ------------------------------------------------------------------------------
# ### <<< ĐÃ SỬA LẠI THEO CSDL CỦA BẠN >>> ###
# BƯỚC 1: KẾT NỐI VÀ TẢI DỮ LIỆU TỪ MYSQL
# ------------------------------------------------------------------------------
print("--- BƯỚC 1: KẾT NỐI VÀ TẢI DỮ LIỆU TỪ MYSQL ---")

# --- Thông tin kết nối CSDL ---
# Thay đổi nếu cần, nhưng đây là cấu hình mặc định của XAMPP
db_user = 'root'
db_password = ''
db_host = 'localhost'
db_port = '3306'
db_name = 'websellproduct'  # <<< THAY ĐỔI TÊN DATABASE

# Tạo chuỗi kết nối (connection string)
try:
    db_uri = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine = create_engine(db_uri)
    print("✅ Kết nối thành công đến MySQL.")
except Exception as e:
    print(f"Lỗi kết nối CSDL: {e}")
    exit()

# --- Tải dữ liệu từ các bảng (với câu lệnh SQL đã được điều chỉnh) ---

# 1. Tải bảng sản phẩm (JOIN `products` và `categories`)
# Sử dụng `AS` để đổi tên cột cho khớp với phần còn lại của script
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
# Xử lý trường hợp có sản phẩm không có danh mục
products_df['category'] = products_df['category'].fillna('Chưa phân loại')
print(f"✅ Đã tải thành công {len(products_df)} sản phẩm.")


# 2. Tải dữ liệu tương tác (JOIN `order_items` và `orders`)
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


# ==============================================================================
# CÁC BƯỚC CÒN LẠI GIỮ NGUYÊN VÌ ĐÃ CÓ DATA FRAME ĐÚNG CHUẨN
# ==============================================================================

# ------------------------------------------------------------------------------
# BƯỚC 2: CHUẨN BỊ MA TRẬN TỪ TOÀN BỘ DỮ LIỆU
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 2: CHUẨN BỊ MA TRẬN TỔNG ---")
user_item_ratings_full = ratings_df.groupby(['user_id', 'product_id'])['quantity'].sum().reset_index()
user_item_matrix_full = user_item_ratings_full.pivot_table(index='user_id', columns='product_id', values='quantity', fill_value=0)
all_product_ids = products_df['product_id'].unique()
missing_cols = set(all_product_ids) - set(user_item_matrix_full.columns)
for col in missing_cols:
    user_item_matrix_full[col] = 0
user_item_matrix_full = user_item_matrix_full[sorted(all_product_ids)]
print(f"✅ Đã tạo ma trận User-Item từ toàn bộ dữ liệu. Kích thước: {user_item_matrix_full.shape}")

# ------------------------------------------------------------------------------
# BƯỚC 3: HUẤN LUYỆN MÔ HÌNH CUỐI CÙNG VỚI k TỐI ƯU
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 3: HUẤN LUYỆN MÔ HÌNH CUỐI CÙNG ---")
k_value = min(10, len(user_item_matrix_full.columns) - 1, len(user_item_matrix_full.index) - 1)
if k_value < 1:
    print("Lỗi: Không đủ dữ liệu (sản phẩm hoặc người dùng) để huấn luyện mô hình. Cần ít nhất 2 user và 2 product.")
    exit()
BEST_K = k_value
print(f"Sử dụng k = {BEST_K} để huấn luyện trên toàn bộ dữ liệu...")

final_svd_model = TruncatedSVD(n_components=BEST_K, random_state=42)
final_matrix_p = final_svd_model.fit_transform(user_item_matrix_full)
final_matrix_q = final_svd_model.components_
print("✅ Đã huấn luyện xong mô hình cuối cùng!")

# ------------------------------------------------------------------------------
# BƯỚC 4: TẠO CÁC MA TRẬN KẾT QUẢ ĐỂ SỬ DỤNG
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 4: TẠO CÁC CÔNG CỤ GỢI Ý ---")
final_predicted_ratings_matrix = np.dot(final_matrix_p, final_matrix_q)
df_final_predicted_ratings = pd.DataFrame(final_predicted_ratings_matrix,
                                          index=user_item_matrix_full.index,
                                          columns=user_item_matrix_full.columns)
matrix_q_transposed = final_matrix_q.T
df_final_q = pd.DataFrame(matrix_q_transposed,
                        index=user_item_matrix_full.columns,
                        columns=[f'Feature_{i+1}' for i in range(BEST_K)])
df_final_q_with_names = df_final_q.merge(products_df,
                                       left_index=True, right_on='product_id').set_index('product_id')
print("✅ Đã tạo ma trận dự đoán và ma trận đặc tính sản phẩm cuối cùng.")

# ==============================================================================
# BƯỚC 4.5: XÂY DỰNG MÔ HÌNH LỌC DỰA TRÊN NỘI DUNG (CBF)
# ==============================================================================
print("\n--- BƯỚC 4.5: XÂY DỰNG MÔ HÌNH LỌC DỰA TRÊN NỘI DUNG ---")
df_product_features = pd.get_dummies(products_df.set_index('product_id')['category'])
common_products = user_item_matrix_full.columns.intersection(df_product_features.index)
user_profiles = np.dot(user_item_matrix_full[common_products], df_product_features.loc[common_products])
df_user_profiles = pd.DataFrame(user_profiles, index=user_item_matrix_full.index, columns=df_product_features.columns)

df_cbf_scores = pd.DataFrame(
    np.dot(df_user_profiles, df_product_features.T),
    index=user_item_matrix_full.index,
    columns=user_item_matrix_full.columns
)
print("✅ Đã tạo xong ma trận điểm gợi ý từ mô hình Lọc dựa trên nội dung (CBF).")

scaler = MinMaxScaler()
df_cf_scores_normalized = pd.DataFrame(
    scaler.fit_transform(df_final_predicted_ratings),
    index=df_final_predicted_ratings.index,
    columns=df_final_predicted_ratings.columns
)
df_cbf_scores_normalized = pd.DataFrame(
    scaler.fit_transform(df_cbf_scores),
    index=df_cbf_scores.index,
    columns=df_cbf_scores.columns
)
print("✅ Đã chuẩn hóa điểm từ cả hai mô hình CF và CBF.")

# ------------------------------------------------------------------------------
# BƯỚC 5: ĐỊNH NGHĨA CÁC HÀM GỢI Ý
# ------------------------------------------------------------------------------
def hybrid_recommend_for_user(user_id, num_recommendations, alpha,
                              df_cf, df_cbf, df_original, df_products):
    if user_id not in df_original.index:
        print(f"Lỗi: User ID {user_id} là người dùng mới hoặc chưa mua hàng. Chuyển sang gợi ý sản phẩm bán chạy nhất.")
        # Tính tổng số lượng bán ra của mỗi sản phẩm từ df_original
        top_products_ids = df_original.sum().sort_values(ascending=False).head(num_recommendations).index
        return df_products[df_products['product_id'].isin(top_products_ids)]

    cf_scores = df_cf.loc[user_id]
    cbf_scores = df_cbf.loc[user_id]
    hybrid_scores = alpha * cf_scores + (1 - alpha) * cbf_scores
    original_scores = df_original.loc[user_id]
    unbought_items_scores = hybrid_scores[original_scores == 0]
    top_items = unbought_items_scores.sort_values(ascending=False).head(num_recommendations)

    recommendations = pd.DataFrame(top_items).reset_index()
    recommendations.columns = ['product_id', 'hybrid_score']
    final_recommendations = recommendations.merge(df_products, on='product_id')
    return final_recommendations

def find_similar_products(product_id, num_similar, df_features, df_products):
    if product_id not in df_features.index:
        print(f"Lỗi: Không tìm thấy product_id {product_id} trong ma trận đặc tính.")
        return pd.DataFrame()
    df_q_for_similarity = df_features.drop(columns=['product_name', 'category'], errors='ignore')
    target_vector = df_q_for_similarity.loc[product_id].values.reshape(1, -1)
    similarity_scores = cosine_similarity(target_vector, df_q_for_similarity.values)
    similarity_series = pd.Series(similarity_scores[0], index=df_q_for_similarity.index)
    top_similar = similarity_series.sort_values(ascending=False).drop(product_id)

    similar_products = pd.DataFrame(top_similar.head(num_similar)).reset_index()
    similar_products.columns = ['product_id', 'similarity_score']
    final_similar_products = similar_products.merge(df_products, on='product_id')
    return final_similar_products

print("\n✅ Đã định nghĩa các hàm gợi ý.")


# ------------------------------------------------------------------------------
# BƯỚC 6: SỬ DỤNG MÔ HÌNH LAI
# ------------------------------------------------------------------------------
print("\n--- BƯỚC 6: TRÌNH DIỄN MÔ HÌNH LAI ---")

# --- Ví dụ 1: Gợi ý cho một người dùng cụ thể bằng mô hình Lai ---
# Dựa trên dữ liệu của bạn, user_id=8 có nhiều giao dịch.
USER_ID = 8
NUM_RECS = 5

print(f"\n✨ Gợi ý cho User ID {USER_ID} (Cân bằng giữa CF và CBF, alpha=0.5):")
hybrid_recs_balanced = hybrid_recommend_for_user(
    user_id=USER_ID, num_recommendations=NUM_RECS, alpha=0.5,
    df_cf=df_cf_scores_normalized, df_cbf=df_cbf_scores_normalized,
    df_original=user_item_matrix_full, df_products=products_df
)
print(hybrid_recs_balanced[['product_id', 'product_name', 'category', 'hybrid_score']])


# --- Ví dụ 2: Tìm các sản phẩm tương tự ---
# product_id=1 là 'Trà Sữa Trân Châu Đường Đen'
PRODUCT_ID = 1
NUM_SIMILAR = 3
print(f"\n✨ Tìm {NUM_SIMILAR} sản phẩm tương tự với sản phẩm ID {PRODUCT_ID}:")
item_recommendations = find_similar_products(
    product_id=PRODUCT_ID, num_similar=NUM_SIMILAR,
    df_features=df_final_q_with_names, df_products=products_df
)
print(item_recommendations[['product_id', 'product_name', 'similarity_score']])

# ==============================================================================
# BƯỚC 7: LƯU MÔ HÌNH VÀ CÁC ĐỐI TƯỢNG CẦN THIẾT RA FILE
# ==============================================================================
print("\n--- BƯỚC 7: LƯU MÔ HÌNH VÀ DỮ LIỆU ---")
output_dir = 'saved_models'
os.makedirs(output_dir, exist_ok=True)

joblib.dump(final_svd_model, os.path.join(output_dir, 'svd_model.joblib'))
scaler_cf = MinMaxScaler().fit(df_final_predicted_ratings)
scaler_cbf = MinMaxScaler().fit(df_cbf_scores)
joblib.dump(scaler_cf, os.path.join(output_dir, 'scaler_cf.joblib'))
joblib.dump(scaler_cbf, os.path.join(output_dir, 'scaler_cbf.joblib'))
df_cf_scores_normalized.to_pickle(os.path.join(output_dir, 'df_cf_scores_normalized.pkl'))
df_cbf_scores_normalized.to_pickle(os.path.join(output_dir, 'df_cbf_scores_normalized.pkl'))
user_item_matrix_full.to_pickle(os.path.join(output_dir, 'user_item_matrix_full.pkl'))
products_df.to_pickle(os.path.join(output_dir, 'products_df.pkl'))
df_final_q_with_names.to_pickle(os.path.join(output_dir, 'df_final_q_with_names.pkl'))

print(f"\n✅ Đã lưu thành công tất cả mô hình và dữ liệu vào thư mục '{output_dir}'.")