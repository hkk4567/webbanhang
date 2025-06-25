import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const API_BASE_URL = 'https://provinces.open-api.vn/api/';

/**
 * Component tái sử dụng cho việc chọn địa chỉ Tỉnh/Huyện/Xã.
 * @param {object} props
 * @param {function} props.onChange - Hàm callback được gọi mỗi khi địa chỉ thay đổi, trả về { provinceName, districtName, wardName }
 * @param {string} props.layout - 'horizontal' (mặc định) hoặc 'vertical'.
 */
function AddressSelector({ onChange, initialValue, layout = 'horizontal', ...props }) {
    const [selectedCodes, setSelectedCodes] = useState({ city: '', district: '', ward: '' });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Ref để theo dõi xem người dùng đã tương tác hay chưa.
    // Nếu đã tương tác, chúng ta sẽ không áp dụng initialValue nữa.
    const hasUserInteracted = useRef(false);

    // Ref để tránh gọi onChange trong lần render đầu tiên
    const isFirstRender = useRef(true);

    // --- LOGIC TẢI DỮ LIỆU ---

    // 1. Tải danh sách Tỉnh/Thành phố (chỉ 1 lần khi component mount)
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}?depth=1`);
                const data = await res.json();
                setProvinces(data);
            } catch (error) {
                console.error("Lỗi tải Tỉnh/Thành phố:", error);
            }
        };
        fetchProvinces();
    }, []);

    // 2. Tải danh sách Quận/Huyện khi Tỉnh/Thành phố thay đổi
    useEffect(() => {
        if (!selectedCodes.city) {
            setDistricts([]);
            setWards([]); // Reset cả xã khi tỉnh thay đổi
            return;
        }
        const fetchDistricts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}p/${selectedCodes.city}?depth=2`);
                const data = await res.json();
                setDistricts(data.districts);
            } catch (error) {
                console.error("Lỗi tải Quận/Huyện:", error);
                setDistricts([]);
            }
        };
        fetchDistricts();
    }, [selectedCodes.city]);

    // 3. Tải danh sách Phường/Xã khi Quận/Huyện thay đổi
    useEffect(() => {
        if (!selectedCodes.district) {
            setWards([]);
            return;
        }
        const fetchWards = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}d/${selectedCodes.district}?depth=2`);
                const data = await res.json();
                setWards(data.wards);
            } catch (error) {
                console.error("Lỗi tải Phường/Xã:", error);
                setWards([]);
            }
        };
        fetchWards();
    }, [selectedCodes.district]);


    // --- LOGIC XỬ LÝ GIÁ TRỊ BAN ĐẦU (INITIAL VALUE) ---

    // 4. Thiết lập Tỉnh ban đầu khi danh sách tỉnh đã được tải
    useEffect(() => {
        // Chỉ chạy khi: chưa có tương tác từ người dùng, có danh sách tỉnh và có giá trị tỉnh ban đầu
        if (!hasUserInteracted.current && provinces.length > 0 && initialValue?.city) {
            const provinceFound = provinces.find(p => p.name === initialValue.city);
            // Chỉ cập nhật nếu tìm thấy và code chưa được set
            if (provinceFound && selectedCodes.city !== provinceFound.code.toString()) {
                setSelectedCodes({ city: provinceFound.code.toString(), district: '', ward: '' });
            }
        }
    }, [provinces, initialValue, selectedCodes.city]);

    // 5. Thiết lập Huyện ban đầu khi danh sách huyện đã được tải
    useEffect(() => {
        // Chỉ chạy khi: chưa có tương tác, có danh sách huyện và có giá trị huyện ban đầu
        if (!hasUserInteracted.current && districts.length > 0 && initialValue?.district) {
            const districtFound = districts.find(d => d.name === initialValue.district);
            // Chỉ cập nhật nếu tìm thấy và code chưa được set
            if (districtFound && selectedCodes.district !== districtFound.code.toString()) {
                setSelectedCodes(prev => ({ ...prev, district: districtFound.code.toString() }));
            }
        }
    }, [districts, initialValue, selectedCodes.district]);

    // 6. Thiết lập Xã ban đầu khi danh sách xã đã được tải
    useEffect(() => {
        // Chỉ chạy khi: chưa có tương tác, có danh sách xã và có giá trị xã ban đầu
        if (!hasUserInteracted.current && wards.length > 0 && initialValue?.ward) {
            const wardFound = wards.find(w => w.name === initialValue.ward);
            // Chỉ cập nhật nếu tìm thấy và code chưa được set
            if (wardFound && selectedCodes.ward !== wardFound.code.toString()) {
                setSelectedCodes(prev => ({ ...prev, ward: wardFound.code.toString() }));
            }
        }
    }, [wards, initialValue, selectedCodes.ward]);


    // --- HÀM HANDLER & CALLBACK ---

    // 7. Gọi callback `onChange` khi địa chỉ hoàn chỉnh thay đổi
    useEffect(() => {
        // Bỏ qua lần render đầu tiên để không gọi onChange với giá trị trống
        if (isFirstRender.current) {
            // Nếu có initialValue, đợi đến khi xã được chọn rồi mới bỏ cờ
            if (initialValue?.ward && selectedCodes.ward) {
                isFirstRender.current = false;
            } else if (!initialValue?.ward) {
                isFirstRender.current = false;
            }
            return;
        }

        if (onChange) {
            const provinceName = provinces.find(p => p.code.toString() === selectedCodes.city)?.name || '';
            const districtName = districts.find(d => d.code.toString() === selectedCodes.district)?.name || '';
            const wardName = wards.find(w => w.code.toString() === selectedCodes.ward)?.name || '';

            // Chỉ gọi callback khi có sự thay đổi thực sự
            onChange({ provinceName, districtName, wardName });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCodes, onChange]); // Chỉ phụ thuộc vào selectedCodes để kích hoạt


    const handleChange = (e) => {
        // ĐÁNH DẤU người dùng đã tương tác, vô hiệu hóa việc set initialValue
        hasUserInteracted.current = true;

        const { name, value } = e.target;
        if (name === 'city') {
            setSelectedCodes({ city: value, district: '', ward: '' });
        } else if (name === 'district') {
            setSelectedCodes(prev => ({ ...prev, district: value, ward: '' }));
        } else {
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