import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import AddressSelector from '../../../../components/common/AddressSelector'; // <-- IMPORT COMPONENT MỚI

const initialState = { name: '', email: '', phone: '', address: '', city: '', district: '', ward: '' };

function CustomerFormModal({ show, handleClose, onSave, customerToEdit }) {
    const [formData, setFormData] = useState(initialState);

    // useEffect để điền dữ liệu vào form khi ở chế độ "Sửa" hoặc reset khi "Thêm"
    useEffect(() => {
        if (customerToEdit) {
            setFormData({
                name: customerToEdit.name || '',
                email: customerToEdit.email || '',
                phone: customerToEdit.phone || '',
                address: customerToEdit.address || '',
                city: customerToEdit.city || '',
                district: customerToEdit.district || '',
                ward: customerToEdit.ward || '',
            });
        } else {
            setFormData(initialState);
        }
    }, [customerToEdit, show]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Hàm callback nhận dữ liệu từ AddressSelector
    const handleAddressChange = (addressData) => {
        setFormData(prev => ({
            ...prev,
            city: addressData.city,
            district: addressData.district,
            ward: addressData.ward,
        }));
    };

    const handleSaveClick = () => {
        onSave({ ...formData, id: customerToEdit?.id });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{customerToEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        {/* Các trường thông tin khác */}
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>ID</Form.Label><Form.Control type="text" value={customerToEdit?.id || 'Tự động'} disabled /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Họ và tên</Form.Label><Form.Control type="text" name="name" value={formData.name} onChange={handleChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!customerToEdit} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} /></Form.Group></Col>
                        <Col xs={12}><Form.Group className="mb-3"><Form.Label>Địa chỉ (Số nhà, tên đường)</Form.Label><Form.Control type="text" name="address" value={formData.address} onChange={handleChange} /></Form.Group></Col>
                    </Row>

                    {/* --- SỬ DỤNG COMPONENT AddressSelector --- */}
                    <AddressSelector
                        onChange={handleAddressChange}
                        initialValue={customerToEdit ? { city: formData.city, district: formData.district, ward: formData.ward } : null}
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