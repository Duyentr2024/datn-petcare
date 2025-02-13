import axios from "axios";

const GHN_TOKEN = "0fe4c8c9-71cd-11ef-9839-ea1b8b4124d2"; // 🔥 API Token GHN
const GHN_API_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";
const GHNService = {

    getShippingFee: async ({ fromDistrictId, toDistrictId, weight, serviceTypeId = 2 }) => {
        try {
            const response = await axios.post(
                GHN_API_URL,
                {
                    from_district_id: fromDistrictId,
                    to_district_id: toDistrictId,
                    service_type_id: serviceTypeId,
                    weight,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Token': GHN_TOKEN,
                    },
                }
            );
            return response.data.data.total;
        } catch (error) {
            console.error("Error getting shipping fee:", error);
            return 0;
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