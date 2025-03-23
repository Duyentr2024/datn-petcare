import axios from "axios";
import Swal from "sweetalert2";

const MomoService = {
    async createPayment(amount, returnUrl) {
        try {
            const paymentRequest = { 
                amount: String(Math.round(amount)),
                returnUrl: returnUrl
            };
            const response = await axios.post("http://localhost:8080/api/momo", paymentRequest, {
                headers: { "Content-Type": "application/json" },
            });
            
            // Check if response contains error property
            if (response.data.error) {
                throw new Error(response.data.message || "MoMo payment creation failed");
            }
            
            // Parse the response from JSON string to object
            const responseData = typeof response.data === 'string' 
                ? JSON.parse(response.data) 
                : response.data;
                
            if (responseData.error) {
                throw new Error(responseData.error || "MoMo payment creation failed");
            }
            
            if (!responseData.payUrl) {
                throw new Error("Invalid MoMo response: Missing payment URL");
            }
            
            return responseData.payUrl;
        } catch (error) {
            console.error("MoMo payment error:", error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || "Lỗi khi tạo thanh toán MoMo");
            }
            throw new Error(error.message || "Lỗi khi tạo thanh toán MoMo");
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