import React, {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import GHNService from "../../service/addressService/GHNService.jsx";

const Checkout = () => {
    const {user} = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState({
        fullName: "",
        phone: "",
        street: "",
        ward: "",
        district: "",
        province: "",
        isNew: true,
    });
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // 🔹 Lấy danh sách tỉnh từ GHN khi component mount
    useEffect(() => {
        GHNService.getProvinces().then(setProvinces);
    }, []);

    // 🔹 Khi chọn tỉnh, tải danh sách huyện
    useEffect(() => {
        if (selectedAddress.province) {
            GHNService.getDistricts(selectedAddress.province).then(setDistricts);
        }
    }, [selectedAddress.province]);

    // 🔹 Khi chọn huyện, tải danh sách xã
    useEffect(() => {
        if (selectedAddress.district) {
            GHNService.getWards(selectedAddress.district).then(setWards);
        }
    }, [selectedAddress.district]);

    // 🔹 Lấy danh sách địa chỉ khi component load
    useEffect(() => {
        if (user?.userId) {
            axios.get(`http://localhost:8080/api/addresses/user/${user.userId}`)
                .then((res) => {
                    setAddresses(res.data);
                    if (res.data.length > 0) {
                        const defaultAddress = res.data.find(addr => addr.isDefault) || res.data[0];
                        setSelectedAddress(defaultAddress);
                    }
                })
                .catch((err) => console.error("Lỗi lấy danh sách địa chỉ:", err));
        }
    }, [user]);

    // 🔹 Cập nhật state khi người dùng chọn địa chỉ khác
    const handleSelectAddress = async (e) => {
        const addressId = e.target.value;

        if (addressId === "new") {
            setSelectedAddress({
                fullName: "",
                phone: "",
                street: "",
                ward: "",
                district: "",
                province: "",
                isNew: true,
            });
            setDistricts([]);
            setWards([]);
        } else {
            const address = addresses.find(addr => addr.addressId.toString() === addressId);
            if (address) {
                const provinceData = provinces.find(p => p.ProvinceName === address.province);
                const districtData = await GHNService.getDistricts(provinceData?.ProvinceID);
                const district = districtData.find(d => d.DistrictName === address.district);
                const wardData = await GHNService.getWards(district?.DistrictID);
                const ward = wardData.find(w => w.WardName === address.ward);

                setSelectedAddress({
                    ...address,
                    province: provinceData ? provinceData.ProvinceID : "",
                    district: district ? district.DistrictID : "",
                    ward: ward ? ward.WardCode : "",
                    isNew: false,
                });

                setDistricts(districtData);
                setWards(wardData);
            }
        }
    };

    // 🔹 Xử lý thay đổi input khi chỉnh sửa
    const handleInputChange = async (e) => {
        const { name, value } = e.target;

        setSelectedAddress((prev) => {
            let updatedValue = value;

            if (name === "province") {
                GHNService.getDistricts(value).then(setDistricts);
                return { ...prev, province: value, district: "", ward: "" };
            } else if (name === "district") {
                GHNService.getWards(value).then(setWards);
                return { ...prev, district: value, ward: "" };
            } else if (name === "ward") {
                return { ...prev, ward: value };
            }

            return { ...prev, [name]: updatedValue };
        });

        // 🔹 Nếu không phải địa chỉ mới, tự động lưu khi thay đổi tỉnh, huyện, xã hoặc đường
        if (!selectedAddress.isNew && ["street", "ward", "district"].includes(name)) {
            const updatedAddress = {
                ...selectedAddress,
                [name]: value,
                province:
                    isNaN(selectedAddress.province)
                        ? selectedAddress.province
                        : provinces.find((p) => p.ProvinceID.toString() === selectedAddress.province)?.ProvinceName || "",
                district:
                    isNaN(selectedAddress.district)
                        ? selectedAddress.district
                        : districts.find((d) => d.DistrictID.toString() === selectedAddress.district)?.DistrictName || "",
                ward:
                    isNaN(selectedAddress.ward)
                        ? selectedAddress.ward
                        : wards.find((w) => w.WardCode.toString() === selectedAddress.ward)?.WardName || "",
            };

            delete updatedAddress.isNew;

            try {
                await axios.put(`http://localhost:8080/api/addresses/${updatedAddress.addressId}`, updatedAddress);
                setAddresses((prev) =>
                    prev.map((addr) => (addr.addressId === updatedAddress.addressId ? updatedAddress : addr))
                );
            } catch (error) {
                Swal.fire("Lỗi!", "Không thể cập nhật địa chỉ", "error");
            }
        }
    };

    const handleSaveAddress = async () => {
        const provinceName = provinces.find(p => p.ProvinceID === selectedAddress.province)?.ProvinceName;
        const districtName = districts.find(d => d.DistrictID === selectedAddress.district)?.DistrictName;
        const wardName = wards.find(w => w.WardCode === selectedAddress.ward)?.WardName;

        const addressData = {
            ...selectedAddress,
            province: provinceName, // Lưu tên thay vì ID
            district: districtName,
            ward: wardName,
            userId: user.userId,
        };

        console.log("📤 Dữ liệu gửi đi:", addressData);

        if (selectedAddress.isNew) {
            axios.post("http://localhost:8080/api/addresses", addressData)
                .then(() => Swal.fire("Thành công!", "Đã thêm địa chỉ mới", "success"))
                .catch(() => Swal.fire("Lỗi!", "Không thể thêm địa chỉ", "error"));
        } else {
            axios.put(`http://localhost:8080/api/addresses/${selectedAddress.addressId}`, addressData)
                .then(() => Swal.fire("Thành công!", "Đã cập nhật địa chỉ", "success"))
                .catch(() => Swal.fire("Lỗi!", "Không thể cập nhật địa chỉ", "error"));
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center px-4 md:px-0 relative">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-[900px] z-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
                    {/* Cột bên trái */}
                    <div className="md:col-span-2">
                        {/* Chọn địa chỉ giao hàng */}
                        <h2 className="text-2xl font-bold text-[#fbb321] mb-4">Chọn địa chỉ giao hàng</h2>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            onChange={handleSelectAddress}
                            value={selectedAddress.isNew ? "new" : selectedAddress.addressId || ""}
                        >
                            <option value="new">➕ Thêm địa chỉ mới</option>
                            {addresses.map((address) => (
                                <option key={address.addressId} value={address.addressId}>
                                    {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                                </option>
                            ))}
                        </select>


                        {/* Thông tin thanh toán */}
                        <h2 className="text-2xl font-bold text-[#fbb321] mb-4 mt-4">Thông tin thanh toán</h2>
                        <form className="space-y-4">
                            {[
                                {label: "Họ và tên", name: "fullName", type: "text"},
                                {label: "Số điện thoại", name: "phone", type: "text"},
                                {label: "Tên đường", name: "street", type: "text"}
                            ].map((field, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={selectedAddress[field.name] || ""}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full md:w-2/3 border border-gray-300 rounded-md shadow-sm p-2"
                                    />
                                </div>
                            ))}

                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                    Tỉnh / Thành phố
                                </label>
                                <select
                                    name="province"
                                    value={selectedAddress.province}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full md:w-2/3 border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                                >
                                    <option value="">Chọn Tỉnh</option>
                                    {provinces.length > 0 ? (
                                        provinces.map(p => (
                                            <option key={p.ProvinceID} value={p.ProvinceID}>
                                                {p.ProvinceName}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Đang tải...</option>
                                    )}
                                </select>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                    Quận / Huyện
                                </label>
                                <select
                                    name="district"
                                    value={selectedAddress.district}
                                    onChange={handleInputChange}
                                    disabled={!selectedAddress.province}
                                    className="mt-1 block w-full md:w-2/3 border border-gray-300 rounded-md shadow-sm p-2 bg-white disabled:bg-gray-200"
                                >
                                    <option value="">Chọn Huyện</option>
                                    {districts.map(d => (
                                        <option key={d.DistrictID} value={d.DistrictID}>
                                            {d.DistrictName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                    Phường / Xã
                                </label>
                                <select
                                    name="ward"
                                    value={selectedAddress.ward}
                                    onChange={handleInputChange}
                                    disabled={!selectedAddress.district}
                                    className="mt-1 block w-full md:w-2/3 border border-gray-300 rounded-md shadow-sm p-2 bg-white disabled:bg-gray-200"
                                >
                                    <option value="">Chọn Xã</option>
                                    {wards.map(w => (
                                        <option key={w.WardCode} value={w.WardCode}>
                                            {w.WardName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </form>

                        {/* Nút Lưu Địa Chỉ */}
                        {selectedAddress.isNew && (
                            <div className="mt-4">
                                <button className="bg-green-500 text-white px-4 py-2 rounded-md w-full"
                                        onClick={handleSaveAddress}>
                                    Lưu địa chỉ
                                </button>
                            </div>
                        )}

                        {/* Payment Methods */}
                        <div className="mt-8">
                            <h1 className="text-2xl font-bold text-yellow-500 mb-6">Phương thức thanh toán</h1>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    {img: "https://placehold.co/50x50?text=ATM", text: "Chuyển khoản ngân hàng"},
                                    {img: "https://placehold.co/50x50?text=$", text: "Trả tiền mặt khi nhận hàng"}
                                ].map((method, index) => (
                                    <button
                                        key={index}
                                        className="border-2 border-yellow-500 rounded-lg p-4 flex flex-col items-center w-full sm:w-40"
                                    >
                                        <img src={method.img} alt={`${method.text} icon`} className="mb-1 w-10 h-10"/>
                                        <p className="text-center text-sm">{method.text}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Giỏ hàng */}
                    <div
                        className="bg-[#fbb321] p-4 md:p-6 rounded-3xl text-white sticky top-4 max-h-[500px] overflow-y-auto w-full md:w-[300px] shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 border-b border-white pb-2">Sản phẩm đã mua</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    img: "https://placehold.co/60x60",
                                    name: "Mật Ong Rừng Đà Lạt 2L",
                                    weight: "1kg",
                                    quantity: "1*",
                                    price: "234.000₫"
                                },
                                {
                                    img: "https://placehold.co/60x60",
                                    name: "Mật Ong Hảo Hạn 1L",
                                    weight: "250gr",
                                    quantity: "1*",
                                    price: "80.000₫"
                                }
                            ].map((product, index) => (
                                <div key={index} className="flex items-center">
                                    <img src={product.img} alt={product.name} className="w-16 h-16 rounded-md"/>
                                    <div className="ml-4">
                                        <p className="font-bold">{product.name}</p>
                                        <p>Khối lượng : {product.weight}</p>
                                        <p>Số lượng : {product.quantity}</p>
                                        <p>{product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between">
                                <p>Tạm tính</p>
                                <p>314.000₫</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Giao hàng</p>
                                <p>Đồng giá: 30.000₫</p>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2">
                                <p>Tổng</p>
                                <p>344.000₫</p>
                            </div>
                            <button
                                className="mt-4 w-full bg-[#fef0d3] text-[#fbb321] font-bold py-2 rounded-3xl hover:bg-[#408630] hover:text-white">
                                Thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
