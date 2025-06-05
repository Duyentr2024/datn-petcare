import axios from "axios";
import Swal from "sweetalert2";

const MomoService = {
    async createPayment(amount, returnUrl, orderId = null) {
        try {
            // Đảm bảo amount là số nguyên (không có phần thập phân)
            const paymentRequest = { 
                amount: String(Math.round(amount)),
                returnUrl: returnUrl,
                orderId: `PETCARESPA_${Date.now()}` // Thêm orderId để dễ tracking
            };
            
            // Thêm orderId vào request nếu được cung cấp
            if (orderId) {
                paymentRequest.orderId = orderId;
                console.log(`[FE] Including orderId in MoMo payment request: ${orderId}`);
            }
            console.log("MoMo payment request:", paymentRequest);

            
            const response = await axios.post("http://localhost:8080/api/momo", paymentRequest, {
                headers: { "Content-Type": "application/json" },
            });
            
            console.log("MoMo API response:", response.data);
            
            // Handle response based on its structure
            if (response.data.resultCode && response.data.resultCode !== 0) {
                throw new Error(response.data.message || "MoMo payment creation failed");
            }
            
            // Check if response contains payUrl directly
            if (response.data.payUrl) {
                return response.data.payUrl;
            }
            
            // If payUrl is nested in a data property
            if (response.data.data && response.data.data.payUrl) {
                return response.data.data.payUrl;
            }
            
            throw new Error("Invalid MoMo response: Missing payment URL");
        } catch (error) {
            console.error("MoMo payment error:", error);
            if (error.response && error.response.data) {
                console.error("MoMo API error details:", error.response.data);
                throw new Error(error.response.data.message || "Lỗi khi tạo thanh toán MoMo");
            }
            throw error; // Throw the original error to maintain the stack trace
        }
    },

    async checkPaymentStatus(orderId) {
        try {
            const response = await axios.get(`http://localhost:8080/api/momo/order-status/${orderId}`);
            
            // Check if response contains error property
            if (response.data.error) {
                throw new Error(response.data.message || "Lỗi kiểm tra trạng thái thanh toán MoMo");
            }
            
            return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        } catch (error) {
            console.error("MoMo status check error:", error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Lỗi khi kiểm tra trạng thái thanh toán MoMo");
            }
            throw new Error(error.message || "Lỗi khi kiểm tra trạng thái thanh toán MoMo");
        }
    }
};

export default MomoService; 