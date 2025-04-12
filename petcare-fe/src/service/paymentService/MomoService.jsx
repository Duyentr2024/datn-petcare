import axios from "axios";
import Swal from "sweetalert2";

const MomoService = {
    async createPayment(amount, returnUrl, orderId = null) {
        try {
            const paymentRequest = { 
                amount: String(Math.round(amount)),
                returnUrl: returnUrl
            };
            
            // Thêm orderId vào request nếu được cung cấp
            if (orderId) {
                paymentRequest.orderId = orderId;
                console.log(`[FE] Including orderId in MoMo payment request: ${orderId}`);
            }
            
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
    },
    
    /**
     * Gọi API sửa lỗi momoAmount "undefined" trong database
     * @returns Kết quả sửa lỗi
     */
    async fixUndefinedMomoAmount() {
        try {
            console.log("[FE] Calling API to fix undefined momoAmount...");
            
            const response = await axios.post(
                "http://localhost:8080/api/orders/fix-undefined-momo-amount",
                {},
                { headers: { "Content-Type": "application/json" } }
            );
            
            console.log("[FE] Fix undefined momoAmount result:", response.data);
            
            if (response.data.success) {
                Swal.fire({
                    title: "Thành công!",
                    text: `Đã sửa ${response.data.fixedCount} đơn hàng có momoAmount không hợp lệ.`,
                    icon: "success"
                });
            } else {
                Swal.fire({
                    title: "Lỗi!",
                    text: response.data.message || "Không thể sửa lỗi momoAmount",
                    icon: "error"
                });
            }
            
            return response.data;
        } catch (error) {
            console.error("[FE] Error fixing undefined momoAmount:", error);
            
            Swal.fire({
                title: "Lỗi!",
                text: error.response?.data?.message || error.message || "Lỗi khi sửa lỗi momoAmount",
                icon: "error"
            });
            
            throw error;
        }
    },

    /**
     * Kiểm tra và hoàn tất các đơn hàng MoMo đang xử lý dở
     * Gọi API backend để kiểm tra và cập nhật trạng thái đơn hàng
     */
    async verifyPendingMomoOrders() {
        try {
            console.log("[FE] Verifying pending MoMo orders...");
            
            // Kiểm tra URL và localStorage để xử lý lại nếu cần
            const urlParams = new URLSearchParams(window.location.search);
            const momoOrderId = urlParams.get("orderId");
            const resultCode = urlParams.get("resultCode");
            const momoTransId = urlParams.get("transId");
            const pendingMomoOrder = localStorage.getItem("pendingMomoOrder");
            
            // Nếu có thông tin thanh toán MoMo trên URL nhưng không có thông tin trong localStorage
            // Có thể là do trang đã được refresh hoặc có lỗi trước đó
            if (momoOrderId && resultCode === "0" && momoTransId && !pendingMomoOrder) {
                console.log("[FE] Found MoMo payment info in URL but no pendingMomoOrder in localStorage");
                console.log("[FE] Checking if this order exists and needs completion...");
                
                // Gọi API để kiểm tra/cập nhật đơn hàng
                const response = await axios.post(
                    "http://localhost:8080/api/orders/fix-undefined-momo-amount",
                    {},
                    { headers: { "Content-Type": "application/json" } }
                );
                
                console.log("[FE] Fix pending MoMo orders result:", response.data);
                if (response.data.fixedCount > 0) {
                    Swal.fire({
                        title: "Thông báo",
                        text: `Đã cập nhật ${response.data.fixedCount} đơn hàng MoMo đang xử lý.`,
                        icon: "success"
                    });
                    
                    // Xóa query params để tránh xử lý lại
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error("[FE] Error verifying pending MoMo orders:", error);
            return false;
        }
    }
};

export default MomoService; 