import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import AddressSelector from '../../../../components/common/AddressSelector';

// Thêm các trường mới vào trạng thái ban đầu
const initialState = {
    fullName: '',       // Sửa từ 'name'
    email: '',
    phone: '',
    role: 'customer',   // Sửa từ 'type' và đặt giá trị mặc định
    streetAddress: '',  // Sửa từ 'address'
    ward: '',
    district: '',
    province: '',
    password: '',
    confirmPassword: '',
};

function CustomerFormModal({ show, handleClose, onSave, customerToEdit }) {
    const [formData, setFormData] = useState(initialState);
    const [isEditing, setIsEditing] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    useEffect(() => {
        // Xác định chế độ "Sửa" hay "Thêm"
        const editing = !!customerToEdit;
        setIsEditing(editing);

        if (editing) {
            setFormData({
                fullName: customerToEdit.fullName || '',
                email: customerToEdit.email || '',
                phone: customerToEdit.phone || '',
                role: customerToEdit.role || 'customer',
                streetAddress: customerToEdit.streetAddress || '',
                ward: customerToEdit.ward || '',
                district: customerToEdit.district || '',
                province: customerToEdit.province || '',
                password: '', // Luôn để trống mật khẩu khi sửa
                confirmPassword: '',
            });
        } else {
            // Reset toàn bộ form khi ở chế độ "Thêm mới"
            setFormData(initialState);
        }
    }, [customerToEdit, show]);

    const handleChange = useCallback((e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
            setPasswordError('');
        }
    }, []);

    const handleAddressChange = useCallback((addressData) => {
        // `addressData` là cái mới từ AddressSelector, ví dụ: { provinceName: 'A', districtName: 'B', wardName: 'C' }

        // `prev` là state `formData` hiện tại
        setFormData(prev => {
            // Lấy ra các giá trị địa chỉ hiện tại từ state
            const currentProvince = prev.province;
            const currentDistrict = prev.district;
            const currentWard = prev.ward;

            // Lấy các giá trị mới từ callback
            const newProvince = addressData.provinceName;
            const newDistrict = addressData.districtName;
            const newWard = addressData.wardName;

            // --- ĐIỀU KIỆN QUYẾT ĐỊNH ---
            // So sánh xem có sự thay đổi thực sự nào không
            const hasChanged =
                currentProvince !== newProvince ||
                currentDistrict !== newDistrict ||
                currentWard !== newWard;

            // Nếu không có gì thay đổi, trả về state cũ để tránh re-render và ghi đè
            if (!hasChanged) {
                return prev;
            }

            // Nếu có sự thay đổi, tiến hành cập nhật state
            // Logic reset cấp dưới khi cấp trên thay đổi
            let updatedDistrict = newDistrict;
            let updatedWard = newWard;

            if (currentProvince !== newProvince) {
                // Nếu đổi tỉnh, reset huyện và xã
                updatedDistrict = '';
                updatedWard = '';
            } else if (currentDistrict !== newDistrict) {
                // Nếu chỉ đổi huyện, reset xã
                updatedWard = '';
            }

            // Trả về state mới đã được cập nhật chính xác
            return {
                ...prev,
                province: newProvince,
                district: updatedDistrict,
                ward: updatedWard,
            };
        });
    }, []);
    const handleSaveClick = () => {
        // --- BƯỚC 3: Validate dữ liệu và chuẩn bị gửi đi ---
        // Validate mật khẩu chỉ khi thêm mới
        if (!isEditing && formData.password !== formData.confirmPassword) {
            setPasswordError('Mật khẩu nhập lại không khớp.');
            return;
        }

        // Tạo một object dữ liệu để gửi đi
        const dataToSave = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            streetAddress: formData.streetAddress,
            ward: formData.ward,
            district: formData.district,
            province: formData.province,
        };
        console.log('Data to save:', dataToSave);

        // Chỉ thêm mật khẩu vào object nếu nó được nhập (khi thêm mới)
        if (!isEditing && formData.password) {
            dataToSave.password = formData.password;
        }

        // Gọi hàm onSave từ component cha với dữ liệu đã chuẩn hóa
        onSave({ ...dataToSave, id: customerToEdit?.id });
        // Không cần gọi handleClose ở đây, component cha sẽ làm điều đó
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
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Họ và tên</Form.Label><Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleChange} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={formData.email} onChange={handleChange} disabled={isEditing} required /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} /></Form.Group></Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Loại tài khoản</Form.Label>
                                <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                                    <option value="customer">Customer</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {/* --- RENDER CÓ ĐIỀU KIỆN --- */}
                        {!isEditing && (
                            <>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <Form.Control type="password" name="password" placeholder="Nhập mật khẩu" value={formData.password} onChange={handleChange} required isInvalid={!!passwordError} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nhập lại mật khẩu</Form.Label>
                                        <Form.Control type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required isInvalid={!!passwordError} />
                                        <Form.Control.Feedback type="invalid">
                                            {passwordError}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                        <Col xs={12}><Form.Group className="mb-3"><Form.Label>Địa chỉ (Số nhà, tên đường)</Form.Label><Form.Control type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} /></Form.Group></Col>
                        {/* Component AddressSelector */}
                        <AddressSelector
                            onChange={handleAddressChange}
                            // Dùng key để reset AddressSelector khi đổi giữa các khách hàng
                            key={customerToEdit?.id || 'new-customer'}
                            initialValue={isEditing ? {
                                city: customerToEdit.province,
                                district: customerToEdit.district,
                                ward: customerToEdit.ward
                            } : null}
                        />
                    </Row>

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