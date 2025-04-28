import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/statistics";

const StatisticsService = {
  // Lấy danh sách các sản phẩm bán chạy nhất
  getBestSellingProducts: () => {
    return axios.get(`${API_BASE_URL}/best-selling-products`);
  },

  // Lấy danh sách top 5 sản phẩm được yêu thích nhất
  getTopFavoriteProducts: () => {
    return axios.get(`${API_BASE_URL}/top-favorite-products`);
  },

  // Lấy tổng doanh thu trong khoảng thời gian
  getRevenue: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue`, {
      params: { startDate, endDate },
    });
  },

  // Lấy doanh thu hàng ngày trong khoảng thời gian
  getDailyRevenue: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/daily`, {
      params: { startDate, endDate },
    });
  },

  // Lấy tổng doanh thu hôm nay
  getRevenueToday: () => {
    return axios.get(`${API_BASE_URL}/revenue/today`);
  },

  // Lấy tổng doanh thu hôm qua
  getRevenueYesterday: () => {
    return axios.get(`${API_BASE_URL}/revenue/yesterday`);
  },

  // Lấy doanh thu hàng tuần trong khoảng thời gian
  // Backend now returns: 
  // - week: String format "YYYYWW" where week starts on Monday (00:00) and ends on Sunday (23:59)
  // - revenue: total revenue for the week
  // - order_count: total order count for the week
  getWeeklyRevenue: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/weekly`, {
      params: { startDate, endDate },
    });
  },

  // Lấy doanh thu hàng ngày trong tháng hiện tại
  getDailyRevenueCurrentMonth: () => {
    return axios.get(`${API_BASE_URL}/revenue/daily-current-month`);
  },

  // Lấy tổng doanh thu tháng hiện tại
  getRevenueThisMonth: () => {
    return axios.get(`${API_BASE_URL}/revenue/month`);
  },

  // Lấy tổng doanh thu năm hiện tại
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

  // Lấy số lượng đơn hàng hàng ngày theo loại (ONLINE và OFFLINE)
  getDailyOrderCountByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/daily-by-type`, {
      params: { startDate, endDate },
    });
  },

  // Lấy số lượng đơn hàng hàng tuần theo loại (ONLINE và OFFLINE)
  // Backend now returns:
  // - week: String format "YYYYWW" where week starts on Monday (00:00) and ends on Sunday (23:59)
  // - order_count: total orders for the week
  // - online_orders: count of online orders
  // - offline_orders: count of offline orders
  getWeeklyOrderCountByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/weekly-by-type`, {
      params: { startDate, endDate },
    });
  },

  // Lấy số lượng đơn hàng hàng tháng theo loại (ONLINE và OFFLINE)
  getMonthlyOrderCountByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/monthly-by-type`, {
      params: { startDate, endDate },
    });
  },

  // Tổng doanh thu offline và online hôm nay
  getRevenueTodayByType: () => {
    return axios.get(`${API_BASE_URL}/revenue/today/by-type`);
  },

  // Tổng doanh thu offline và online hôm qua
  getRevenueYesterdayByType: () => {
    return axios.get(`${API_BASE_URL}/revenue/yesterday/by-type`);
  },

  // Tổng doanh thu offline và online tháng này
  getRevenueThisMonthByType: () => {
    return axios.get(`${API_BASE_URL}/revenue/this-month/by-type`);
  },

  // Tổng doanh thu online và offline từng ngày trong khoảng thời gian
  getDailyRevenueByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/daily-by-type`, {
      params: { startDate, endDate },
    });
  },

  // Tổng doanh thu online và offline từng tuần trong khoảng thời gian
  // Returns data for each week with format:
  // - week: String format "YYYYWW" where week starts on Monday (00:00) and ends on Sunday (23:59)
  // - type: "ORDER ONLINE" or "OFFLINE"
  // - revenue: revenue for that type in that week
  getWeeklyRevenueByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/weekly-by-type`, {
      params: { startDate, endDate },
    });
  },

  // Tổng doanh thu từng tháng trong khoảng thời gian
  // Returns data in format:
  // - month: String format "YYYY-MM"
  // - revenue: total revenue for the month
  // - order_count: total order count for the month
  getMonthlyRevenue: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/monthly`, {
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

  // Lấy tổng số lượng sản phẩm còn trong kho
  getTotalStock: () => {
    return axios.get(`${API_BASE_URL}/total-stock`);
  },

  // Lấy thông tin số lượng sản phẩm còn trong kho
  getStockInfo: () => {
    return axios.get(`${API_BASE_URL}/stock-info`);
  },

  // API sử dụng bộ lọc nhanh (preset)
  getPresetStats: (preset) => {
    return axios.get(`${API_BASE_URL}/preset-stats`, {
      params: { preset },
    });
  },

  // Tổng doanh thu online và offline từng tháng trong khoảng thời gian
  getMonthlyRevenueByType: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/monthly-by-type`, {
      params: { startDate, endDate },
    });
  },

  // Các hàm mới liên quan đến doanh thu và số lượng đơn hàng OFFLINE theo phương thức thanh toán CASH và MOMO

  // Lấy tổng doanh thu OFFLINE hôm nay theo phương thức thanh toán CASH và MOMO
  getOfflineRevenueTodayByPaymentMethod: () => {
    return axios.get(`${API_BASE_URL}/revenue/offline/today/by-payment-method`);
  },

  // Lấy tổng doanh thu OFFLINE tháng hiện tại theo phương thức thanh toán CASH và MOMO
  getOfflineRevenueThisMonthByPaymentMethod: () => {
    return axios.get(`${API_BASE_URL}/revenue/offline/this-month/by-payment-method`);
  },

  // Lấy tổng doanh thu OFFLINE trong khoảng thời gian theo phương thức thanh toán CASH và MOMO
  getOfflineRevenueByDateRangeAndPaymentMethod: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/offline/range/by-payment-method`, {
      params: { startDate, endDate },
    });
  },

  // Lấy doanh thu hàng ngày của đơn hàng OFFLINE theo phương thức thanh toán CASH và MOMO
  getDailyOfflineRevenueByPaymentMethod: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/offline/daily/by-payment-method`, {
      params: { startDate, endDate },
    });
  },

  // Lấy doanh thu hàng tuần của đơn hàng OFFLINE theo phương thức thanh toán CASH và MOMO
  // Returns data in format:
  // - week: String format "YYYYWW" where week starts on Monday (00:00) and ends on Sunday (23:59)
  // - cashRevenue: revenue for CASH payments
  // - momoRevenue: revenue for MOMO payments
  getWeeklyOfflineRevenueByPaymentMethod: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/offline/weekly/by-payment-method`, {
      params: { startDate, endDate },
    });
  },

  // Lấy doanh thu hàng tháng của đơn hàng OFFLINE theo phương thức thanh toán CASH và MOMO
  // Returns data in format:
  // - month: String format "YYYY-MM"
  // - cashRevenue: revenue for CASH payments
  // - momoRevenue: revenue for MOMO payments
  getMonthlyOfflineRevenueByPaymentMethod: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/revenue/offline/monthly/by-payment-method`, {
      params: { startDate, endDate },
    });
  },

  // Lấy số lượng đơn hàng OFFLINE hôm nay theo phương thức thanh toán CASH và MOMO
  getOfflineOrderCountTodayByPaymentMethod: () => {
    return axios.get(`${API_BASE_URL}/orders/offline/today/by-payment-method`);
  },

  // Lấy số lượng đơn hàng OFFLINE tháng hiện tại theo phương thức thanh toán CASH và MOMO
  getOfflineOrderCountThisMonthByPaymentMethod: () => {
    return axios.get(`${API_BASE_URL}/orders/offline/this-month/by-payment-method`);
  },

  // Lấy số lượng đơn hàng OFFLINE trong khoảng thời gian theo phương thức thanh toán CASH và MOMO
  getOfflineOrderCountByDateRangeAndPaymentMethod: (startDate, endDate) => {
    return axios.get(`${API_BASE_URL}/orders/offline/range/by-payment-method`, {
      params: { startDate, endDate },
    });
  },
};

export default StatisticsService;