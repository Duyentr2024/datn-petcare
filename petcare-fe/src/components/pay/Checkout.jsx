import React, {useEffect, useState} from "react";
import {useAuth} from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import GHNService from "../../service/addressService/GHNService.jsx";
import Cookies from "js-cookie";
import CartDetailsService from "../../service/CartDetailsService/CartDetailsService.jsx";
import {toast} from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate từ React Router
const Checkout = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
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
    const [products, setProducts] = useState([]);
    // const [shippingFee, setShippingFee] = useState(0);
    //
    // const fromDistrictId = 1442; // Mã quận của cửa hàng
    // const toDistrictId = 1450;   // Mã quận người nhận

    const [paymentMethod, setPaymentMethod] = useState('COD'); // Mặc định là COD

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
    };


    // Tính tổng trọng lượng
    const totalWeight = products.reduce((sum, item) => sum + item.weightValue * item.quantityItem * 1000, 0); // gram

    useEffect(() => {
        const fetchCartDetails = async () => {
            try {
                const data = await CartDetailsService.getCartDetailsByUserId(userId);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching cart details:", error);
                toast.error("Không thể tải giỏ hàng!");
            }
        };

        const fetchShippingFee = async () => {
            try {
                const fee = await GHNService.getShippingFee({
                    fromDistrictId,
                    toDistrictId,
                    weight: totalWeight,
                });
                setShippingFee(fee);
            } catch (error) {
                toast.error("Không thể lấy phí vận chuyển!");
            }
        };

        fetchCartDetails();
        if (totalWeight > 0) {
            fetchShippingFee();
        }
    }, [totalWeight]);



    // Hàm lấy userId từ token
    const getUserIdFromToken = () => {
        const accessToken = Cookies.get("accessToken"); // Lấy token từ cookies
        if (!accessToken) return null;

        // Nếu là JWT, giải mã payload để lấy userId
        try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            return payload.userId; // Thay đổi key này theo cấu trúc token của bạn
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };

    const userId = getUserIdFromToken(); // Gọi hàm sau khi đã khai báo


    // Hàm lấy fullname và phoneNumber từ token
    const getPhoneAndNameFromToken = () => {
        const accessToken = Cookies.get("accessToken"); // Lấy token từ cookies
        if (!accessToken) return null;

        try {
            const payload = JSON.parse(atob(accessToken.split(".")[1])); // Giải mã payload
            const { fullName, phone } = payload; // Lấy thông tin từ payload
            return { fullName, phone };
        } catch (error) {
            console.error("Invalid token:", error);
            return null;
        }
    };

    const userInfo = getPhoneAndNameFromToken();
    if (userInfo) {
        const { fullName, phone  } = userInfo;

    }


    // Fetch cart details
    useEffect(() => {
        const fetchCartDetails = async () => {
            try {
                const data = await CartDetailsService.getCartDetailsByUserId(userId);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching cart details:", error);
                toast.error("Failed to load cart details. Please try again.");
            }
        };

        if (userId) {
            fetchCartDetails();
        } else {
            toast.error("You must log in to view your cart.");
        }
    }, [userId]);

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
    }

    const shippingAddress = `${selectedAddress.street}, ${selectedAddress.ward || ''}, ${selectedAddress.district || ''}, ${selectedAddress.province || ''}`.replace(/, ,/g, ',').replace(/, $/, '');

    const shippingCosts = 30000 ;
    const handlePayment = async () => {
        const orderDetails = {
            userId: Number(userId),
            paymentMethod: String(paymentMethod),
            shippingAddress: String(shippingAddress),
            shippingCost: Number(shippingCosts),
            voucherId: selectedAddress?.voucherId ? Number(selectedAddress.voucherId) : null,
            type: "ORDER ONLINE",
            items: products.map(({ productDetailId, quantityItem, price }) => ({
                productDetailId: Number(productDetailId),
                quantity: Number(quantityItem),
                price: Number(price),
            })),
        };

        console.log("Sending payment request:", orderDetails);

        try {
            const response = await axios.post("http://localhost:8080/api/orders/checkout", orderDetails, {
                headers: { "Content-Type": "application/json" },
            });

            Swal.fire({
                title: "Thành công!",
                text: "Đặt hàng thành công!",
                icon: "success"
            }).then(() => {
                navigate("/my-account/info");
            });
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.message; // Lấy thông báo lỗi từ BE
                Swal.fire("Hết hàng!", errorMessage, "warning"); // Hiển thị thông báo bằng tiếng Việt
            } else {
                console.error("Error during payment:", error);
                Swal.fire("Lỗi!", "Không thể hoàn tất thanh toán. Vui lòng thử lại!", "error");
            }
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
                                {label: "Địa chỉ", name: "street", type: "text"},
                            ].map((field, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                    <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={
                                            field.name === "fullName" ? userInfo?.fullName || "" :
                                                field.name === "phone" ? userInfo?.phone || "" :
                                                    selectedAddress[field.name] || ""
                                        }
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

                            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                                <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                                    Giảm giá
                                </label>
                                <select
                                    className="mt-1 block w-full md:w-2/3 border border-gray-300 rounded-md shadow-sm p-2 bg-white disabled:bg-gray-200">
                                    <option value="">Chọn mã giảm giá</option>
                                    <option value="10off">Giảm 10%</option>
                                    <option value="20off">Giảm 20%</option>
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


                        <div className="mt-8">
                            <h1 className="text-2xl font-bold text-yellow-500 mb-6">Phương thức thanh toán</h1>
                            <div className="flex gap-4 items-center">
                                {[{
                                    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8VNUYiwB1DuoiPYNKl6jXWIcQEOxbNkXM6w&s",
                                    text: "Thanh toán VNPay",
                                    value: "VNPay",
                                }, {
                                    img: "https://toidentowa.com/wp-content/uploads/2017/12/thanh-toan.png.webp",
                                    text: "Thanh toán khi nhận hàng (COD)",
                                    value: "COD",
                                }].map((method, index) => (
                                    <label key={index}
                                           className={`flex flex-col items-center justify-center border w-40 h-40 px-3 py-2 rounded-lg cursor-pointer ${paymentMethod === method.value ? 'border-yellow-500' : 'border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            value={method.value}
                                            checked={paymentMethod === method.value}
                                            onChange={() => handlePaymentMethodChange(method.value)}
                                            className="mb-2"
                                        />
                                        <img src={method.img} alt={method.text}
                                             className="w-12 h-12 object-cover mb-2 rounded-full"/>
                                        <span className="font-medium text-xs text-center">{method.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Giỏ hàng */}
                    {/* Giỏ hàng */}
                    <div
                        className="bg-[#fbb321] p-5 md:p-6 rounded-3xl text-white sticky top-4 max-h-[500px] overflow-y-auto w-full md:w-[320px] shadow-2xl">
                        <h2 className="text-2xl font-bold mb-5 border-b border-white pb-3 text-center">Sản phẩm thanh
                            toán</h2>
                        <div className="space-y-4">
                            {products.map((product, index) => (
                                <div key={index} className="flex items-center border-b border-white pb-3">
                                    <img
                                        src={product.image}
                                        alt={product.productName}
                                        className="w-16 h-16 rounded-md object-cover border border-white"
                                    />
                                    <div className="ml-4 flex-1">
                                        <p className="font-bold text-lg text-sm">{product.productName}</p>
                                        <p className="text-sm">Khối lượng: {product.weightValue}kg</p>
                                        <p className="text-sm">Màu: {product.colorValue}</p>
                                        <p className="text-sm">Size: {product.sizeValue}</p>
                                        <p className="text-sm">Số lượng: {product.quantityItem}</p>
                                        <p className="text-md font-semibold text-[#ffecd1]">{product.price.toLocaleString()}₫</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Tính toán tổng tiền */}
                        <div className="mt-5 space-y-2 text-base">
                            <div className="flex justify-between font-medium">
                                <p>Tạm tính:</p>
                                <p>{products.reduce((total, item) => total + item.price * item.quantityItem, 0).toLocaleString()}₫</p>
                            </div>
                            <div className="flex justify-between font-medium">
                                <p>Phí giao hàng:</p>
                                <p>{shippingCosts}₫</p>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2 border-t border-white pt-3">
                                <p>Tổng cộng:</p>
                                <p className="text-xl">{(
                                    products.reduce((total, item) => total + (item.price + shippingCosts)* item.quantityItem, 0)
                                ).toLocaleString()}₫</p>
                            </div>
                        </div>

                        {/* Nút Thanh toán */}
                        <button
                            onClick={handlePayment}
                            className="mt-5 w-full bg-[#fef0d3] text-[#fbb321] font-bold py-3 rounded-3xl
        transition-all duration-300 ease-in-out
        hover:bg-[#408630] hover:text-white hover:shadow-lg"
                        >
                            Thanh toán
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default Checkout;
