import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import classNames from 'classnames/bind';
import styles from './AdminProductsPage.module.scss';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';
import ProductFormModal from './components/ProductFormModal';
import { mockAllProducts } from '../../../data/products'; // Dùng dữ liệu giả

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 10;

function AdminProductsPage() {
    const [products, setProducts] = useState(mockAllProducts);

    // State cho modal Thêm/Sửa
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // State cho modal Xóa
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState(null);

    // Sử dụng hook phân trang
    const { currentData, currentPage, maxPage, jump } = usePagination(products, ITEMS_PER_PAGE);

    // --- HÀM XỬ LÝ MODAL ---
    const handleCloseModals = () => {
        setShowFormModal(false);
        setShowDeleteModal(false);
        setEditingProduct(null);
        setDeletingProductId(null);
    };

    const handleShowAddModal = () => {
        setEditingProduct(null); // Đảm bảo là chế độ "Thêm"
        setShowFormModal(true);
    };

    const handleShowEditModal = (product) => {
        setEditingProduct(product);
        setShowFormModal(true);
    };

    const handleShowDeleteModal = (id) => {
        setDeletingProductId(id);
        setShowDeleteModal(true);
    };

    // --- HÀM XỬ LÝ CRUD ---
    const handleSaveProduct = (productData) => {
        // Chuyển đổi status 'available'/'hidden' thành một giá trị stock hợp lệ nếu cần
        // Ví dụ, nếu là hidden, stock có thể là 0
        const finalStock = productData.status === 'hidden' ? 0 : (productData.stock || 1);

        if (productData.id) {
            // Chế độ Sửa
            setProducts(products.map(p =>
                p.id === productData.id
                    ? {
                        ...p, // Giữ lại các giá trị cũ không thay đổi
                        ...productData, // Ghi đè bằng dữ liệu mới từ form
                        stock: finalStock,
                    }
                    : p
            ));
            console.log("Đã cập nhật sản phẩm:", productData);
        } else {
            // Chế độ Thêm
            const newProduct = {
                ...productData,
                id: Date.now(), // Tạo ID tạm thời
                slug: productData.name.toLowerCase().replace(/\s+/g, '-'), // Tạo slug tạm thời
                stock: finalStock
            };
            setProducts([newProduct, ...products]);
            console.log("Đã thêm sản phẩm mới:", newProduct);
        }
    };

    const handleDeleteConfirm = () => {
        setProducts(products.filter(p => p.id !== deletingProductId));
        handleCloseModals();
    };

    return (
        <main className="mt-5 pt-3 pb-6 bgMain">
            <div className="container-fluid">
                <div className="row section">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold">Quản lý Sản phẩm</h1>
                        <Button variant="outline-success" onClick={handleShowAddModal}>
                            <i className="bi bi-plus-circle me-2"></i> Thêm sản phẩm
                        </Button>
                    </div>
                </div>

                <div className="card shadow-sm mt-3">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Trạng thái</th>
                                        <th>Giá tiền</th>
                                        <th>Danh mục</th>
                                        <th className="text-center">Tùy chỉnh</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((product, index) => (
                                        <tr key={product.id}>
                                            <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                            <td>
                                                <img src={product.image} alt={product.name} className={cx('product-image')} />
                                                <span>{product.name}</span>
                                            </td>
                                            <td>
                                                <span className={cx('status-badge', { 'status-active': product.stock > 0, 'status-inactive': product.stock === 0 })}>
                                                    {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                                                </span>
                                            </td>
                                            <td>{product.price.toLocaleString('vi-VN')}đ</td>
                                            <td>{product.category}</td>
                                            <td className="text-center">
                                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowEditModal(product)}>
                                                    <i className="bi bi-pencil-square"></i> Sửa
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleShowDeleteModal(product.id)}>
                                                    <i className="bi bi-trash"></i> Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <Pagination currentPage={currentPage} totalPageCount={maxPage} onPageChange={page => jump(page)} />
                </div>
            </div>

            {/* --- CÁC MODAL --- */}
            <ProductFormModal
                show={showFormModal}
                handleClose={handleCloseModals}
                onSave={handleSaveProduct}
                productToEdit={editingProduct}
            />

            <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModals}>Hủy</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Xóa</Button>
                </Modal.Footer>
            </Modal>
        </main>
    );
}

export default AdminProductsPage;