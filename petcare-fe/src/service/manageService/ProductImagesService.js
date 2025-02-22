import axios from "axios";

const API_URL = "http://localhost:8080/api/productImages"; // Adjust URL as needed

const ProductImagesService = {
    // Get all product images
    getAllProductImages: async () => {
        try {
            const response = await axios.get(`${API_URL}/getAllImage`);
            return response.data;
        } catch (error) {
            console.error("Error fetching product images:", error);
            throw error;
        }
    },

    // Get a product image by ID
    getProductImageById: async (imageId) => {
        try {
            const response = await axios.get(`${API_URL}/${imageId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product image by ID ${imageId}:`, error);
            throw error;
        }
    },

     // Get a product image by ID
     getAllImagesByProductDetails: async (productDetailId) => {
        try {
            const response = await axios.get(`${API_URL}/getImages/${productDetailId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching productDetails by image by ID ${productDetailId}:`, error);
            throw error;
        }
    },

    // Create a new product image
    createProductImage: async (imageData) => {  // ✅ Đã sửa lỗi
        try {
            const response = await axios.post(`${API_URL}/addImage`, {
                productDetailId: imageData.productDetailId, // Đúng key theo DTO
                imageUrl: imageData.imageUrl,
            });
            return response.data;
        } catch (error) {
            console.error("Error adding product image:", error.response?.data || error.message);
            throw error;
        }
    },


       // Cập nhật ảnh sản phẩm theo ID
    updateProductImage: async (id, imageData) => {
        await axios.put(`${API_URL}/updates/${id}`, imageData);
    },

    deleteProductImage: async (id) => {
        await axios.delete(`${API_URL}/delete/${id}`);
    },
};


export default ProductImagesService;
