import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

// Trạng thái ban đầu cho form khi thêm sản phẩm mới
const initialState = {
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '', // Sẽ là ID của danh mục
    status: 'active', // Khớp với giá trị trong DB
};

function ProductFormModal({ show, handleClose, onSave, productToEdit, categories }) {
    const [formData, setFormData] = useState(initialState);
    const [imageFile, setImageFile] = useState(null); // State riêng cho file ảnh mới
    const [imagePreview, setImagePreview] = useState(null); // State cho URL xem trước
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // useEffect để điền dữ liệu vào form khi ở chế độ "Sửa" hoặc reset khi "Thêm"
    useEffect(() => {
        if (show) { // Chỉ chạy logic khi modal được mở
            if (productToEdit) {
                // Chế độ sửa: điền dữ liệu từ props
                setFormData({
                    name: productToEdit.name || '',
                    description: productToEdit.description || '',
                    price: productToEdit.price || '',
                    quantity: productToEdit.quantity || '',
                    categoryId: productToEdit.categoryId || '',
                    status: productToEdit.status || 'active',
                });
                setImagePreview(productToEdit.imageUrl || null); // Hiển thị ảnh cũ từ URL
                setImageFile(null); // Reset file ảnh mới
            } else {
                // Chế độ thêm: reset về trạng thái ban đầu
                setFormData(initialState);
                setImagePreview(null);
                setImageFile(null);
            }
            setError(''); // Luôn xóa lỗi cũ khi mở modal
        }
    }, [productToEdit, show]);

    // Hàm xử lý chung cho các ô input text, number, select
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý khi người dùng chọn một file ảnh mới
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // Lưu file object vào state riêng
            setImagePreview(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước
        }
    };

    // Xóa ảnh xem trước và dữ liệu ảnh
    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Xử lý khi nhấn nút "Lưu"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // 1. Tạo đối tượng FormData
        const formDataToSend = new FormData();

        // 2. Append tất cả các trường dữ liệu vào FormData
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });

        // 3. Append file ảnh mới nếu có
        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }

        try {
            // 4. Gọi hàm onSave được truyền từ component cha
            await onSave(formDataToSend);
            // Component cha sẽ tự đóng modal và tải lại dữ liệu
        } catch (err) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{productToEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        {/* CỘT PHẢI - Ảnh sản phẩm */}
                        <Col md={5}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ảnh sản phẩm</Form.Label>
                                <div className="border rounded d-flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Xem trước" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <span className="text-muted">Chưa có ảnh</span>
                                    )}
                                </div>
                                <Form.Control type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                                <div className="d-flex mt-2">
                                    <Button variant="outline-primary" size="sm" onClick={() => fileInputRef.current.click()} disabled={isLoading}>
                                        <i className="bi bi-upload me-2"></i>Chọn ảnh
                                    </Button>
                                    {imagePreview && (
                                        <Button variant="outline-danger" size="sm" className="ms-2" onClick={handleRemoveImage} disabled={isLoading}>
                                            <i className="bi bi-trash me-2"></i>Xóa ảnh
                                        </Button>
                                    )}
                                </div>
                            </Form.Group>
                        </Col>

                        {/* CỘT TRÁI - Thông tin sản phẩm */}
                        <Col md={7}>
                            <Form.Group className="mb-3">
                                <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
                            </Form.Group>

                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Giá bán <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required min="0" disabled={isLoading} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tồn kho <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" disabled={isLoading} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                                        <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange} required disabled={isLoading}>
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Trạng thái</Form.Label>
                                        <Form.Select name="status" value={formData.status} onChange={handleChange} disabled={isLoading}>
                                            <option value="active">Đang hoạt động</option>
                                            <option value="inactive">Đã ẩn</option>
                                            <option value="out_of_stock">Hết hàng</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả sản phẩm</Form.Label>
                                <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleChange} disabled={isLoading} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                <span className="ms-2">Đang lưu...</span>
                            </>
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ProductFormModal;