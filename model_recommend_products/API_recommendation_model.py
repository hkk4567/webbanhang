# @title API (Tối ưu hóa SQL, lấy category_id)
import pandas as pd
import joblib
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sklearn.metrics.pairwise import cosine_similarity

# ==============================================================================
# KHỞI TẠO ỨNG DỤNG FLASK VÀ KẾT NỐI CSDL
# ==============================================================================
app = Flask(__name__)
CORS(app) 

# --- Thông tin kết nối CSDL ---
db_user = 'root'
db_password = ''
db_host = 'localhost'
db_port = '3306'
db_name = 'websellproduct'

# Tạo engine kết nối CSDL
try:
    db_uri = f"mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine = create_engine(db_uri)
    print("✅ Kết nối CSDL thành công.")
except Exception as e:
    print(f"❌ Lỗi kết nối CSDL: {e}")
    exit()

# ==============================================================================
# TẢI CÁC MÔ HÌNH VÀ DỮ LIỆU ĐÃ ĐƯỢC LƯU
# ==============================================================================
MODEL_DIR = 'saved_models'
try:
    df_cf_scores = pd.read_pickle(os.path.join(MODEL_DIR, 'df_cf_scores_normalized.pkl'))
    df_cbf_scores = pd.read_pickle(os.path.join(MODEL_DIR, 'df_cbf_scores_normalized.pkl'))
    df_original = pd.read_pickle(os.path.join(MODEL_DIR, 'user_item_matrix_full.pkl'))
    df_item_features = pd.read_pickle(os.path.join(MODEL_DIR, 'df_final_q_with_names.pkl'))
    print("✅ Đã tải thành công các file mô hình.")
except FileNotFoundError as e:
    print(f"❌ Lỗi: Không tìm thấy file '{e.filename}'. Hãy chắc chắn bạn đã chạy script huấn luyện.")
    exit()

# ==============================================================================
# ĐỊNH NGHĨA LẠI CÁC HÀM GỢI Ý (SỬ DỤNG SQL)
# ==============================================================================

# ### <<< ĐÃ CHỈNH SỬA VÀ TỐI ƯU HÓA Ở ĐÂY >>> ###
def get_product_details_from_db(product_ids):
    """Hàm trợ giúp để lấy thông tin chi tiết sản phẩm từ CSDL."""
    if not product_ids:
        return pd.DataFrame()
    
    ids_str = ', '.join(map(str, product_ids))
    
    # Câu lệnh SQL mới: lấy TẤT CẢ các cột từ bảng `products`
    # và không cần JOIN với bảng `categories`.
    sql_query = f"""
        SELECT *
        FROM products
        WHERE id IN ({ids_str});
    """
    
    print(f"Executing SQL query for product IDs: {ids_str}")
    product_details_df = pd.read_sql(sql_query, engine)
    
    # Đổi tên cột 'id' thành 'product_id' để khớp với các DataFrame khác khi merge
    product_details_df.rename(columns={'id': 'product_id'}, inplace=True)
    
    # Chuyển đổi kiểu dữ liệu của cột 'price' để đảm bảo tính nhất quán
    if 'price' in product_details_df.columns:
        product_details_df['price'] = product_details_df['price'].astype(float)
        
    return product_details_df

# Hàm gợi ý lai (không thay đổi)
def hybrid_recommend_for_user(user_id, num_recommendations, alpha):
    if user_id not in df_original.index:
        print(f"User ID {user_id} là người dùng mới. Gợi ý sản phẩm bán chạy nhất.")
        top_product_ids = df_original.sum().sort_values(ascending=False).head(num_recommendations).index.tolist()
        return get_product_details_from_db(top_product_ids)

    cf_scores = df_cf_scores.loc[user_id]
    cbf_scores = df_cbf_scores.loc[user_id]
    hybrid_scores = alpha * cf_scores + (1 - alpha) * cbf_scores
    original_scores = df_original.loc[user_id]
    unbought_items_scores = hybrid_scores[original_scores == 0]
    top_items = unbought_items_scores.sort_values(ascending=False).head(num_recommendations)

    recommendations_df = pd.DataFrame(top_items).reset_index()
    recommendations_df.columns = ['product_id', 'hybrid_score']
    
    product_ids_to_fetch = recommendations_df['product_id'].tolist()
    product_details = get_product_details_from_db(product_ids_to_fetch)
    
    final_recommendations = pd.merge(recommendations_df, product_details, on='product_id')
    return final_recommendations

# Hàm tìm sản phẩm tương tự (không thay đổi)
def find_similar_products(product_id, num_similar):
    if product_id not in df_item_features.index:
        return pd.DataFrame()

    df_q_for_similarity = df_item_features.drop(columns=['product_name', 'category'], errors='ignore')
    target_vector = df_q_for_similarity.loc[product_id].values.reshape(1, -1)
    similarity_scores = cosine_similarity(target_vector, df_q_for_similarity.values)
    similarity_series = pd.Series(similarity_scores[0], index=df_q_for_similarity.index)
    top_similar = similarity_series.sort_values(ascending=False).drop(product_id)
    
    similar_products_df = pd.DataFrame(top_similar.head(num_similar)).reset_index()
    similar_products_df.columns = ['product_id', 'similarity_score']

    product_ids_to_fetch = similar_products_df['product_id'].tolist()
    product_details = get_product_details_from_db(product_ids_to_fetch)

    final_similar_products = pd.merge(similar_products_df, product_details, on='product_id')
    
    return final_similar_products

# ==============================================================================
# TẠO CÁC ĐIỂM TRUY CẬP API (API ENDPOINTS)
# ==============================================================================

@app.route('/recommendations/user', methods=['GET'])
def recommend_for_user_endpoint():
    user_id = request.args.get('user_id', type=int)
    num_recs = request.args.get('num_recs', default=5, type=int)
    alpha = request.args.get('alpha', default=0.5, type=float)
    if user_id is None:
        return jsonify({"error": "Vui lòng cung cấp 'user_id'."}), 400
    recommendations = hybrid_recommend_for_user(user_id, num_recs, alpha)
    # Loại bỏ các cột không cần thiết trước khi trả về JSON
    if 'created_at' in recommendations.columns:
        recommendations = recommendations.drop(columns=['created_at'])
    if 'updated_at' in recommendations.columns:
        recommendations = recommendations.drop(columns=['updated_at'])
    return jsonify(recommendations.to_dict(orient='records'))

@app.route('/recommendations/item', methods=['GET'])
def recommend_for_item_endpoint():
    product_id = request.args.get('product_id', type=int)
    num_similar = request.args.get('num_similar', default=3, type=int)
    if product_id is None:
        return jsonify({"error": "Vui lòng cung cấp 'product_id'."}), 400
    similar_products = find_similar_products(product_id, num_similar)
    if similar_products.empty:
        return jsonify({"error": f"Không tìm thấy sản phẩm với product_id = {product_id}."}), 404
    # Loại bỏ các cột không cần thiết trước khi trả về JSON
    if 'created_at' in similar_products.columns:
        similar_products = similar_products.drop(columns=['created_at'])
    if 'updated_at' in similar_products.columns:
        similar_products = similar_products.drop(columns=['updated_at'])
    return jsonify(similar_products.to_dict(orient='records'))

# Chạy server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)