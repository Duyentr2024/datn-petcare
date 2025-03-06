import axios from "axios";
import Swal from "sweetalert2";

const VNPayService = {
    async createPayment(amount, returnUrl) {
        try {
            const paymentRequest = { amount: Math.round(amount), returnUrl };
            const response = await axios.post("http://localhost:8080/api/vnp/pay", paymentRequest, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data.paymentUrl;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán VNPay");
        }
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