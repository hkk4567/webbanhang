import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

function CategoryFormModal({ show, handleClose, onSave, categoryToEdit }) {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
        } else {
            // Reset form khi mở modal thêm mới
            setName('');
        }
        setErrors({}); // Xóa lỗi cũ khi mở modal
    }, [categoryToEdit, show]);

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = 'Tên danh mục không được để trống.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        await onSave({ name });
        setIsSaving(false);
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{categoryToEdit ? 'Sửa Danh mục' : 'Thêm Danh mục mới'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="categoryName">
                        <Form.Label>Tên danh mục <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên danh mục"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isInvalid={!!errors.name}
                            autoFocus
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isSaving}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <><Spinner as="span" size="sm" /> Đang lưu...</>
                        ) : (
                            'Lưu thay đổi'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default CategoryFormModal;