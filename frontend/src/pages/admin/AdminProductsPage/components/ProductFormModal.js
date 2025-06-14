import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

// Trạng thái ban đầu cho form khi thêm sản phẩm mới
const initialState = {
    name: '',
    stock: 0,
    price: 0,
    category: '',
    description: '',
    size: '',
    status: 'available',
    image: null, // Sẽ giữ URL ảnh hiện tại hoặc file ảnh mới
};

function ProductFormModal({ show, handleClose, onSave, productToEdit }) {
    const [formData, setFormData] = useState(initialState);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null); // Ref để trigger input file ẩn

    // useEffect để điền dữ liệu vào form khi ở chế độ "Sửa"
    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name || '',
                stock: productToEdit.stock || 0,
                price: productToEdit.price || 0,
                category: productToEdit.category || '',
                description: productToEdit.description || '',
                size: productToEdit.size || '',
                status: productToEdit.stock > 0 ? 'available' : 'hidden',
                image: productToEdit.image, // Lưu link ảnh cũ
            });
            setImagePreview(productToEdit.image); // Hiển thị ảnh cũ
        } else {
            // Reset form khi ở chế độ "Thêm mới"
            setFormData(initialState);
            setImagePreview(null);
        }
    }, [productToEdit, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý khi người dùng chọn một file ảnh mới
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file })); // Lưu file object vào state
            setImagePreview(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước
        }
    };

    // Xóa ảnh xem trước và dữ liệu ảnh
    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset input file để có thể chọn lại cùng 1 file
        }
    }

    const handleSaveClick = () => {
        onSave({ ...formData, id: productToEdit?.id });
        handleClose();
    };


    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{productToEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        {/* CỘT TRÁI */}
                        <Col md={6}>
                            {productToEdit && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Mã sản phẩm</Form.Label>
                                    <Form.Control type="text" value={productToEdit.id} disabled />
                                </Form.Group>
                            )}
                            <Form.Group className="mb-3">
                                <Form.Label>Tên sản phẩm</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Số lượng</Form.Label>
                                <Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Giá bán</Form.Label>
                                <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Dung tích</Form.Label>
                                <Form.Control type="text" name="size" value={formData.size} onChange={handleChange} placeholder="VD: 250ml" />
                            </Form.Group>
                        </Col>

                        {/* CỘT PHẢI */}
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Ảnh sản phẩm</Form.Label>
                                <div
                                    className="mb-2 border rounded"
                                    style={{
                                        height: '200px',
                                        width: '100%',
                                        backgroundColor: '#f8f9fa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Xem trước"
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    ) : (
                                        <span className="text-muted">Chưa có ảnh</span>
                                    )}
                                </div>
                                <Form.Control type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                                <div className="d-flex">
                                    <Button variant="outline-secondary" size="sm" onClick={() => fileInputRef.current.click()}>Chọn ảnh mới</Button>
                                    {imagePreview && <Button variant="outline-danger" size="sm" className="ms-2" onClick={handleRemoveImage}>Xóa ảnh</Button>}
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Danh mục</Form.Label>
                                <Form.Select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="">-- Chọn danh mục --</option>
                                    <option value="Cà phê">Cà phê</option>
                                    <option value="Trà">Trà</option>
                                    <option value="Nước ép">Nước ép</option>
                                    <option value="Bánh ngọt">Bánh ngọt</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Trạng thái</Form.Label>
                                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="available">Còn hàng (Available)</option>
                                    <option value="hidden">Ẩn (Hidden)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {/* MÔ TẢ */}
                        <Col xs={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Mô tả sản phẩm</Form.Label>
                                <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Hủy</Button>
                <Button variant="primary" onClick={handleSaveClick}>Lưu thay đổi</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ProductFormModal;