import axios from "axios";

const GHN_TOKEN = "0fe4c8c9-71cd-11ef-9839-ea1b8b4124d2"; // 🔥 API Token GHN

const GHNService = {
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