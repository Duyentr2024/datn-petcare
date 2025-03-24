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
        // Tạo đơn hàng trước khi tạo URL thanh toán
        const response = await axios.post(
          "http://localhost:8080/api/orders/checkout",
          orderDetails,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const orderId = response.data.orderId;
        console.log(`[FE] Order created for VNPay: orderId=${orderId}`);

        localStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            orderId,
            orderDetails,
            voucherId: selectedVoucher,
          })
        );

        try {
          const amount = Math.round(totalBeforeDiscount - discountAmount);
          const paymentUrl = await VNPayService.createPayment(
            amount,
            `${window.location.origin}/checkout`
          );
          console.log(`[FE] Redirecting to VNPay payment URL: ${paymentUrl}`);
          window.location.href = paymentUrl;
        } catch (paymentError) {
          console.error(`[FE] Error creating VNPay payment: ${paymentError.message}`);
          // Hủy đơn hàng đã tạo
          await axios.put(
            `http://localhost:8080/api/orders/${orderId}/status`,
            { paymentStatus: "Đã hủy thanh toán" },
            { headers: { "Content-Type": "application/json" } }
          );
          Swal.fire("Lỗi!", `Không thể tạo thanh toán VNPay: ${paymentError.message}`, "error");
        }
      } else if (paymentMethod === "MoMo") {
        try {
          // Đầu tiên, thử tạo URL thanh toán MoMo trước khi tạo đơn hàng
          const amount = Math.round(totalBeforeDiscount - discountAmount);
          const paymentUrl = await MomoService.createPayment(
            String(amount),
            `${window.location.origin}/checkout`
          );
          
          // Sau khi có URL thanh toán MoMo, tạo đơn hàng trong database
          const response = await axios.post(
            "http://localhost:8080/api/orders/checkout",
            orderDetails,
            {
              headers: { "Content-Type": "application/json" },
            }
          );
          const orderId = response.data.orderId;
          console.log(`[FE] Order created for MoMo: orderId=${orderId}`);

          localStorage.setItem(
            "pendingOrder",
            JSON.stringify({
              orderId,
              orderDetails,
              voucherId: selectedVoucher,
              paymentMethod: "MoMo"
            })
          );

          console.log(`[FE] Redirecting to MoMo payment URL: ${paymentUrl}`);
          window.location.href = paymentUrl;
        } catch (error) {
          console.error(`[FE] Error creating MoMo payment: ${error.message}`);
          
          // Nếu đơn hàng đã được tạo (có trong localStorage), hủy nó
          const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
          if (pendingOrder && pendingOrder.orderId) {
            try {
              await axios.delete(
                `http://localhost:8080/api/orders/${pendingOrder.orderId}/payment-failed`
              );
              console.log(`[FE] Cancelled order ${pendingOrder.orderId} due to payment failure`);
              localStorage.removeItem("pendingOrder");
            } catch (cancelError) {
              console.error(`[FE] Error cancelling order: ${cancelError.message}`);
            }
          }
          
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
    const handlePaymentResult = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));
      const vnpTxnRef = urlParams.get("vnp_TxnRef");
      const momoOrderId = urlParams.get("orderId");

      // Skip if no pending order or if we've already processed this transaction
      if (
        (!vnpTxnRef && !momoOrderId) ||
        !pendingOrder ||
        (vnpTxnRef && localStorage.getItem(`processed_${vnpTxnRef}`)) ||
        (momoOrderId && localStorage.getItem(`processed_${momoOrderId}`))
      ) {
        console.log(
          `[FE] Skipping payment result processing: vnpTxnRef=${vnpTxnRef}, momoOrderId=${momoOrderId}`
        );
        return;
      }

      // Handle VNPay payment result
      if (vnpTxnRef && pendingOrder.paymentMethod !== "MoMo") {
        console.log(
          `[FE] Processing VNPay payment result for orderId: ${pendingOrder.orderId}, vnpTxnRef: ${vnpTxnRef}`
        );
        localStorage.setItem(`processed_${vnpTxnRef}`, "true");
        setHasProcessed(true);
        if (vnpTxnRef) setProcessedTxnRef(vnpTxnRef);

        try {
          const vnpResponseCode = urlParams.get("vnp_ResponseCode");
          let message, icon;

          switch (vnpResponseCode) {
            case "00":
              message = "Thanh toán thành công!";
              icon = "success";
              console.log(
                `[FE] VNPay success, updating paymentStatus to "Chờ xác nhận" for orderId: ${pendingOrder.orderId}`
              );
              await axios.put(
                `http://localhost:8080/api/orders/${pendingOrder.orderId}/status`,
                { paymentStatus: "Chờ xác nhận" },
                { headers: { "Content-Type": "application/json" } }
              );
              if (pendingOrder.voucherId) {
                console.log(
                  `[FE] Decrementing voucher quantity for voucherId: ${pendingOrder.voucherId}`
                );
                await VoucherService.decrementVoucherQuantity(
                  pendingOrder.voucherId
                );
              }
              localStorage.removeItem("pendingOrder");
              await clearCart();
              console.log(
                `[FE] Cart cleared and pendingOrder removed for orderId: ${pendingOrder.orderId}`
              );
              break;
            case "24":
              message = "Bạn đã hủy thanh toán.";
              icon = "info";
              console.log(
                `[FE] VNPay cancelled, updating paymentStatus to "Đã hủy thanh toán" for orderId: ${pendingOrder.orderId}`
              );
              await axios.put(
                `http://localhost:8080/api/orders/${pendingOrder.orderId}/status`,
                { paymentStatus: "Đã hủy thanh toán" },
                { headers: { "Content-Type": "application/json" } }
              );
              break;
            default:
              message = `Thanh toán không thành công. Mã lỗi: ${vnpResponseCode}, Mã tra cứu: ${vnpTxnRef}`;
              icon = "error";
              console.log(
                `[FE] VNPay failed, updating paymentStatus to "Đã hủy thanh toán" for orderId: ${pendingOrder.orderId}`
              );
              await axios.put(
                `http://localhost:8080/api/orders/${pendingOrder.orderId}/status`,
                { paymentStatus: "Đã hủy thanh toán" },
                { headers: { "Content-Type": "application/json" } }
              );
              break;
          }

          Swal.fire({
            title: vnpResponseCode === "00" ? "Thành công!" : "Thông báo",
            text: message,
            icon,
          }).then(() => {
            if (vnpResponseCode === "00") {
              navigate("/my-account/history");
            }
          });
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error(`[FE] Error handling VNPay payment result: ${error.message}`);
          Swal.fire(
            "Lỗi!",
            "Không thể xử lý kết quả thanh toán: " +
            (error.response?.data?.message || error.message),
            "error"
          );
        }
      }
      
      // Handle MoMo payment result
      else if (momoOrderId && pendingOrder.paymentMethod === "MoMo") {
        console.log(
          `[FE] Processing MoMo payment result for orderId: ${pendingOrder.orderId}, momoOrderId: ${momoOrderId}`
        );
        localStorage.setItem(`processed_${momoOrderId}`, "true");
        setHasProcessed(true);

        try {
          // Get the response code from MoMo
          const resultCode = urlParams.get("resultCode");
          let message, icon;

          // Check MoMo payment status
          const statusResponse = await MomoService.checkPaymentStatus(momoOrderId);
          
          switch (resultCode) {
            case "0": // Success
              message = "Thanh toán MoMo thành công!";
              icon = "success";
              console.log(
                `[FE] MoMo success, updating paymentStatus to "Chờ xác nhận" for orderId: ${pendingOrder.orderId}`
              );
              await axios.put(
                `http://localhost:8080/api/orders/${pendingOrder.orderId}/status`,
                { paymentStatus: "Chờ xác nhận" },
                { headers: { "Content-Type": "application/json" } }
              );
              if (pendingOrder.voucherId) {
                console.log(
                  `[FE] Decrementing voucher quantity for voucherId: ${pendingOrder.voucherId}`
                );
                await VoucherService.decrementVoucherQuantity(
                  pendingOrder.voucherId
                );
              }
              localStorage.removeItem("pendingOrder");
              await clearCart();
              console.log(
                `[FE] Cart cleared and pendingOrder removed for orderId: ${pendingOrder.orderId}`
              );
              break;
            case "1006": // User canceled
              message = "Bạn đã hủy thanh toán MoMo.";
              icon = "info";
              console.log(
                `[FE] MoMo cancelled, updating paymentStatus to "Đã hủy thanh toán" for orderId: ${pendingOrder.orderId}`
              );
              await axios.put(
                `http://localhost:8080/api/orders/${pendingOrder.orderId}/status`,
                { paymentStatus: "Đã hủy thanh toán" },
                { headers: { "Content-Type": "application/json" } }
              );
              break;
            default:
              message = `Thanh toán MoMo không thành công. Mã lỗi: ${resultCode}`;
              icon = "error";
              console.log(
                `[FE] MoMo failed, updating paymentStatus to "Đã hủy thanh toán" for orderId: ${pendingOrder.orderId}`
              );
              await axios.put(
                `http://localhost:8080/api/orders/${pendingOrder.orderId}/status`,
                { paymentStatus: "Đã hủy thanh toán" },
                { headers: { "Content-Type": "application/json" } }
              );
              break;
          }

          Swal.fire({
            title: resultCode === "0" ? "Thành công!" : "Thông báo",
            text: message,
            icon,
          }).then(() => {
            if (resultCode === "0") {
              navigate("/my-account/history");
            }
          });
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error(`[FE] Error handling MoMo payment result: ${error.message}`);
          Swal.fire(
            "Lỗi!",
            "Không thể xử lý kết quả thanh toán MoMo: " +
            (error.response?.data?.message || error.message),
            "error"
          );
        }
      }
    };

    handlePaymentResult();
  }, [navigate, hasProcessed, processedTxnRef]);

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