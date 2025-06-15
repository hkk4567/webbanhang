import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import AddressSelector from '../../../../components/common/AddressSelector';

// Thêm các trường mới vào trạng thái ban đầu
const initialState = {
    name: '', email: '', phone: '', address: '', city: '', district: '', ward: '',
    password: '', confirmPassword: '', type: ''
};

function CustomerFormModal({ show, handleClose, onSave, customerToEdit }) {
    const [formData, setFormData] = useState(initialState);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Xác định chế độ "Sửa" hay "Thêm"
        const editing = !!customerToEdit;
        setIsEditing(editing);

        if (editing) {
            setFormData({
                // Giữ lại các trường cũ
                name: customerToEdit.name || '',
                email: customerToEdit.email || '',
                phone: customerToEdit.phone || '',
                address: customerToEdit.address || '',
                city: customerToEdit.city || '',
                district: customerToEdit.district || '',
                ward: customerToEdit.ward || '',
                // Không điền mật khẩu vào form khi sửa
                password: '',
                confirmPassword: '',
                // Có thể thêm trường type nếu cần sửa
                type: customerToEdit.type || '',
            });
        } else {
            // Reset toàn bộ form khi ở chế độ "Thêm mới"
            setFormData(initialState);
        }
    }, [customerToEdit, show]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (addressData) => {
        setFormData(prev => ({
            ...prev,
            city: addressData.city,
            district: addressData.district,
            ward: addressData.ward,
        }));
    };

    const handleSaveClick = () => {
        // Validate mật khẩu khi thêm mới
        if (!isEditing && formData.password !== formData.confirmPassword) {
            alert('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại.');
            return;
        }

        // Tạo một object dữ liệu để gửi đi, loại bỏ confirmPassword
        const dataToSave = { ...formData };
        delete dataToSave.confirmPassword;

        onSave({ ...dataToSave, id: customerToEdit?.id });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEditing ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        {/* Các trường thông tin cơ bản */}
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>ID</Form.Label><Form.Control type="text" value={customerToEdit?.id || 'Tự động'} disabled /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Họ và tên</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleChange} disabled={isEditing} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} /></Form.Group></Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Loại tài khoản</Form.Label>
                                <Form.Select name="type" value={formData.type} onChange={handleChange} required>
                                    <option value="">-- Lựa chọn --</option>
                                    <option value="Khách mới">Khách mới</option>
                                    <option value="Thành viên Bạc">Thành viên Bạc</option>
                                    <option value="Thành viên Vàng">Thành viên Vàng</option>
                                    <option value="Thành viên Kim Cương">Thành viên Kim Cương</option>
                                    <option value="Admin">Admin (Tài khoản quản trị)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {/* --- RENDER CÓ ĐIỀU KIỆN --- */}
                        {!isEditing && (
                            <>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <Form.Control type="password" name="password" placeholder="Nhập mật khẩu" value={formData.password} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nhập lại mật khẩu</Form.Label>
                                        <Form.Control type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                        <Col xs={12}><Form.Group className="mb-3"><Form.Label>Địa chỉ (Số nhà, tên đường)</Form.Label><Form.Control type="text" name="address" value={formData.address} onChange={handleChange} /></Form.Group></Col>
                    </Row>

                    {/* Component AddressSelector */}
                    <AddressSelector
                        onChange={handleAddressChange}
                        // Dùng key để reset AddressSelector khi đổi giữa các khách hàng
                        key={customerToEdit?.id || 'new-customer'}
                        initialValue={isEditing ? { city: formData.city, district: formData.district, ward: formData.ward } : null}
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Hủy</Button>
                <Button variant="primary" onClick={handleSaveClick}>Lưu</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CustomerFormModal;