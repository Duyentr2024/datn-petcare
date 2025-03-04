import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/statistics";

const StatisticsService = {
  getBestSellingProducts: () => {
    return axios.get(`${API_BASE_URL}/best-selling-products`);
  },

  getRevenue: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue`, {
      params: { startDate, endDate },
    });
  },

  getDailyRevenue: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/daily`, {
      params: { startDate, endDate },
    });
  },

  getRevenueToday: () => {
    return axios.get(`${API_BASE_URL}/revenue/today`);
  },

  getRevenueYesterday: () => {
    return axios.get(`${API_BASE_URL}/revenue/yesterday`);
  },

  getWeeklyRevenue: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/weekly`, {
      params: { startDate, endDate },
    });
  },

  getDailyRevenueCurrentMonth: () => {
    return axios.get(`${API_BASE_URL}/revenue/daily-current-month`);
  },

  getRevenueThisMonth: () => {
    return axios.get(`${API_BASE_URL}/revenue/month`);
  },

  getRevenueThisYear: () => {
    return axios.get(`${API_BASE_URL}/revenue/year`);
  },

  // Tổng số đơn hàng trong ngày hôm nay (bao gồm OFFLINE và ORDER ONLINE)
  getTotalOrdersToday: () => {
    return axios.get(`${API_BASE_URL}/orders/today`);
  },

  // Tổng số đơn hàng hôm qua
  getTotalOrdersYesterday: () => {
    return axios.get(`${API_BASE_URL}/orders/yesterday`);
  },

  // Tổng số đơn hàng offline và online hôm qua
  getYesterdayOrderStats: () => {
    return axios.get(`${API_BASE_URL}/yesterday-stats`);
  },

  // Tổng số đơn hàng trong tuần này
  getTotalOrdersThisWeek: () => {
    return axios.get(`${API_BASE_URL}/orders/week`);
  },

  // Tổng số đơn hàng trong tháng này (bao gồm OFFLINE và ORDER ONLINE)
  getTotalOrdersThisMonth: () => {
    return axios.get(`${API_BASE_URL}/orders/month`);
  },

  // Tổng số đơn hàng trong khoảng thời gian (bao gồm OFFLINE và ORDER ONLINE)
  getOrdersByDateRange: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/range`, {
      params: { startDate, endDate },
    });
  },

  getDailyOrderCountByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/daily-by-type`, {
      params: { startDate, endDate },
    });
  },


  getWeeklyOrderCountByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/weekly-by-type`, {
      params: { startDate, endDate },
    });
  },

  getMonthlyOrderCountByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/monthly-by-type`, {
      params: { startDate, endDate },
    });
  },

  // Tổng số khách hàng
  getTotalCustomers: () => {
    return axios.get(`${API_BASE_URL}/total-customers`);
  },

  // Top 5 khách hàng mua nhiều nhất
  getTopFiveCustomers: () => {
    return axios.get(`${API_BASE_URL}/top-customers`);
  },

  getTotalStock: () => {
    return axios.get(`${API_BASE_URL}/total-stock`);
  },

  getStockInfo: () => {
    return axios.get(`${API_BASE_URL}/stock-info`);
  },
};

export default StatisticsService;