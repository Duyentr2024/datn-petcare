import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import GHNService from "../../service/addressService/GHNService.jsx";
import Cookies from "js-cookie";
import CartDetailsService from "../../service/CartDetailsService/CartDetailsService.jsx";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import VoucherService from "../../service/voucherService/VoucherService.jsx";
import VNPayService from "../../service/paymentService/VNPayService.jsx";
import MomoService from "../../service/paymentService/MomoService.jsx";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
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
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [condition, setCondition] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const totalWeight = products.reduce(
    (sum, item) => sum + item.weightValue * item.quantityItem * 1000,
    0
  ); // gram
  const [paymentMethod, setPaymentMethod] = useState("COD"); // Mặc định là COD
  const subtotal = products.reduce(
    (total, item) => total + item.price * item.quantityItem,
    0
  );
  const totalBeforeDiscount = subtotal + shippingFee;
  const discountAmount =
    subtotal >= condition ? (totalBeforeDiscount * discount) / 100 : 0;
  const totalAmount = (totalBeforeDiscount - discountAmount).toLocaleString();
  const [hasProcessed, setHasProcessed] = useState(false); // State để kiểm soát xử lý
  const [processedTxnRef, setProcessedTxnRef] = useState(null); // Lưu vnp_TxnRef đã xử lý
  const [processedOrders, setProcessedOrders] = useState(new Set());
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (selectedAddress.district && selectedAddress.ward && totalWeight > 0) {
      fetchShippingFee(selectedAddress.district, selectedAddress.ward);
    }

    const fetchCartDetails = async () => {
      try {
        const data = await CartDetailsService.getCartDetailsByUserId(userId);
        setProducts(data);
      } catch (error) {
        toast.error("Không thể tải giỏ hàng!");
      }
    };

    fetchCartDetails();
  }, [selectedAddress, totalWeight]);

  // Hàm tính phí vận chuyển GHN
  const fetchShippingFee = async (districtId, wardCode) => {
    if (!districtId || !wardCode) {
      return;
    }

    const payload = {
      districtId,
      wardCode,
      weight: totalWeight || 1000,
    };

    try {
      const fee = await GHNService.calculateShippingFee(payload);
      setShippingFee(fee);
    } catch (error) {
      toast.error("Không thể lấy phí vận chuyển!");
    }
  };

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
      const base64Url = accessToken.split(".")[1]; // Lấy phần payload của JWT
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Chuyển đổi định dạng base64
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const { fullName, phone } = JSON.parse(jsonPayload); // Parse JSON
      return { fullName, phone };
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  const userInfo = getPhoneAndNameFromToken();
  if (userInfo) {
    const { fullName, phone } = userInfo;
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
      axios
        .get(`http://localhost:8080/api/addresses/user/${user.userId}`)
        .then(async (res) => {
          setAddresses(res.data);

          if (res.data.length > 0) {
            const defaultAddress =
              res.data.find((addr) => addr.isDefault) || res.data[0];

            // Tìm ID tương ứng từ danh sách tỉnh
            const provinceData = provinces.find(
              (p) => p.ProvinceName === defaultAddress.province
            );
            if (!provinceData) return;

            // Lấy danh sách quận/huyện theo ID tỉnh
            const districtData = await GHNService.getDistricts(
              provinceData.ProvinceID
            );
            const district = districtData.find(
              (d) => d.DistrictName === defaultAddress.district
            );
            if (!district) return;

            // Lấy danh sách xã/phường theo ID quận/huyện
            const wardData = await GHNService.getWards(district.DistrictID);
            const ward = wardData.find(
              (w) => w.WardName === defaultAddress.ward
            );

            setSelectedAddress({
              ...defaultAddress,
              province: provinceData.ProvinceID,
              district: district.DistrictID,
              ward: ward ? ward.WardCode : "",
              isNew: false,
            });

            setDistricts(districtData);
            setWards(wardData);
          }
        })
        .catch((err) => console.error("Lỗi lấy danh sách địa chỉ:", err));
    }
  }, [user, provinces]);

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
      const address = addresses.find(
        (addr) => addr.addressId.toString() === addressId
      );
      if (address) {
        const provinceData = provinces.find(
          (p) => p.ProvinceName === address.province
        );
        const provinceID = provinceData ? provinceData.ProvinceID : "";

        const districtData = provinceID
          ? await GHNService.getDistricts(provinceID)
          : [];
        const district = districtData.find(
          (d) => d.DistrictName === address.district
        );
        const districtID = district ? district.DistrictID : "";

        const wardData = districtID
          ? await GHNService.getWards(districtID)
          : [];
        const ward = wardData.find((w) => w.WardName === address.ward);
        const wardID = ward ? ward.WardCode : "";

        setSelectedAddress({
          ...address,
          province: provinceID,
          district: districtID,
          ward: wardID,
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
      if (name === "province") {
        GHNService.getDistricts(value).then(setDistricts);
        return { ...prev, province: value, district: "", ward: "" };
      }
      if (name === "district") {
        GHNService.getWards(value).then(setWards);
        return { ...prev, district: value, ward: "" };
      }
      return { ...prev, [name]: value };
    });

    // 🔹 Chỉ cập nhật API nếu thay đổi `street` hoặc `ward`
    if (!selectedAddress.isNew && ["street", "ward"].includes(name)) {
      const updatedAddress = {
        ...selectedAddress,
        [name]: value,
        province:
          provinces.find(
            (p) => String(p.ProvinceID) === String(selectedAddress.province)
          )?.ProvinceName || selectedAddress.province,
        district:
          districts.find(
            (d) => String(d.DistrictID) === String(selectedAddress.district)
          )?.DistrictName || selectedAddress.district,
        ward:
          wards.find((w) => String(w.WardCode) === String(selectedAddress.ward))
            ?.WardName || selectedAddress.ward,
      };

      delete updatedAddress.isNew;

      try {
        await axios.put(
          `http://localhost:8080/api/addresses/${updatedAddress.addressId}`,
          updatedAddress
        );
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.addressId === updatedAddress.addressId ? updatedAddress : addr
          )
        );
      } catch (error) {
        Swal.fire("Lỗi!", "Không thể cập nhật địa chỉ", "error");
      }
    }
  };

  // 🔹 Khi `ward` hoặc `street` thay đổi, tự động cập nhật API
  useEffect(() => {
    if (
      !selectedAddress.isNew &&
      selectedAddress.ward &&
      selectedAddress.street
    ) {
      const updatedAddress = {
        ...selectedAddress,
        province:
          provinces.find(
            (p) => String(p.ProvinceID) === String(selectedAddress.province)
          )?.ProvinceName || selectedAddress.province,
        district:
          districts.find(
            (d) => String(d.DistrictID) === String(selectedAddress.district)
          )?.DistrictName || selectedAddress.district,
        ward:
          wards.find((w) => String(w.WardCode) === String(selectedAddress.ward))
            ?.WardName || selectedAddress.ward,
      };

      if (
        !updatedAddress.province ||
        !updatedAddress.district ||
        !updatedAddress.ward
      ) {
        console.warn("⚠️ Không gửi API vì thiếu dữ liệu:", updatedAddress);
        return;
      }

      (async () => {
        try {
          await axios.put(
            `http://localhost:8080/api/addresses/${updatedAddress.addressId}`,
            updatedAddress
          );
          setAddresses((prev) =>
            prev.map((addr) =>
              addr.addressId === updatedAddress.addressId
                ? updatedAddress
                : addr
            )
          );
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể cập nhật địa chỉ", "error");
        }
      })();
    }
  }, [selectedAddress.ward, selectedAddress.street]); // Chỉ cập nhật khi `street` hoặc `ward` thay đổi

  const handleSaveAddress = async () => {
    // 🔹 Lấy tên từ ID trước khi gửi lên API
    const provinceName =
      provinces.find(
        (p) => String(p.ProvinceID) === String(selectedAddress.province)
      )?.ProvinceName || "";
    const districtName =
      districts.find(
        (d) => String(d.DistrictID) === String(selectedAddress.district)
      )?.DistrictName || "";
    const wardName =
      wards.find((w) => String(w.WardCode) === String(selectedAddress.ward))
        ?.WardName || "";

    if (!provinceName || !districtName || !wardName) {
      Swal.fire("Lỗi!", "Vui lòng chọn đầy đủ tỉnh, quận và xã!", "error");
      return;
    }

    // 🔹 Chuẩn bị dữ liệu để gửi lên API
    const addressData = {
      ...selectedAddress,
      province: provinceName || "",
      district: districtName || "",
      ward: wardName || "",
      userId: user?.userId || null,
    };

    try {
      let response;
      if (selectedAddress.isNew) {
        response = await axios.post(
          "http://localhost:8080/api/addresses",
          addressData
        );
      } else {
        response = await axios.put(
          `http://localhost:8080/api/addresses/${selectedAddress.addressId}`,
          addressData
        );
      }

      Swal.fire(
        "Thành công!",
        selectedAddress.isNew ? "Đã thêm địa chỉ mới" : "Đã cập nhật địa chỉ",
        "success"
      );

      // 🔹 Gọi API để cập nhật danh sách địa chỉ
      const updatedAddresses = await axios.get(
        `http://localhost:8080/api/addresses/user/${user.userId}`
      );
      setAddresses(updatedAddresses.data);

      // 🔥 Đảm bảo cập nhật selectedAddress với tỉnh/quận/xã đúng tên
      const newSelected = updatedAddresses.data.find(
        (addr) => addr.addressId === response.data.addressId
      );
      if (newSelected) {
        const provinceData = provinces.find(
          (p) => p.ProvinceName === newSelected.province
        );
        const districtData = provinceData
          ? await GHNService.getDistricts(provinceData.ProvinceID)
          : [];
        const district = districtData.find(
          (d) => d.DistrictName === newSelected.district
        );
        const wardData = district
          ? await GHNService.getWards(district.DistrictID)
          : [];
        const ward = wardData.find((w) => w.WardName === newSelected.ward);

        setSelectedAddress({
          ...newSelected,
          province: provinceData ? provinceData.ProvinceID : "",
          district: district ? district.DistrictID : "",
          ward: ward ? ward.WardCode : "",
          isNew: false,
        });

        setDistricts(districtData);
        setWards(wardData);
      }
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể lưu địa chỉ. Vui lòng thử lại!", "error");
    }
  };

  const provinceName =
    provinces.find(
      (p) => String(p.ProvinceID) === String(selectedAddress.province)
    )?.ProvinceName || "";
  const districtName =
    districts.find(
      (d) => String(d.DistrictID) === String(selectedAddress.district)
    )?.DistrictName || "";
  const wardName =
    wards.find((w) => String(w.WardCode) === String(selectedAddress.ward))
      ?.WardName || "";
  const shippingAddress =
    `${selectedAddress.street}, ${wardName}, ${districtName}, ${provinceName}`
      .replace(/, ,/g, ",")
      .replace(/, $/, "");

  //Voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const data = await VoucherService.getAllVouchers();
        // Lọc chỉ hiển thị voucher có status = true
        const activeVouchers = data.filter(voucher => voucher.status === true);
        setVouchers(activeVouchers);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách voucher:", error);
      }
    };

    fetchVouchers();
  }, []);

  useEffect(() => {
    const selected = vouchers.find(
      (v) => v.voucherId.toString() === selectedVoucher
    );
    const today = new Date();
    if (
      selected &&
      (selected.status === false || // Không áp dụng nếu không hoạt động
        selected.quantity <= 0 ||
        new Date(selected.endDate) < today)
    ) {
      setSelectedVoucher(""); // Reset nếu voucher không hợp lệ
      setDiscount(0);
      setCondition(0);
    } else if (selected) {
      setDiscount(selected.percents);
      setCondition(selected.condition);
    } else {
      setDiscount(0);
      setCondition(0);
    }
  }, [selectedVoucher, vouchers]);

  const handleCheckout = async () => {
    try {
      // Gọi API thanh toán thành công (giả lập)
      setTimeout(async () => {
        // Nếu có voucher, giảm số lượng voucher
        if (selectedVoucher) {
          await VoucherService.decrementVoucherQuantity(selectedVoucher);
        }
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
    }
  };

  // Trong handleOrderProcess
  const handleOrderProcess = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const orderDetails = {
      userId: Number(userId),
      paymentMethod: String(paymentMethod),
      shippingAddress: String(shippingAddress),
      shippingCost: Number(shippingFee),
      voucherId: selectedVoucher ? Number(selectedVoucher) : null,
      type: "ORDER ONLINE",
      paymentStatus:
        paymentMethod === "COD" ? "Chờ thanh toán" : "Chờ thanh toán",
      items: products.map(({ productDetailId, quantityItem, price }) => ({
        productDetailId: Number(productDetailId),
        quantity: Number(quantityItem),
        price: Number(price),
      })),
    };

    console.log(
      `[FE] Starting order process: paymentMethod=${paymentMethod}, orderDetails=`,
      orderDetails
    );

    try {
      if (paymentMethod === "VNPay") {
        try {
          // Đối với VNPay, chỉ tạo URL thanh toán trước mà không tạo đơn hàng
          const amount = Math.round(totalBeforeDiscount - discountAmount);
          const paymentUrl = await VNPayService.createPayment(
            amount,
            `${window.location.origin}/checkout`
          );
          
          // Lưu thông tin đơn hàng vào localStorage nhưng chưa tạo đơn hàng trong DB
        localStorage.setItem(
            "pendingVNPayOrder",
          JSON.stringify({
            orderDetails,
            voucherId: selectedVoucher,
              paymentMethod: "VNPay"
            })
          );

          console.log(`[FE] Redirecting to VNPay payment URL: ${paymentUrl}`);
          window.location.href = paymentUrl;
        } catch (paymentError) {
          console.error(`[FE] Error creating VNPay payment: ${paymentError.message}`);
          Swal.fire("Lỗi!", `Không thể tạo thanh toán VNPay: ${paymentError.message}`, "error");
        }
      } else if (paymentMethod === "MoMo") {
        try {
          // Đối với MoMo, chỉ tạo URL thanh toán trước mà không tạo đơn hàng
          const amount = Math.round(totalBeforeDiscount - discountAmount);
          
          // Đảm bảo sử dụng full URL với http/https để MoMo xử lý đúng redirect
          const fullReturnUrl = `${window.location.origin}/checkout`;
          console.log(`[FE] Setting MoMo return URL to: ${fullReturnUrl}`);
          
          // Tạo một orderID duy nhất cho MoMo payment trước khi gửi request
          const uniqueMomoOrderId = `MOMO_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          console.log(`[FE] Generated unique MoMo order ID: ${uniqueMomoOrderId}`);
          
          const paymentUrl = await MomoService.createPayment(
            String(amount),
            fullReturnUrl,
            uniqueMomoOrderId  // Truyền orderID duy nhất
          );
          
          // Lưu thông tin đơn hàng vào localStorage nhưng chưa tạo đơn hàng trong DB
          localStorage.setItem(
            "pendingMomoOrder",
            JSON.stringify({
              orderDetails: {
                ...orderDetails,
                momoOrderId: uniqueMomoOrderId  // Lưu momoOrderId vào orderDetails
              },
              voucherId: selectedVoucher,
              paymentMethod: "MoMo"
            })
          );

          console.log(`[FE] Redirecting to MoMo payment URL: ${paymentUrl}`);
          window.location.href = paymentUrl;
        } catch (error) {
          console.error(`[FE] Error creating MoMo payment: ${error.message}`);
          Swal.fire("Lỗi!", `Không thể tạo thanh toán MoMo: ${error.message}`, "error");
        }
      } else {
        console.log(`[FE] Processing COD payment`);
        await handlePayment(orderDetails);
        await clearCart();
      }
    } catch (error) {
      console.error(`[FE] Error in handleOrderProcess: ${error.message}`);
      Swal.fire("Lỗi!", error.message || "Không thể xử lý đơn hàng", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (orderDetails) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/orders/checkout",
        orderDetails,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Nếu có voucher được áp dụng, giảm số lượng voucher
      if (selectedVoucher) {
        console.log(
          `[FE] Decrementing voucher quantity for voucherId: ${selectedVoucher} in COD`
        );
        await VoucherService.decrementVoucherQuantity(selectedVoucher);
      }

      Swal.fire({
        title: "Thành công!",
        text: "Đặt hàng thành công!",
        icon: "success",
      }).then(() => {
        navigate("/my-account/history");
      });
    } catch (error) {
      console.error("Error in handlePayment:", error);
      throw error;
    }
  };
  const clearCart = async () => {
    try {
      await CartDetailsService.clearCartDetailsByUserId(userId);
      setProducts([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Không thể xóa giỏ hàng!");
    }
  };

  useEffect(() => {
    // Xử lý nút Back từ trang thanh toán
    const detectBackFromPayment = () => {
      // Kiểm tra có phải vừa quay lại từ trang thanh toán không
      const pendingMomoOrder = JSON.parse(localStorage.getItem("pendingMomoOrder"));
      const pendingVNPayOrder = JSON.parse(localStorage.getItem("pendingVNPayOrder"));
      
      // Nếu có pending order nhưng không có query params, nghĩa là người dùng đã nhấn nút Back
      if (pendingMomoOrder && !window.location.search) {
        console.log("[FE] Detected back button from MoMo payment page");
        Swal.fire({
          title: "Thông báo",
          text: "Bạn đã hủy thanh toán MoMo.",
          icon: "info",
        });
        localStorage.removeItem("pendingMomoOrder");
      }
      
      if (pendingVNPayOrder && !window.location.search) {
        console.log("[FE] Detected back button from VNPay payment page");
        Swal.fire({
          title: "Thông báo",
          text: "Bạn đã hủy thanh toán VNPay.",
          icon: "info",
        });
        localStorage.removeItem("pendingVNPayOrder");
      }
    };
    
    // Gọi hàm khi component mount
    detectBackFromPayment();
    
    // Thêm event listener cho sự kiện popstate (khi người dùng sử dụng nút back/forward)
    window.addEventListener('popstate', detectBackFromPayment);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', detectBackFromPayment);
    };
  }, []);

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        // Lấy thông tin từ URL
        const urlParams = new URLSearchParams(window.location.search);
        
        // Thông tin VNPay
        const vnpayStatus = urlParams.get("vnp_ResponseCode");
        const vnpayOrderId = urlParams.get("vnp_TxnRef");
        const pendingVnpayOrder = localStorage.getItem("pendingVnpayOrder");
        
        // Thông tin MoMo
        const momoOrderId = urlParams.get("orderId");
        const resultCode = urlParams.get("resultCode");
        const momoTransId = urlParams.get("transId");
        const pendingMomoOrder = localStorage.getItem("pendingMomoOrder");
        
        console.log(`[FE] Processing payment result. VNPay: ${vnpayStatus}, MoMo: ${resultCode}`);
        
        // Xử lý VNPay
        if (vnpayOrderId && pendingVnpayOrder) {
          await processVNPayPayment(vnpayOrderId, vnpayStatus, pendingVnpayOrder);
        }
        
        // Xử lý MoMo
        if (momoOrderId && pendingMomoOrder && resultCode) {
          await processMoMoPayment(momoOrderId, resultCode, momoTransId, pendingMomoOrder);
        }
      } catch (error) {
        console.error(`[FE] Error in handlePaymentResult: ${error.message}`);
        Swal.fire(
          "Lỗi!",
          "Không thể xử lý kết quả thanh toán: " + error.message,
          "error"
        );
      }
    };
    
    // Hàm xử lý thanh toán VNPay
    const processVNPayPayment = async (vnpayOrderId, vnpayStatus, pendingVnpayOrderStr) => {
      console.log(`[FE] Processing VNPay payment: vnp_TxnRef=${vnpayOrderId}, vnp_ResponseCode=${vnpayStatus}`);
      
      try {
        const pendingVnpayOrder = JSON.parse(pendingVnpayOrderStr);
        
        if (vnpayStatus === "00") {
          // Đảm bảo chỉ xử lý giao dịch này một lần
          if (processedTxnRef === vnpayOrderId) {
            console.log(`[FE] VNPay transaction ${vnpayOrderId} already processed`);
            return;
          }
          setProcessedTxnRef(vnpayOrderId);
          
          // Tạo đơn hàng mới với trạng thái thanh toán thành công
          const orderDetailsWithSuccessStatus = {
            ...pendingVnpayOrder.orderDetails,
            paymentStatus: "Chờ xác nhận" // Đặt trạng thái trực tiếp thành "Chờ xác nhận"
          };
          
          const response = await axios.post(
            "http://localhost:8080/api/orders/checkout",
            orderDetailsWithSuccessStatus,
            { headers: { "Content-Type": "application/json" } }
          );
          
          // Giảm số lượng voucher nếu có
          if (pendingVnpayOrder.voucherId) {
            await VoucherService.decrementVoucherQuantity(pendingVnpayOrder.voucherId);
          }
          
          // Xóa giỏ hàng ngay sau khi tạo đơn hàng thành công
          await clearCart();
          
          Swal.fire({
            title: "Thành công!",
            text: "Thanh toán VNPay thành công!",
            icon: "success",
          }).then(() => {
            navigate("/my-account/history");
          });
        } else if (vnpayStatus === "24") {
          Swal.fire({
            title: "Thông báo",
            text: "Bạn đã hủy thanh toán VNPay.",
            icon: "info",
          });
        } else {
          Swal.fire({
            title: "Thông báo",
            text: `Thanh toán VNPay không thành công. Mã lỗi: ${vnpayStatus}`,
            icon: "error",
          });
        }
      } catch (error) {
        console.error(`[FE] Error handling VNPay payment result: ${error.message}`);
        Swal.fire(
          "Lỗi!",
          "Không thể xử lý kết quả thanh toán VNPay: " + error.message,
          "error"
        );
      } finally {
        localStorage.removeItem("pendingVNPayOrder");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    // Hàm xử lý thanh toán MoMo
    const processMoMoPayment = async (momoOrderId, resultCode, momoTransId, pendingMomoOrderStr) => {
      console.log(`[FE] Processing MoMo payment: orderId=${momoOrderId}, resultCode=${resultCode}`);
      
      try {
        // Đầu tiên, kiểm tra đơn hàng này đã tồn tại trong database chưa
        const orderExistsResponse = await axios.get(
          `http://localhost:8080/api/orders/check-momo-order?momoOrderId=${momoOrderId}`
        );
        
        if (orderExistsResponse.data.exists) {
          console.log(`[FE] MoMo order ${momoOrderId} already exists in database, skipping order creation`);
          
          // Xóa dữ liệu trên URL và localStorage
          localStorage.removeItem("pendingMomoOrder");
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Thông báo cho người dùng và chuyển hướng
          Swal.fire({
            title: "Thông báo",
            text: "Đơn hàng của bạn đã được tạo thành công trước đó",
            icon: "success",
          }).then(() => {
            navigate("/my-account/history");
          });
          
          return;
        }
        
        // Tiếp tục kiểm tra localStorage để tránh xử lý trùng lặp
        const processedMomoOrders = JSON.parse(localStorage.getItem('processedMomoOrders') || '[]');
        if (processedMomoOrders.includes(momoOrderId)) {
          console.log(`[FE] MoMo order ${momoOrderId} already processed locally, skipping`);
          // Xóa dữ liệu trên URL và localStorage
          localStorage.removeItem("pendingMomoOrder");
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
        
        // Xử lý kết quả thanh toán
        if (resultCode === "0") {
          // Đánh dấu đã xử lý TRƯỚC khi tạo đơn hàng
          processedMomoOrders.push(momoOrderId);
          localStorage.setItem('processedMomoOrders', JSON.stringify(processedMomoOrders));
          
          try {
            // Kiểm tra trạng thái thanh toán với MoMo
            console.log(`[FE] Verifying MoMo payment status with MoMo API`);
            const paymentStatus = await MomoService.checkPaymentStatus(momoOrderId);
            const statusData = typeof paymentStatus === 'string' ? JSON.parse(paymentStatus) : paymentStatus;
            
            if (statusData.resultCode !== 0) {
              throw new Error(`Payment status check failed: ${statusData.message}`);
            }
            
            // Parse dữ liệu đơn hàng
            const parsedOrder = JSON.parse(pendingMomoOrderStr);
            const orderDetails = {
              ...parsedOrder.orderDetails,
              paymentStatus: "Chờ xác nhận",
              momoOrderId: momoOrderId, // Thêm momoOrderId vào request để backend có thể ngăn chặn trùng lặp
            };
            
            console.log(`[FE] Creating order from MoMo payment with momoOrderId: ${momoOrderId}`);
            
            // Tạo đơn hàng
            const response = await axios.post(
              "http://localhost:8080/api/orders/checkout",
              orderDetails,
              { headers: { "Content-Type": "application/json" } }
            );
            
            console.log(`[FE] Order created successfully with ID: ${response.data.orderId}`);
            
            // CẬP NHẬT: Gửi thông tin MoMo lên server để lưu vào DB
            try {
              console.log(`[FE] Updating MoMo transaction info for orderId: ${response.data.orderId}`);
              const updateMomoResponse = await axios.put(
                `http://localhost:8080/api/orders/${response.data.orderId}`,
                {
                  momoOrderId: momoOrderId,
                  momoTransId: momoTransId
                },
                { headers: { "Content-Type": "application/json" } }
              );
              console.log(`[FE] MoMo info updated successfully:`, updateMomoResponse.data);
            } catch (updateError) {
              console.error(`[FE] Failed to update MoMo info: ${updateError.message}`);
              // Không dừng luồng xử lý nếu cập nhật thất bại
            }
            
            // Giảm số lượng voucher nếu có
            if (parsedOrder.voucherId) {
              try {
                await VoucherService.decrementVoucherQuantity(parsedOrder.voucherId);
                console.log(`[FE] Voucher ${parsedOrder.voucherId} decremented`);
              } catch (error) {
                console.error(`[FE] Error decrementing voucher: ${error.message}`);
              }
            }
            
            // Xóa giỏ hàng
            await clearCart();
            
            // Thông báo thành công và chuyển hướng
            Swal.fire({
              title: "Thành công!",
              text: "Thanh toán MoMo thành công!",
              icon: "success",
            }).then(() => {
              navigate("/my-account/history");
            });
          } catch (error) {
            console.error(`[FE] Error processing MoMo payment: ${error.message}`);
            Swal.fire(
              "Lỗi!",
              "Không thể xử lý thanh toán MoMo: " + error.message,
              "error"
            );
          }
        } else if (resultCode === "1006") {
          // Người dùng hủy thanh toán
          Swal.fire({
            title: "Thông báo",
            text: "Bạn đã hủy thanh toán MoMo.",
            icon: "info",
          });
        } else {
          // Thanh toán thất bại
          Swal.fire({
            title: "Thông báo",
            text: `Thanh toán MoMo không thành công. Mã lỗi: ${resultCode}`,
            icon: "error",
          });
        }
      } catch (error) {
        console.error(`[FE] Error handling MoMo payment result: ${error.message}`);
        Swal.fire(
          "Lỗi!",
          "Không thể xử lý kết quả thanh toán MoMo: " + error.message,
          "error"
        );
      } finally {
        // Luôn xóa dữ liệu tạm và tham số truy vấn
        localStorage.removeItem("pendingMomoOrder");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handlePaymentResult();
  }, [navigate, hasProcessed, processedTxnRef, totalBeforeDiscount, discountAmount]);

  const paymentRequest = {
    amount: Math.round(totalBeforeDiscount - discountAmount), // Đảm bảo đây là số nguyên
    returnUrl: `${window.location.origin}/checkout`,
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? (
      <span className="text-red-500">{diffDays} ngày</span>
    ) : (
      <span className="text-red-500">Hết hạn</span>
    );
  };

  // Hàm hoàn tiền MoMo
  const refundMomoPayment = async (orderId, amount, transId) => {
    try {
      console.log(`[FE] Bắt đầu quá trình hoàn tiền MoMo: orderId=${orderId}, amount=${amount}, transId=${transId}`);
      
      // Hiển thị thông báo loading
      Swal.fire({
        title: "Đang xử lý...",
        text: "Đang yêu cầu hoàn tiền từ MoMo, vui lòng đợi...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Gọi API hoàn tiền MoMo
      const response = await axios.post(
        "http://localhost:8080/api/payment/momo/refund",
        {
          orderId: orderId,
          amount: amount,
          transId: transId,
          description: "Hoàn tiền do hủy đơn hàng"
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Đóng thông báo loading
      Swal.close();
      
      console.log(`[FE] Kết quả hoàn tiền MoMo:`, response.data);
      
      if (response.data.success) {
        console.log(`[FE] Hoàn tiền MoMo thành công cho orderId: ${orderId}`);
        return { 
          success: true, 
          message: "Đã hoàn tiền thành công qua MoMo",
          details: response.data
        };
      } else {
        console.error(`[FE] Hoàn tiền MoMo thất bại cho orderId: ${orderId}`, response.data);
        return { 
          success: false, 
          message: `Không thể hoàn tiền: ${response.data.message || "Vui lòng liên hệ hỗ trợ"}`,
          details: response.data
        };
      }
    } catch (error) {
      console.error(`[FE] Lỗi gọi API hoàn tiền MoMo:`, error);
      return { 
        success: false, 
        message: `Lỗi hoàn tiền: ${error.response?.data?.message || error.message}`,
        details: error.response?.data || {}
      };
    }
  };

  // Thêm hàm hủy đơn và hoàn tiền MoMo
  const cancelAndRefundMomoOrder = async (orderId) => {
    try {
      console.log(`[FE] Bắt đầu quy trình hủy đơn và hoàn tiền cho đơn hàng ${orderId}`);
      
      // Kiểm tra xem đơn hàng đã bị hủy chưa
      const orderResponse = await axios.get(`http://localhost:8080/api/orders/${orderId}`);
      const orderData = orderResponse.data;
      
      if (orderData.statusId === 5) {
        console.log(`[FE] Đơn hàng ${orderId} đã được hủy trước đó`);
        return { success: false, message: "Đơn hàng này đã được hủy trước đó" };
      }
      
      // Lấy thông tin thanh toán MoMo từ localStorage
      const momoPaymentInfoStr = localStorage.getItem(`momo_payment_${orderId}`);
      console.log(`[FE] Thông tin thanh toán MoMo từ localStorage:`, momoPaymentInfoStr);
      
      // Kiểm tra thông tin từ server trước
      try {
        console.log(`[FE] Lấy thông tin đơn hàng từ server để xác minh thông tin MoMo`);
        const orderDetailResponse = await axios.get(`http://localhost:8080/api/orders/${orderId}`);
        const orderDetailData = orderDetailResponse.data;
        
        // Kiểm tra xem có thông tin MoMo trong DB không
        if (orderDetailData.momoTransId) {
          console.log(`[FE] Tìm thấy thông tin MoMo từ server: momoTransId=${orderDetailData.momoTransId}, momoOrderId=${orderDetailData.momoOrderId}`);
          
          // Hiển thị thông tin đang xử lý
          Swal.fire({
            title: "Đang xử lý...",
            text: "Đang hủy đơn hàng và yêu cầu hoàn tiền từ MoMo",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          // Yêu cầu hoàn tiền MoMo sử dụng thông tin từ DB
          const refundResult = await refundMomoPayment(
            orderDetailData.momoOrderId,
            orderDetailData.momoAmount || String(Math.round(orderDetailData.totalAmount)),
            orderDetailData.momoTransId,
          );
          
          console.log(`[FE] Kết quả hoàn tiền MoMo (DB):`, refundResult);
          
          // Tiếp tục xử lý như bình thường...
          // Cập nhật trạng thái đơn hàng và payment_status dựa trên kết quả hoàn tiền
          const paymentStatus = refundResult.success ? "Đã hoàn tiền" : "Đã hủy thanh toán";
          console.log(`[FE] Cập nhật trạng thái đơn hàng thành: ${paymentStatus}`);
          
          const updateResponse = await axios.put(
            `http://localhost:8080/api/orders/${orderId}/status`,
            { 
              statusId: 5,
              paymentStatus: paymentStatus,
              cancelReason: refundResult.success 
                ? "Hủy đơn hàng và hoàn tiền thành công" 
                : `Hủy đơn hàng, hoàn tiền không thành công: ${refundResult.message}`
            },
            { headers: { "Content-Type": "application/json" } }
          );
          
          console.log(`[FE] Kết quả cập nhật trạng thái đơn hàng:`, updateResponse.data);
          
          // Hiển thị thông báo dựa trên kết quả hoàn tiền
          Swal.close();
          
          if (refundResult.success) {
            localStorage.removeItem(`momo_payment_${orderId}`);
            Swal.fire({
              title: "Thành công!",
              text: "Đã hủy đơn hàng và gửi yêu cầu hoàn tiền thành công qua MoMo. Tiền sẽ được hoàn về tài khoản của bạn trong vòng 24 giờ.",
              icon: "success"
            }).then(() => {
              window.location.reload();
            });
            
            return { 
              success: true, 
              message: "Đã hủy đơn hàng và hoàn tiền thành công qua MoMo" 
            };
          } else {
            Swal.fire({
              title: "Đã hủy đơn",
              text: `Đơn hàng đã được hủy nhưng gặp vấn đề khi hoàn tiền tự động: ${refundResult.message}. Vui lòng liên hệ nhân viên hỗ trợ.`,
              icon: "warning"
            }).then(() => {
              window.location.reload();
            });
            
            return { 
              success: true, 
              message: `Đã hủy đơn hàng nhưng gặp vấn đề khi hoàn tiền: ${refundResult.message}` 
            };
          }
          
          // Kết thúc xử lý khi có thông tin từ DB
          return;
        } else {
          console.log(`[FE] Không tìm thấy thông tin MoMo trên server, sẽ kiểm tra localStorage`);
        }
      } catch (serverError) {
        console.error(`[FE] Lỗi khi lấy thông tin đơn hàng từ server:`, serverError);
        // Tiếp tục sử dụng dữ liệu localStorage nếu không lấy được từ server
      }
      
      if (!momoPaymentInfoStr) {
        console.error(`[FE] Không tìm thấy thông tin thanh toán MoMo cho đơn hàng ${orderId}`);
        
        Swal.fire({
          title: "Cảnh báo",
          text: "Không tìm thấy thông tin thanh toán MoMo. Vẫn tiếp tục hủy đơn hàng nhưng không thể hoàn tiền tự động.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Vẫn hủy đơn",
          cancelButtonText: "Quay lại"
        }).then(async (result) => {
          if (result.isConfirmed) {
            await axios.put(
              `http://localhost:8080/api/orders/${orderId}/status`,
              { 
                statusId: 5,
                paymentStatus: "Đã hủy thanh toán",
                cancelReason: "Hủy đơn theo yêu cầu người dùng (không có thông tin hoàn tiền)"
              },
              { headers: { "Content-Type": "application/json" } }
            );
            
            Swal.fire("Thành công", "Đã hủy đơn hàng", "success").then(() => {
              window.location.reload();
            });
          }
        });
        
        return { 
          success: false, 
          message: "Không tìm thấy thông tin thanh toán MoMo để hoàn tiền" 
        };
      }
    } catch (error) {
      console.error(`[FE] Lỗi trong quá trình hủy đơn và hoàn tiền:`, error);
      Swal.fire({
        title: "Lỗi!",
        text: `Không thể hủy đơn hàng và hoàn tiền: ${error.response?.data?.message || error.message}`,
        icon: "error"
      });
      
      return { 
        success: false, 
        message: `Lỗi khi hủy đơn hàng và hoàn tiền: ${error.response?.data?.message || error.message}` 
      };
    }
  };

  // Xuất hàm hủy đơn và hoàn tiền để sử dụng ở các component khác
  const handleCancelOrder = async (orderId, paymentMethod) => {
    try {
      // Đánh dấu đơn hàng đang được xử lý để tránh người dùng nhấn nút nhiều lần
      if (localStorage.getItem(`cancelling_order_${orderId}`)) {
        console.log(`[FE] Đơn hàng ${orderId} đang được xử lý, vui lòng đợi`);
        Swal.fire({
          title: "Đang xử lý",
          text: "Yêu cầu của bạn đang được xử lý, vui lòng đợi",
          icon: "info"
        });
        return;
      }
      
      localStorage.setItem(`cancelling_order_${orderId}`, "true");
      
      if (paymentMethod === "MoMo") {
        // Hiện hộp thoại xác nhận
        const result = await Swal.fire({
          title: "Xác nhận hủy đơn hàng",
          text: "Bạn có chắc muốn hủy đơn hàng này? Tiền sẽ được hoàn về ví MoMo của bạn.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Đồng ý hủy đơn",
          cancelButtonText: "Quay lại"
        });
        
        if (result.isConfirmed) {
          // Gọi API hủy đơn và hoàn tiền
          const cancelResult = await cancelAndRefundMomoOrder(orderId);
          
          // Kết quả đã được xử lý trong hàm cancelAndRefundMomoOrder
          // Chỉ xử lý nếu có lỗi
          if (!cancelResult.success) {
            Swal.fire("Thông báo", cancelResult.message, "info");
          }
        }
      } else if (paymentMethod === "VNPay") {
        // Xử lý hủy đơn VNPay tương tự MoMo
        const result = await Swal.fire({
          title: "Xác nhận hủy đơn hàng",
          text: "Bạn có chắc muốn hủy đơn hàng này? Tiền sẽ được hoàn về tài khoản của bạn.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Đồng ý hủy đơn",
          cancelButtonText: "Quay lại"
        });
        
        if (result.isConfirmed) {
          // Hiển thị thông báo loading
          Swal.fire({
            title: "Đang xử lý...",
            text: "Vui lòng đợi trong khi chúng tôi hủy đơn hàng",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          try {
            // Cập nhật trạng thái đơn và payment_status
            await axios.put(
              `http://localhost:8080/api/orders/${orderId}/status`,
              { 
                statusId: 5,
                paymentStatus: "Đã hoàn tiền",  // Giả định VNPay tự động hoàn tiền
                cancelReason: "Hủy đơn hàng theo yêu cầu của khách hàng"
              },
              { headers: { "Content-Type": "application/json" } }
            );
            
            Swal.fire({
              title: "Thành công!",
              text: "Đơn hàng đã được hủy. Số tiền sẽ được hoàn trả vào tài khoản của bạn.",
              icon: "success"
            }).then(() => {
              window.location.reload();
            });
          } catch (error) {
            console.error(`[FE] Lỗi khi hủy đơn hàng VNPay ${orderId}:`, error);
            Swal.fire({
              title: "Lỗi!",
              text: `Không thể hủy đơn hàng: ${error.response?.data?.message || error.message}`,
              icon: "error"
            });
          }
        }
      } else {
        // Xử lý hủy đơn COD
        const result = await Swal.fire({
          title: "Xác nhận hủy đơn hàng",
          text: "Bạn có chắc muốn hủy đơn hàng này?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Đồng ý hủy đơn",
          cancelButtonText: "Quay lại"
        });
        
        if (result.isConfirmed) {
          // Hiển thị thông báo loading
          Swal.fire({
            title: "Đang xử lý...",
            text: "Vui lòng đợi trong khi chúng tôi hủy đơn hàng",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          try {
            // Gọi API hủy đơn
            await axios.put(
              `http://localhost:8080/api/orders/${orderId}/status`,
              { 
                statusId: 5,
                paymentStatus: "Đã hủy thanh toán",
                cancelReason: "Hủy đơn hàng theo yêu cầu của khách hàng"
              },
              { headers: { "Content-Type": "application/json" } }
            );
            
            Swal.fire({
              title: "Thành công!",
              text: "Đơn hàng đã được hủy thành công",
              icon: "success"
            }).then(() => {
              window.location.reload();
            });
          } catch (error) {
            console.error(`[FE] Lỗi khi hủy đơn hàng COD ${orderId}:`, error);
            Swal.fire({
              title: "Lỗi!",
              text: `Không thể hủy đơn hàng: ${error.response?.data?.message || error.message}`,
              icon: "error"
            });
          }
        }
      }
    } catch (error) {
      console.error(`[FE] Lỗi trong handleCancelOrder cho đơn hàng ${orderId}:`, error);
      Swal.fire(
        "Lỗi!",
        `Không thể hủy đơn hàng: ${error.response?.data?.message || error.message}`,
        "error"
      );
    } finally {
      // Xóa đánh dấu xử lý đơn hàng
      localStorage.removeItem(`cancelling_order_${orderId}`);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 md:px-0 relative">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-[900px] z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
          {/* Cột bên trái */}
          <div className="md:col-span-2">
            {/* Chọn địa chỉ giao hàng */}
            <h2 className="text-2xl font-bold text-[#fbb321] mb-4">
              Chọn địa chỉ giao hàng
            </h2>
            <select
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              onChange={handleSelectAddress}
              value={
                selectedAddress.isNew ? "new" : selectedAddress.addressId || ""
              }
            >
              <option value="new">➕ Thêm địa chỉ mới</option>
              {addresses.map((address) => (
                <option key={address.addressId} value={address.addressId}>
                  {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}
                </option>
              ))}
            </select>

            {/* Thông tin thanh toán */}
            <h2 className="text-2xl font-bold text-[#fbb321] mb-4 mt-4">
              Thông tin thanh toán
            </h2>
            <form className="space-y-4">
              {[
                { label: "Họ và tên", name: "fullName", type: "text" },
                { label: "Số điện thoại", name: "phone", type: "text" },
                { label: "Địa chỉ", name: "street", type: "text" },
              ].map((field, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center md:space-x-4"
                >
                  <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={
                      field.name === "fullName"
                        ? userInfo?.fullName || ""
                        : field.name === "phone"
                          ? userInfo?.phone || ""
                          : selectedAddress[field.name] || ""
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
                    provinces.map((p) => (
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
                  {districts.map((d) => (
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
                  {wards.map((w) => (
                    <option key={w.WardCode} value={w.WardCode}>
                      {w.WardName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 bg-gray-100 p-4 rounded-lg shadow-md">
                <label className="block text-sm font-medium text-gray-700 md:w-1/3">
                  Mã giảm giá
                </label>
                <select
                  className="mt-1 block w-full md:w-2/3 border border-gray-400 rounded-lg shadow-sm p-3 bg-white text-gray-700 hover:border-blue-500 focus:ring focus:ring-blue-300 overflow-y-auto max-h-40 text-base"
                  value={selectedVoucher}
                  onChange={(e) => setSelectedVoucher(e.target.value)}
                >
                  <option value="" className="text-gray-500 italic">
                    🎟 Chọn mã giảm giá
                  </option>
                  {vouchers
                    .filter((voucher) => {
                      const today = new Date();
                      const expiryDate = new Date(voucher.endDate);
                      return (
                        subtotal >= voucher.condition && // Điều kiện tối thiểu
                        voucher.quantity > 0 && // Còn số lượng
                        expiryDate >= today // Chưa hết hạn
                      );
                    })
                    .map((voucher) => (
                      <option
                        key={voucher.voucherId}
                        value={voucher.voucherId}
                        className="text-gray-800 font-medium bg-gray-100 hover:bg-gray-200 p-2"
                      >
                        {voucher.percents}% | 🎟{" "}
                        <span className="text-green-500">
                          Số lượng: {voucher.quantity}
                        </span>{" "}
                        | ⏳ <span className="text-red-500">{getDaysUntilExpiry(voucher.endDate)}</span>
                      </option>
                    ))}
                </select>
              </div>
            </form>

            {/* Nút Lưu Địa Chỉ */}
            {selectedAddress.isNew && (
              <div className="mt-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md w-full"
                  onClick={handleSaveAddress}
                >
                  Lưu địa chỉ
                </button>
              </div>
            )}

            <div className="mt-8">
              <h1 className="text-2xl font-bold text-yellow-500 mb-6">
                Phương thức thanh toán
              </h1>
              <div className="flex gap-4 items-center flex-wrap">
                {[
                  {
                    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8VNUYiwB1DuoiPYNKl6jXWIcQEOxbNkXM6w&s",
                    text: "Thanh toán VNPay",
                    value: "VNPay",
                  },
                  {
                    img: "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
                    text: "Thanh toán MoMo",
                    value: "MoMo",
                  },
                  {
                    img: "https://toidentowa.com/wp-content/uploads/2017/12/thanh-toan.png.webp",
                    text: "Thanh toán khi nhận hàng (COD)",
                    value: "COD",
                  },
                ].map((method, index) => (
                  <label
                    key={index}
                    className={`flex flex-col items-center justify-center border w-40 h-40 px-3 py-2 rounded-lg cursor-pointer ${paymentMethod === method.value
                      ? "border-yellow-500"
                      : "border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => handlePaymentMethodChange(method.value)}
                      className="mb-2"
                    />
                    <img
                      src={method.img}
                      alt={method.text}
                      className="w-12 h-12 object-cover mb-2 rounded-full"
                    />
                    <span className="font-medium text-xs text-center">
                      {method.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Giỏ hàng */}
          <div className="bg-[#fbb321] p-5  md:p-6 rounded-3xl text-white sticky top-[150px] max-h-[500px] overflow-y-auto w-full md:w-[320px] shadow-2xl z-999 custom-scrollbar">
            <h2 className="text-2xl font-bold mb-5 border-b border-white pb-3 text-center">
              Sản phẩm thanh toán
            </h2>
            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center border-b border-white pb-3"
                >
                  <img
                    src={product.image}
                    alt={product.productName}
                    className="w-16 h-16 rounded-md object-cover border border-white"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-bold text-lg text-sm">
                      {product.productName}
                    </p>
                    <p className="text-sm">
                      Khối lượng: {product.weightValue}kg
                    </p>
                    <p className="text-sm">Màu: {product.colorValue}</p>
                    <p className="text-sm">Size: {product.sizeValue}</p>
                    <p className="text-sm">Số lượng: {product.quantityItem}</p>
                    <p className="text-md font-semibold text-[#ffecd1]">
                      {product.price.toLocaleString()}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Tính toán tổng tiền */}
            <div className="mt-5 space-y-2 text-base">
              <div className="flex justify-between font-medium">
                <p>Tạm tính:</p>
                <p>{subtotal.toLocaleString()}₫</p>
              </div>
              <div className="flex justify-between font-medium">
                <p>Phí giao hàng:</p>
                <p>{shippingFee.toLocaleString()}₫</p>
              </div>
              <div className="flex justify-between font-medium">
                <p>Giảm giá:</p>
                <p>-{discountAmount.toLocaleString()}₫</p>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 border-t border-white pt-3">
                <p>Tổng cộng:</p>
                <p className="text-xl">{totalAmount}₫</p>
              </div>
            </div>

            {/* Nút Thanh toán */}
            <button
              onClick={handleOrderProcess}
              disabled={isProcessing}
              className="mt-5 w-full bg-[#fef0d3] text-[#fbb321] font-bold py-3 rounded-3xl transition-all duration-300 ease-in-out hover:bg-[#408630] hover:text-white hover:shadow-lg"
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
