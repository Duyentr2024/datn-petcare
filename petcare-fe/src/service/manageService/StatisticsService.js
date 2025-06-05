import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from "../../config";

const StatisticsService = {
  // Lấy danh sách các sản phẩm bán chạy nhất
  getBestSellingProducts: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/best-selling-products`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm bán chạy nhất:", error);
      throw error;
    }
  },

  // Lấy danh sách top 5 sản phẩm được yêu thích nhất
  getTopFavoriteProducts: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/top-favorite-products`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm yêu thích nhất:", error);
      throw error;
    }
  },

  // Lấy tổng doanh thu trong khoảng thời gian
  getRevenue: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu:", error);
      throw error;
    }
  },

  // Lấy doanh thu hàng ngày trong khoảng thời gian
  getDailyRevenue: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/daily`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu hàng ngày:", error);
      throw error;
    }
  },

  // Lấy tổng doanh thu hôm nay
  getRevenueToday: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/today`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu hôm nay:", error);
      throw error;
    }
  },

  // Lấy tổng doanh thu hôm qua
  getRevenueYesterday: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/yesterday`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu hôm qua:", error);
      throw error;
    }
  },

  getWeeklyRevenue: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/weekly`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu hàng tuần:", error);
      throw error;
    }
  },

  // Lấy doanh thu hàng ngày trong tháng hiện tại
  getDailyRevenueCurrentMonth: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/daily-current-month`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy doanh thu hàng ngày trong tháng hiện tại:",
        error
      );
      throw error;
    }
  },

  // Lấy tổng doanh thu tháng hiện tại
  getRevenueThisMonth: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/month`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu tháng hiện tại:", error);
      throw error;
    }
  },

  // Lấy tổng doanh thu năm hiện tại
  getRevenueThisYear: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/year`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu năm hiện tại:", error);
      throw error;
    }
  },

  // Tổng số đơn hàng trong ngày hôm nay (bao gồm OFFLINE và ORDER ONLINE)
  getTotalOrdersToday: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/today`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng số đơn hàng hôm nay:", error);
      throw error;
    }
  },

  // Tổng số đơn hàng hôm qua
  getTotalOrdersYesterday: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/yesterday`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng số đơn hàng hôm qua:", error);
      throw error;
    }
  },

  // Tổng số đơn hàng offline và online hôm qua
  getYesterdayOrderStats: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/yesterday-stats`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê đơn hàng hôm qua:", error);
      throw error;
    }
  },

  // Tổng số đơn hàng trong tuần này
  getTotalOrdersThisWeek: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/week`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng số đơn hàng tuần này:", error);
      throw error;
    }
  },

  // Tổng số đơn hàng trong tháng này (bao gồm OFFLINE và ORDER ONLINE)
  getTotalOrdersThisMonth: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/month`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng số đơn hàng tháng này:", error);
      throw error;
    }
  },

  // Tổng số đơn hàng trong khoảng thời gian (bao gồm OFFLINE và ORDER ONLINE)
  getOrdersByDateRange: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/range`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng trong khoảng thời gian:", error);
      throw error;
    }
  },

  // Lấy số lượng đơn hàng hàng ngày theo loại (ONLINE và OFFLINE)
  getDailyOrderCountByType: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/daily-by-type`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy số lượng đơn hàng hàng ngày theo loại:",
        error
      );
      throw error;
    }
  },

  getWeeklyOrderCountByType: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/weekly-by-type`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy số lượng đơn hàng hàng tuần theo loại:",
        error
      );
      throw error;
    }
  },

  // Lấy số lượng đơn hàng hàng tháng theo loại (ONLINE và OFFLINE)
  getMonthlyOrderCountByType: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/monthly-by-type`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy số lượng đơn hàng hàng tháng theo loại:",
        error
      );
      throw error;
    }
  },

  // Tổng doanh thu offline và online hôm nay
  getRevenueTodayByType: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/today/by-type`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu hôm nay theo loại:", error);
      throw error;
    }
  },

  // Tổng doanh thu offline và online hôm qua
  getRevenueYesterdayByType: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/yesterday/by-type`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu hôm qua theo loại:", error);
      throw error;
    }
  },

  // Tổng doanh thu offline và online tháng này
  getRevenueThisMonthByType: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/this-month/by-type`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng doanh thu tháng này theo loại:", error);
      throw error;
    }
  },

  // Tổng doanh thu online và offline từng ngày trong khoảng thời gian
  getDailyRevenueByType: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/daily-by-type`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu hàng ngày theo loại:", error);
      throw error;
    }
  },

  // Tổng doanh thu online và offline từng tuần trong khoảng thời gian
  getWeeklyRevenueByType: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/weekly-by-type`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu hàng tuần theo loại:", error);
      throw error;
    }
  },

  // Tổng doanh thu từng tháng trong khoảng thời gian
  getMonthlyRevenue: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/monthly`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu hàng tháng:", error);
      throw error;
    }
  },

  // Tổng số khách hàng
  getTotalCustomers: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/total-customers`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng số khách hàng:", error);
      throw error;
    }
  },

  // Top 5 khách hàng mua nhiều nhất
  getTopFiveCustomers: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/top-customers`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy top 5 khách hàng:", error);
      throw error;
    }
  },

  // Lấy tổng số lượng sản phẩm còn trong kho
  getTotalStock: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/total-stock`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tổng số lượng sản phẩm trong kho:", error);
      throw error;
    }
  },

  // Lấy thông tin số lượng sản phẩm còn trong kho
  getStockInfo: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/stock-info`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy thông tin số lượng sản phẩm trong kho:",
        error
      );
      throw error;
    }
  },

  // API sử dụng bộ lọc nhanh (preset)
  getPresetStats: async (preset) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/preset-stats`,
        {
          params: { preset },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê preset:", error);
      throw error;
    }
  },

  // Tổng doanh thu online và offline từng tháng trong khoảng thời gian
  getMonthlyRevenueByType: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/monthly-by-type`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy doanh thu hàng tháng theo loại:", error);
      throw error;
    }
  },

  // Lấy tổng doanh thu OFFLINE hôm nay theo phương thức thanh toán CASH và MOMO
  getOfflineRevenueTodayByPaymentMethod: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/offline/today/by-payment-method`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy tổng doanh thu OFFLINE hôm nay theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy tổng doanh thu OFFLINE tháng hiện tại theo phương thức thanh toán CASH và MOMO
  getOfflineRevenueThisMonthByPaymentMethod: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/offline/this-month/by-payment-method`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy tổng doanh thu OFFLINE tháng hiện tại theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy tổng doanh thu OFFLINE trong khoảng thời gian theo phương thức thanh toán CASH và MOMO
  getOfflineRevenueByDateRangeAndPaymentMethod: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/offline/range/by-payment-method`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy tổng doanh thu OFFLINE trong khoảng thời gian theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy doanh thu hàng ngày của đơn hàng OFFLINE theo phương thức thanh toán CASH và MOMO
  getDailyOfflineRevenueByPaymentMethod: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/offline/daily/by-payment-method`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy doanh thu hàng ngày OFFLINE theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy doanh thu hàng tuần của đơn hàng OFFLINE theo phương thức thanh toán CASH và MOMO
  getWeeklyOfflineRevenueByPaymentMethod: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/offline/weekly/by-payment-method`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy doanh thu hàng tuần OFFLINE theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy doanh thu hàng tháng của đơn hàng OFFLINE theo phương thức thanh toán CASH và MOMO
  getMonthlyOfflineRevenueByPaymentMethod: async (startDate, endDate) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/revenue/offline/monthly/by-payment-method`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy doanh thu hàng tháng OFFLINE theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy số lượng đơn hàng OFFLINE hôm nay theo phương thức thanh toán CASH và MOMO
  getOfflineOrderCountTodayByPaymentMethod: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/offline/today/by-payment-method`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy số lượng đơn hàng OFFLINE hôm nay theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy số lượng đơn hàng OFFLINE tháng hiện tại theo phương thức thanh toán CASH và MOMO
  getOfflineOrderCountThisMonthByPaymentMethod: async () => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/offline/this-month/by-payment-method`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy số lượng đơn hàng OFFLINE tháng hiện tại theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },

  // Lấy số lượng đơn hàng OFFLINE trong khoảng thời gian theo phương thức thanh toán CASH và MOMO
  getOfflineOrderCountByDateRangeAndPaymentMethod: async (
    startDate,
    endDate
  ) => {
    try {
      const token = Cookies.get("accessToken"); // Lấy token từ cookie
      const response = await axios.get(
        `${API_BASE_URL}/api/statistics/orders/offline/range/by-payment-method`,
        {
          params: { startDate, endDate },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response;
    } catch (error) {
      console.error(
        "Lỗi khi lấy số lượng đơn hàng OFFLINE trong khoảng thời gian theo phương thức thanh toán:",
        error
      );
      throw error;
    }
  },
};

export default StatisticsService;
