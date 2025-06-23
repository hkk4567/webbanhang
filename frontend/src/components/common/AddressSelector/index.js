import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const API_BASE_URL = 'https://provinces.open-api.vn/api/';

/**
 * Component tái sử dụng cho việc chọn địa chỉ Tỉnh/Huyện/Xã.
 * @param {object} props
 * @param {function} props.onChange - Hàm callback được gọi mỗi khi địa chỉ thay đổi, trả về { provinceName, districtName, wardName }
 * @param {string} props.layout - 'horizontal' (mặc định) hoặc 'vertical'.
 */
function AddressSelector({ onChange, layout = 'horizontal', ...props }) {
    // State để quản lý mã code của các lựa chọn
    const [selectedCodes, setSelectedCodes] = useState({ city: '', district: '', ward: '' });

    // State để lưu danh sách lấy từ API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // --- CÁC EFFECT ĐỂ FETCH DỮ LIỆU ĐỘNG ---

    // 1. Lấy danh sách Tỉnh/Thành phố chỉ một lần khi component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}?depth=1`);
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách Tỉnh/Thành phố:", error);
            }
        };
        fetchProvinces();
    }, []); // Mảng rỗng đảm bảo chỉ chạy một lần

    // 2. Lấy danh sách Quận/Huyện khi Tỉnh/Thành phố thay đổi
    useEffect(() => {
        if (selectedCodes.city) {
            const fetchDistricts = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}p/${selectedCodes.city}?depth=2`);
                    const data = await response.json();
                    setDistricts(data.districts);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách Quận/Huyện:", error);
                    setDistricts([]); // Reset nếu có lỗi
                }
            };
            fetchDistricts();
        } else {
            // Nếu không có Tỉnh/TP nào được chọn, reset danh sách cấp dưới
            setDistricts([]);
            setWards([]);
        }
    }, [selectedCodes.city]); // Chạy lại mỗi khi mã tỉnh thay đổi

    // 3. Lấy danh sách Phường/Xã khi Quận/Huyện thay đổi
    useEffect(() => {
        if (selectedCodes.district) {
            const fetchWards = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}d/${selectedCodes.district}?depth=2`);
                    const data = await response.json();
                    setWards(data.wards);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách Phường/Xã:", error);
                    setWards([]); // Reset nếu có lỗi
                }
            };
            fetchWards();
        } else {
            // Nếu không có Quận/Huyện nào được chọn, reset danh sách xã
            setWards([]);
        }
    }, [selectedCodes.district]); // Chạy lại mỗi khi mã huyện thay đổi

    // --- EFFECT ĐỂ GỌI CALLBACK `onChange` ---
    // Sử dụng useCallback để không tạo lại hàm này ở mỗi lần render
    const triggerOnChange = useCallback(() => {
        if (onChange) {
            const provinceName = provinces.find(p => p.code === Number(selectedCodes.city))?.name || '';
            const districtName = districts.find(d => d.code === Number(selectedCodes.district))?.name || '';
            const wardName = wards.find(w => w.code === Number(selectedCodes.ward))?.name || '';

            onChange({ provinceName, districtName, wardName });
        }
    }, [onChange, selectedCodes, provinces, districts, wards]);

    // Effect này sẽ theo dõi sự thay đổi của các lựa chọn và các danh sách
    // để gọi lại hàm callback với dữ liệu tên đầy đủ và chính xác nhất.
    useEffect(() => {
        triggerOnChange();
    }, [triggerOnChange]);


    // --- HÀM HANDLER CHO SỰ KIỆN CỦA NGƯỜI DÙNG ---
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Cập nhật state nội bộ dựa trên lựa chọn của người dùng
        if (name === 'city') {
            setSelectedCodes({ city: value, district: '', ward: '' }); // Reset khi đổi tỉnh
        } else if (name === 'district') {
            setSelectedCodes(prev => ({ ...prev, district: value, ward: '' })); // Reset khi đổi huyện
        } else if (name === 'ward') {
            setSelectedCodes(prev => ({ ...prev, ward: value }));
        }
    };

    // --- RENDER ---
    const dropdowns = (
        <>
            <Form.Group as={layout === 'horizontal' ? Col : 'div'} md={layout === 'horizontal' ? "4" : ""} className="mb-3">
                <Form.Label>Tỉnh/Thành phố</Form.Label>
                <Form.Select name="city" value={selectedCodes.city} onChange={handleChange}>
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </Form.Select>
            </Form.Group>

            <Form.Group as={layout === 'horizontal' ? Col : 'div'} md={layout === 'horizontal' ? "4" : ""} className="mb-3">
                <Form.Label>Quận/Huyện</Form.Label>
                <Form.Select name="district" value={selectedCodes.district} onChange={handleChange} disabled={!selectedCodes.city}>
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </Form.Select>
            </Form.Group>

            <Form.Group as={layout === 'horizontal' ? Col : 'div'} md={layout === 'horizontal' ? "4" : ""} className="mb-3">
                <Form.Label>Phường/Xã</Form.Label>
                <Form.Select name="ward" value={selectedCodes.ward} onChange={handleChange} disabled={!selectedCodes.district}>
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </Form.Select>
            </Form.Group>
        </>
    );

    if (layout === 'vertical') {
        return <div {...props}>{dropdowns}</div>;
    }

    return <Row {...props}>{dropdowns}</Row>;
}

export default AddressSelector;