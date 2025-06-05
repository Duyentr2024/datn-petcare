import axios from "axios";

const GHN_TOKEN = "0fe4c8c9-71cd-11ef-9839-ea1b8b4124d2";
const GHN_SHOP_ID = 5321275;
const GHNService = {

    calculateShippingFee: async ({districtId, wardCode, weight}) => {
        try {
            const payload = {
                shop_id: GHN_SHOP_ID,
                to_district_id: districtId,
                to_ward_code: wardCode,
                weight: weight || 1000, // Trọng lượng mặc định
                service_type_id: 2, // E-Commerce Delivery
            };

            console.log("Payload gửi đến GHN:", payload);

            const response = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Token: GHN_TOKEN,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Lỗi từ GHN:", errorData);
                throw new Error(`Lỗi tính phí: ${errorData.message || "Không xác định"}`);
            }

            const data = await response.json();
            return data.data.total; // Trả về phí vận chuyển
        } catch (error) {
            console.error("Lỗi kết nối API GHN:", error.message);
            throw error; // Để xử lý tiếp ở phần gọi hàm
        }
    },

    getProvinces: async () => {
        try {
            const res = await axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
                headers: {Token: GHN_TOKEN}
            });
            return res.data.data || [];
        } catch (error) {
            console.error("❌ Lỗi tải danh sách tỉnh:", error);
            return [];
        }
    },

    getDistricts: async (provinceId) => {
        if (!provinceId || isNaN(provinceId)) return [];
        try {
            const res = await axios.post("https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
                {province_id: Number(provinceId)}, // ✅ Gửi dưới dạng body
                {headers: {Token: GHN_TOKEN, "Content-Type": "application/json"}}
            );
            return res.data.data || [];
        } catch (error) {
            console.error("❌ Lỗi tải danh sách huyện:", error.response?.data || error);
            return [];
        }
    },

    getWards: async (districtId) => {
        if (!districtId || isNaN(districtId)) return [];
        try {
            const res = await axios.post("https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
                {district_id: Number(districtId)}, // ✅ Gửi dưới dạng body
                {headers: {Token: GHN_TOKEN, "Content-Type": "application/json"}}
            );
            return res.data.data || [];
        } catch (error) {
            console.error("❌ Lỗi tải danh sách xã:", error.response?.data || error);
            return [];
        }
    }
};

export default GHNService;