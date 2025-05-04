import axios from 'axios';
import API_BASE_URL from '../../config';

// Hàm lấy doanh thu hàng ngày của đơn hàng SPA
export const getDailySpaRevenue = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/statistics/spa/daily-revenue`, {
      params: {
        startDate: startDate.toISOString().split('T')[0], // Chuyển thành YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],     // Chuyển thành YYYY-MM-DD
      },
    });
    return response.data; // Trả về danh sách [[date, revenue], ...]
  } catch (error) {
    console.error('Error fetching daily SPA revenue:', error.response?.data || error.message);
    throw error;
  }
};