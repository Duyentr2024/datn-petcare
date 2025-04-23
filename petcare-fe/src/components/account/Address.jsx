import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import GHNService from "../../service/addressService/GHNService.jsx";

const Address = () => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [formData, setFormData] = useState({
        province: "",
        district: "",
        ward: "",
        street: "",
        isDefault: false,
    });
    const districtCache = useMemo(() => new Map(), []);
    const wardCache = useMemo(() => new Map(), []);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const provinceData = await GHNService.getProvinces();
                setProvinces(provinceData);
            } catch (error) {
                toast.error("Lỗi khi tải danh sách tỉnh thành");
            }
        };
        fetchProvinces();

        const fetchAddresses = async () => {
            if (!user?.userId) return;

            try {
                const res = await axios.get(`http://localhost:8080/api/addresses/user/${user.userId}`);
                setAddresses(Array.isArray(res.data) ? res.data : []);
            } catch {
                setError("Không thể tải danh sách địa chỉ");
                toast.error("Lỗi khi tải địa chỉ");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAddresses();
    }, [user.userId]);

    const fetchDistricts = async (provinceId) => {
        if (!provinceId) {
            setDistricts([]);
            setWards([]);
            return;
        }

        if (districtCache.has(provinceId)) {
            setDistricts(districtCache.get(provinceId));
            return;
        }

        try {
            const districtData = await GHNService.getDistricts(provinceId);
            setDistricts(districtData);
            districtCache.set(provinceId, districtData);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách quận/huyện");
            setDistricts([]);
        }
    };

    const fetchWards = async (districtId) => {
        if (!districtId) {
            setWards([]);
            return;
        }

        if (wardCache.has(districtId)) {
            setWards(wardCache.get(districtId));
            return;
        }

        try {
            const wardData = await GHNService.getWards(districtId);
            setWards(wardData);
            wardCache.set(districtId, wardData);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách phường/xã");
            setWards([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (name === "province") {
            setFormData((prev) => ({ ...prev, district: "", ward: "" }));
            fetchDistricts(value);
        }

        if (name === "district") {
            setFormData((prev) => ({ ...prev, ward: "" }));
            fetchWards(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.province || !formData.district || !formData.ward || !formData.street) {
            Swal.fire("Lỗi!", "Vui lòng điền đầy đủ thông tin", "error");
            return;
        }

        if (!user || !user.userId) {
            Swal.fire("Lỗi!", "Không tìm thấy thông tin người dùng", "error");
            return;
        }

        const provinceObj = provinces.find((p) => p.ProvinceID.toString() === formData.province);
        const districtObj = districts.find((d) => d.DistrictID.toString() === formData.district);
        const wardObj = wards.find((w) => w.WardCode.toString() === formData.ward);

        if (!provinceObj || !districtObj || !wardObj) {
            Swal.fire("Lỗi!", "Thông tin địa chỉ không hợp lệ", "error");
            return;
        }

        const formattedData = {
            userId: user.userId,
            province: provinceObj.ProvinceName,
            district: districtObj.DistrictName,
            ward: wardObj.WardName,
            street: formData.street,
            isDefault: formData.isDefault,
        };

        try {
            const apiMethod = editingAddress ? axios.put : axios.post;
            const url = editingAddress
                ? `http://localhost:8080/api/addresses/${editingAddress.addressId}`
                : "http://localhost:8080/api/addresses";

            const res = await apiMethod(url, formattedData, {
                headers: { "Content-Type": "application/json" },
            });

            setAddresses((prev) =>
                editingAddress
                    ? prev.map((addr) => (addr.addressId === editingAddress.addressId ? res.data : addr))
                    : [...prev, res.data]
            );

            Swal.fire({
                icon: "success",
                title: editingAddress ? "Cập nhật thành công!" : "Thêm địa chỉ thành công!",
                showConfirmButton: false,
                timer: 1500,
            });

            setShowForm(false);
            setEditingAddress(null);
            setFormData({
                province: "",
                district: "",
                ward: "",
                street: "",
                isDefault: false,
            });
            setDistricts([]);
            setWards([]);
        } catch (err) {
            Swal.fire("Lỗi!", err.response?.data?.message || "Có lỗi xảy ra", "error");
        }
    };

    const handleDelete = async (addressId) => {
        const result = await Swal.fire({
            title: "Bạn chắc chắn muốn xóa?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Đồng ý!",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/addresses/${addressId}`);
                setAddresses((prev) => prev.filter((addr) => addr.addressId !== addressId));
                await Swal.fire("Đã xóa!", "Địa chỉ đã được xóa thành công.", "success");
            } catch {
                await Swal.fire("Lỗi!", "Xóa địa chỉ thất bại", "error");
            }
        }
    };

    const handleEdit = async (address) => {
        setEditingAddress(address);

        try {
            const provinceData = provinces.find((p) => p.ProvinceName === address.province);
            const provinceId = provinceData?.ProvinceID || "";

            if (!provinceId) {
                toast.error("Không tìm thấy tỉnh/thành phố trong danh sách");
                return;
            }

            let districtData = [];
            let districtId = "";
            let wardData = [];
            let wardId = "";

            districtData = districtCache.has(provinceId)
                ? districtCache.get(provinceId)
                : await GHNService.getDistricts(provinceId);
            districtCache.set(provinceId, districtData);
            setDistricts(districtData);

            const district = districtData.find((d) => d.DistrictName === address.district);
            districtId = district?.DistrictID || "";

            if (!districtId) {
                toast.error("Không tìm thấy quận/huyện trong danh sách");
                return;
            }

            wardData = wardCache.has(districtId)
                ? wardCache.get(districtId)
                : await GHNService.getWards(districtId);
            wardCache.set(districtId, wardData);
            setWards(wardData);

            const ward = wardData.find((w) => w.WardName === address.ward);
            wardId = ward?.WardCode || "";

            if (!wardId) {
                toast.error("Không tìm thấy phường/xã trong danh sách");
                return;
            }

            setFormData({
                province: provinceId.toString(),
                district: districtId.toString(),
                ward: wardId.toString(),
                street: address.street || "",
                isDefault: address.isDefault || false,
            });

            setShowForm(true);
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu địa chỉ để chỉnh sửa");
        }
    };

    return (
        <div className="flex flex-col bg-white h-full">
            {/* Header */}
            <h2 className="text-2xl font-bold text-[#FBB321] mb-6">
                Danh sách địa chỉ
            </h2>

            {/* Address List */}
            {isLoading ? (
                <p className="text-center text-gray-500">Đang tải...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : addresses.length === 0 && !showForm ? (
                <p className="text-center text-gray-500">Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới!</p>
            ) : (
                !showForm && (
                    <ul className="space-y-4 mb-6">
                        {addresses.map((address) => (
                            <li
                                key={address.addressId}
                                className="p-4 border border-gray-300 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="mb-2 sm:mb-0">
                                    <p className="text-gray-800 font-medium text-sm">
                                        {address.street}, {address.ward}, {address.district}, {address.province}
                                    </p>
                                    {address.isDefault && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                            Mặc định
                                        </span>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        className="bg-[#FBB321] text-white py-1 px-4 rounded-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FBB321] text-sm"
                                        onClick={() => handleEdit(address)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="bg-red-500 text-white py-1 px-4 rounded-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"
                                        onClick={() => handleDelete(address.addressId)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            )}

            {/* Toggle Form Button */}
            {!showForm && (
                <div className="p-4">
                    <button
                        className="w-full bg-[#FBB321] text-white py-2 px-4 rounded-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FBB321] transition-colors duration-200"
                        onClick={() => setShowForm(true)}
                    >
                        Thêm địa chỉ mới
                    </button>
                </div>
            )}

            {/* Address Form */}
            {showForm && (
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#FBB321] mb-6">
                        {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                            <select
                                name="province"
                                value={formData.province}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Chọn Tỉnh/Thành phố</option>
                                {provinces.map((province) => (
                                    <option key={province.ProvinceID} value={province.ProvinceID}>
                                        {province.ProvinceName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                            <select
                                name="district"
                                value={formData.district}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                                onChange={handleInputChange}
                                required
                                disabled={!formData.province}
                            >
                                <option value="">Chọn Quận/Huyện</option>
                                {districts.map((district) => (
                                    <option key={district.DistrictID} value={district.DistrictID}>
                                        {district.DistrictName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                            <select
                                name="ward"
                                value={formData.ward}
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                                onChange={handleInputChange}
                                required
                                disabled={!formData.district}
                            >
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map((ward) => (
                                    <option key={ward.WardCode} value={ward.WardCode}>
                                        {ward.WardName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đường</label>
                            <input
                                type="text"
                                name="street"
                                placeholder="Đường"
                                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FBB321] focus:border-[#FBB321] sm:text-sm"
                                value={formData.street}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                className="w-full bg-red-500 text-white py-2 px-4 rounded-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingAddress(null);
                                    setFormData({
                                        province: "",
                                        district: "",
                                        ward: "",
                                        street: "",
                                        isDefault: false,
                                    });
                                    setDistricts([]);
                                    setWards([]);
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="w-full bg-[#FBB321] text-white py-2 px-4 rounded-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FBB321]"
                            >
                                {editingAddress ? "Cập nhật" : "Lưu"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Address;