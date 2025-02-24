import API_BASE_URL from "../../config";
import axios from "axios";

const VoucherService = {

    // Tạo mới voucher
    createVoucher: async (voucherData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/vouchers/createVoucher`, voucherData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo voucher:", error);
            throw error;
        }
    },


    // Cập nhật voucher
    updateVoucher: async (voucherId, updatedData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/vouchers/updateVouchers/${voucherId}`, updatedData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi cập nhật voucher:", error);
            throw error;
        }
    },

    // Xóa voucher
    deleteVoucher: async (voucherId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/vouchers/deleteVouchers/${voucherId}`);
        } catch (error) {
            console.error("Lỗi khi xóa voucher:", error);
            throw error;
        }
    },


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
