import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const API_BASE_URL = 'https://provinces.open-api.vn/api/';

/**
 * Component tái sử dụng cho việc chọn địa chỉ Tỉnh/Huyện/Xã.
 * @param {object} props
 * @param {function} props.onChange - Hàm callback được gọi mỗi khi địa chỉ thay đổi, trả về { city, district, ward }
 * @param {object} [props.initialValue] - Tùy chọn: giá trị địa chỉ ban đầu { city, district, ward }
 */
function AddressSelector({ onChange, initialValue, layout = 'horizontal', ...props }) {
    // State nội bộ để quản lý các lựa chọn
    const [selected, setSelected] = useState({
        city: initialValue?.city || '',
        district: initialValue?.district || '',
        ward: initialValue?.ward || '',
    });

    // State nội bộ để lưu danh sách từ API
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // 1. Lấy danh sách Tỉnh/Thành phố
    useEffect(() => {
        const fetchProvinces = async () => {
            const response = await fetch(API_BASE_URL);
            const data = await response.json();
            setProvinces(data);
        };
        fetchProvinces();
    }, []);

    // 2. Tự động điền dữ liệu khi có initialValue
    useEffect(() => {
        const populateInitialData = async () => {
            if (initialValue?.city && provinces.length > 0) {
                const provinceCode = provinces.find(p => p.name === initialValue.city)?.code;
                if (!provinceCode) return;

                setSelected(prev => ({ ...prev, city: provinceCode }));

                const districtResponse = await fetch(`${API_BASE_URL}p/${provinceCode}?depth=2`);
                const districtData = await districtResponse.json();
                setDistricts(districtData.districts);

                const districtCode = districtData.districts.find(d => d.name === initialValue.district)?.code;
                if (!districtCode) return;

                setSelected(prev => ({ ...prev, district: districtCode }));

                const wardResponse = await fetch(`${API_BASE_URL}d/${districtCode}?depth=2`);
                const wardData = await wardResponse.json();
                setWards(wardData.wards);

                const wardCode = wardData.wards.find(w => w.name === initialValue.ward)?.code;
                setSelected(prev => ({ ...prev, ward: wardCode || '' }));
            }
        }
        populateInitialData();
    }, [initialValue, provinces]);


    // 3. Xử lý khi người dùng chọn
    const handleChange = async (e) => {
        const { name, value } = e.target; // name là 'city', 'district', 'ward'. value là 'code'.

        let newSelection = { ...selected };

        if (name === 'city') {
            newSelection = { city: value, district: '', ward: '' }; // Cập nhật city, reset district và ward
            setDistricts([]);
            setWards([]);
            if (value) {
                const response = await fetch(`${API_BASE_URL}p/${value}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts);
            }
        } else if (name === 'district') {
            newSelection = { ...newSelection, district: value, ward: '' }; // Cập nhật district, reset ward
            setWards([]);
            if (value) {
                const response = await fetch(`${API_BASE_URL}d/${value}?depth=2`);
                const data = await response.json();
                setWards(data.wards);
            }
        } else if (name === 'ward') {
            newSelection = { ...newSelection, ward: value }; // Chỉ cập nhật ward
        }

        setSelected(newSelection); // Cập nhật state nội bộ

        // Gọi callback onChange với object chứa tên đầy đủ để component cha sử dụng
        if (onChange) {
            onChange({
                city: provinces.find(p => p.code === +newSelection.city)?.name || '',
                district: districts.find(d => d.code === +newSelection.district)?.name || '',
                ward: wards.find(w => w.code === +newSelection.ward)?.name || ''
            });
        }
    };

    const dropdowns = (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Tỉnh/Thành phố</Form.Label>
                <Form.Select name="city" value={selected.city} onChange={handleChange}>
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Quận/Huyện</Form.Label>
                <Form.Select name="district" value={selected.district} onChange={handleChange} disabled={!selected.city}>
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Phường/Xã</Form.Label>
                <Form.Select name="ward" value={selected.ward} onChange={handleChange} disabled={!selected.district}>
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </Form.Select>
            </Form.Group>
        </>
    );
    // Render bố cục dựa trên prop 'layout'
    if (layout === 'vertical') {
        return <div {...props}>{dropdowns}</div>;
    }
    return (
        <Row {...props}>
            <Col md={4}>{dropdowns.props.children[0]}</Col>
            <Col md={4}>{dropdowns.props.children[1]}</Col>
            <Col md={4}>{dropdowns.props.children[2]}</Col>
        </Row>
    );
}

export default AddressSelector;