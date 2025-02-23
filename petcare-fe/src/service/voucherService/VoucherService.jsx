import API_BASE_URL from "../../config";
import axios from "axios";

const VoucherService = {
   
    // Lấy tất cả voucher
    getAllVouchers: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/vouchers/getAllVouchers`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách voucher:", error);
            throw error;
        }
    },

    // Giảm số lượng voucher
    decrementVoucherQuantity: async (voucherId) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/vouchers/${voucherId}/decrement`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi giảm số lượng voucher:", error);
            throw error;
        }
    }
};

export default VoucherService;
