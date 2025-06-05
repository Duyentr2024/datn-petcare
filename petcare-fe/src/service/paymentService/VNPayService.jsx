import axios from "axios";
import Swal from "sweetalert2";

const VNPayService = {
    // Phương thức thanh toán qua API thay vì redirect
    async createPaymentAPI(amount, bookingData) {
        try {
            // Tạo payload cho thanh toán
            const paymentPayload = {
                amount: Math.round(amount),
                bookingData: bookingData,
                paymentType: "VNPay"
            };
            
            console.log("Creating direct VNPay payment:", paymentPayload);
            
            // Gọi API thanh toán trực tiếp mà không cần redirect
            const response = await axios.post("http://localhost:8080/api/payments/direct-pay", paymentPayload, {
                headers: { "Content-Type": "application/json" },
            });
            
            console.log("Direct payment response:", response.data);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    transactionId: response.data.transactionId,
                    message: "Thanh toán thành công"
                };
            } else {
                throw new Error(response.data?.message || "Thanh toán không thành công");
            }
        } catch (error) {
            console.error("Direct payment error:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán trực tiếp");
        }
    },

    // Phương thức cũ dùng redirect URL (giữ lại để tương thích ngược)
    async createPayment(amount, returnUrl) {
        try {
            const encodedReturnUrl = encodeURIComponent(returnUrl);
            console.log('Creating VNPay payment with amount:', amount, 'returnUrl:', returnUrl);
            console.log('Encoded returnUrl:', encodedReturnUrl);
            
            // Đảm bảo số tiền đã được làm tròn đến số nguyên
            const safeAmount = Math.round(amount);
            
            const paymentRequest = { 
                amount: safeAmount, 
                returnUrl: returnUrl // URL sẽ được mã hóa ở backend
            };
            
            const response = await axios.post("http://localhost:8080/api/vnp/pay", paymentRequest, {
                headers: { "Content-Type": "application/json" },
            });
            
            console.log('VNPay response:', response.data);
            
            if (!response.data || !response.data.paymentUrl) {
                throw new Error("Không nhận được URL thanh toán từ VNPay");
            }
            
            return response.data.paymentUrl;
        } catch (error) {
            console.error("Error creating VNPay payment:", error);
            if (error.response) {
                console.error("Error response:", error.response.status, error.response.data);
            }
            throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán VNPay");
        }
    },

    // Phương thức demo/test - giả lập thanh toán thành công cho môi trường phát triển
    async mockPayment(amount, bookingData) {
        // Giả lập delay thanh toán
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("Mock payment completed for amount:", amount);
        console.log("Booking data:", bookingData);
        
        return {
            success: true,
            transactionId: "MOCK_" + Date.now(),
            message: "Thanh toán thành công (giả lập)"
        };
    },

    async handlePaymentResult(urlParams, pendingOrder, updateOrder, decrementVoucher, navigate, clearPendingOrder, cancelOrder) {
        const vnpResponseCode = urlParams.get("vnp_ResponseCode");
        const vnpTxnRef = urlParams.get("vnp_TxnRef");

        if (!vnpResponseCode || !pendingOrder) return;

        let message, icon;
        switch (vnpResponseCode) {
            case "00":
                message = "Thanh toán thành công!";
                icon = "success";
                await updateOrder(pendingOrder.orderDetails);
                if (pendingOrder.voucherId) await decrementVoucher(pendingOrder.voucherId);
                await clearPendingOrder();
                break;
            case "24":
                message = "Bạn đã hủy thanh toán.";
                icon = "info";
                await cancelOrder(); // Update to "Đã hủy thanh toán"
                break;
            default:
                message = `Thanh toán không thành công. Mã lỗi: ${vnpResponseCode}, Mã tra cứu: ${vnpTxnRef}`;
                icon = "error";
                await cancelOrder(); // Update to "Đã hủy thanh toán" for other failures
                break;
        }

        Swal.fire({ title: vnpResponseCode === "00" ? "Thành công!" : "Thông báo", text: message, icon }).then(() => {
            if (vnpResponseCode === "00") {
                navigate("/my-account/history");
            }
        });
    },
};

export default VNPayService;