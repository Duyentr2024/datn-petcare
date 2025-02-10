import {useEffect, useState} from 'react';
import axios from 'axios';
import Swal from "sweetalert2";
import {toast} from "react-toastify";
import {useAuth} from "../../context/AuthContext";
import GHNService from "../../service/addressService/GHNService.jsx";

const Address = () => {
    const {user} = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [formData, setFormData] = useState({
        province: '',
        district: '',
        ward: '',
        street: '',
        addressDetail: '',
        isDefault: false
    });

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/addresses');
                setAddresses(Array.isArray(res.data) ? res.data : []);
            } catch {
                setError('Không thể tải danh sách địa chỉ');
                toast.error('Lỗi khi tải địa chỉ');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAddresses();
    }, []);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
                    headers: {'Token': '0fe4c8c9-71cd-11ef-9839-ea1b8b4124d2'}
                });
                setProvinces(res.data.data || []);
            } catch {
                toast.error('Lỗi khi tải danh sách tỉnh thành');
            }
        };
        fetchProvinces();
    }, []);

    const fetchDistricts = async (provinceId) => {
        if (!provinceId) {
            setDistricts([]);
            return [];
        }
        try {
            const districtData = await GHNService.getDistricts(provinceId);
            setDistricts(districtData);
            return districtData;
        } catch (error) {
            console.error("❌ Lỗi khi tải danh sách quận/huyện:", error);
            toast.error("Lỗi khi tải danh sách quận/huyện");
            return [];
        }
    };

    const fetchWards = async (districtId) => {
        if (!districtId) {
            setWards([]);
            return [];
        }
        try {
            const wardData = await GHNService.getWards(districtId);
            setWards(wardData);
            return wardData;
        } catch (error) {
            console.error("❌ Lỗi khi tải danh sách phường/xã:", error);
            toast.error("Lỗi khi tải danh sách phường/xã");
            return [];
        }
    };


    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'province') {
            setDistricts([]); // Xóa danh sách quận trước khi tải mới
            setWards([]); // Xóa danh sách phường trước khi tải mới
            setFormData(prev => ({...prev, district: '', ward: ''})); // Reset quận & phường
            fetchDistricts(value); // Gọi API lấy quận
        }

        if (name === 'district') {
            setWards([]); // Xóa danh sách phường trước khi tải mới
            setFormData(prev => ({...prev, ward: ''})); // Reset phường
            fetchWards(value); // Gọi API lấy phường
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.province || !formData.district || !formData.ward || !formData.street) {
            Swal.fire('Lỗi!', 'Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        if (!user || !user.userId) {
            Swal.fire('Lỗi!', 'Không tìm thấy thông tin người dùng', 'error');
            return;
        }

        // 🔹 Chuyển đổi ID thành tên
        const provinceObj = provinces.find(p => p.ProvinceID.toString() === formData.province);
        const districtObj = districts.find(d => d.DistrictID.toString() === formData.district);
        const wardObj = wards.find(w => w.WardCode.toString() === formData.ward);

        if (!provinceObj || !districtObj || !wardObj) {
            Swal.fire('Lỗi!', 'Không tìm thấy thông tin địa chỉ', 'error');
            return;
        }

        // 🔹 Tạo object gửi lên API
        const formattedData = {
            userId: user.userId, // 🔥 Thêm userId từ context
            province: provinceObj.ProvinceName,
            district: districtObj.DistrictName,
            ward: wardObj.WardName,
            street: formData.street,
            isDefault: formData.isDefault
        };

        console.log("📩 Dữ liệu gửi đi:", formattedData); // Kiểm tra log

        try {
            const apiMethod = editingAddress ? axios.put : axios.post;
            const url = editingAddress
                ? `http://localhost:8080/api/addresses/${editingAddress.addressId}`
                : 'http://localhost:8080/api/addresses';

            const res = await apiMethod(url, formattedData, {
                headers: {'Content-Type': 'application/json'},
            });

            setAddresses(prev =>
                editingAddress
                    ? prev.map(addr => addr.addressId === editingAddress.addressId ? res.data : addr)
                    : [...prev, res.data]
            );

            Swal.fire({
                icon: 'success',
                title: editingAddress ? 'Cập nhật thành công!' : 'Thêm địa chỉ thành công!',
                showConfirmButton: false,
                timer: 1500
            });

            setShowForm(false);
            setEditingAddress(null);
        } catch (err) {
            console.error("❌ Lỗi API:", err.response?.data);
            Swal.fire('Lỗi!', err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý', 'error');
        }
    };

    const handleDelete = async (addressId) => {
        const result = await Swal.fire({
            title: 'Bạn chắc chắn muốn xóa?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/addresses/${addressId}`);
                setAddresses(prev => prev.filter(addr => addr.addressId !== addressId));
                await Swal.fire('Đã xóa!', 'Địa chỉ đã được xóa thành công.', 'success');
            } catch {
                await Swal.fire('Lỗi!', 'Xóa địa chỉ thất bại', 'error');
            }
        }
    };

    const handleEdit = async (address) => {
        setEditingAddress(address);

        try {
            // 🔹 Tìm Province ID từ danh sách
            const provinceData = provinces.find(p => p.ProvinceName === address.province);
            const provinceId = provinceData?.ProvinceID || "";

            let districtData = [], districtId = "", wardData = [], wardId = "";

            if (provinceId) {
                // 🔹 Lấy danh sách quận/huyện từ API GHN
                districtData = await GHNService.getDistricts(provinceId);
                const district = districtData.find(d => d.DistrictName === address.district);
                districtId = district?.DistrictID || "";

                if (districtId) {
                    // 🔹 Lấy danh sách phường/xã từ API GHN
                    wardData = await GHNService.getWards(districtId);
                    const ward = wardData.find(w => w.WardName === address.ward);
                    wardId = ward?.WardCode || "";
                }
            }

            // 🔹 Cập nhật form sau khi đã tải đầy đủ dữ liệu
            setFormData({
                province: provinceId,
                district: districtId,
                ward: wardId,
                street: address.street || "",
                isDefault: address.isDefault || false,
            });

            setDistricts(districtData);
            setWards(wardData);
            setShowForm(true);
        } catch (error) {
            console.error("❌ Lỗi khi tải dữ liệu địa chỉ:", error);
        }
    };


    return (
        <div className="mx-auto">
            <h2 className="text-xl font-semibold text-[#FBB321] mb-4">Danh sách địa chỉ</h2>
            {isLoading ? (
                <p>Đang tải...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <ul className="space-y-2 mb-4">
                    {addresses.map((address) => (
                        <li key={address.addressId}
                            className="p-3 border rounded-lg bg-gray-100 flex justify-between items-center">
                            <div>
                                <p>
                                    <strong>{address.street}, {address.ward}, {address.district}, {address.province}</strong>
                                </p>
                                <p className="text-sm text-gray-500">{address.isDefault ? 'Mặc định' : ''}</p>
                            </div>
                            <div className="space-x-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded"
                                        onClick={() => handleEdit(address)}>Sửa
                                </button>
                                <button className="bg-red-500 text-white px-3 py-1 rounded"
                                        onClick={() => handleDelete(address.addressId)}>Xóa
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <button className="bg-[#FBB321] text-white py-2 px-4 rounded-lg w-full mb-4 hover:bg-yellow-500"
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) { // Nếu đang mở form mà bấm "Hủy"
                            setEditingAddress(null);
                            setFormData({
                                province: '',
                                district: '',
                                ward: '',
                                street: '',
                                isDefault: false
                            });
                            setDistricts([]); // Reset danh sách quận
                            setWards([]); // Reset danh sách phường
                        }
                    }}>
                {showForm ? 'Hủy' : 'Thêm địa chỉ mới'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="province" value={formData.province}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FBB321]"
                            onChange={handleInputChange} required>
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map(province => (
                            <option key={province.ProvinceID} value={province.ProvinceID}>
                                {province.ProvinceName}
                            </option>
                        ))}
                    </select>
                    <select name="district" value={formData.district}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FBB321]"
                            onChange={handleInputChange} required disabled={!formData.province}>
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(district => (
                            <option key={district.DistrictID} value={district.DistrictID}>
                                {district.DistrictName}
                            </option>
                        ))}
                    </select>
                    <select name="ward" value={formData.ward}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FBB321]"
                            onChange={handleInputChange} required disabled={!formData.district}>
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map(ward => (
                            <option key={ward.WardCode} value={ward.WardCode}>
                                {ward.WardName}
                            </option>
                        ))}
                    </select>
                    <input type="text" name="street" placeholder="Đường"
                           className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FBB321]"
                           value={formData.street} onChange={handleInputChange} required/>

                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="isDefault" checked={formData.isDefault}
                               onChange={handleInputChange}/>
                        <span>Đặt làm mặc định</span>
                    </label>

                    <button type="submit"
                            className="w-full bg-[#FBB321] text-white py-2 px-4 rounded-lg hover:bg-yellow-500">
                        {editingAddress ? 'Cập nhật' : 'Lưu'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Address;