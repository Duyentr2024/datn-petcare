import API_BASE_URL from "../../config";
import axios from "axios";

const ReviewService = {
    // Thêm đánh giá mới
    addReview: async (reviewData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/reviews/add`, reviewData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi thêm đánh giá:", error);
            throw error;
        }
    },


    // Lấy đánh giá theo orderDetailsId
    getReviewsByOrderDetails: async (orderDetailsId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/order/${orderDetailsId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá theo orderDetailsId:", error);
            throw error;
        }
    },

    // Lấy đánh giá theo userId
    getReviewsByUser: async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá theo userId:", error);
            throw error;
        }
    },

    getReviewsByProductDetail: async (productDetailId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/reviews/product-detail/${productDetailId}`);
            return response.data;
        } catch(error){
            console.error("Lỗi khi tải danh sách đánh giá:", error);
            throw error;
        }
    },
};

export default ReviewService;
