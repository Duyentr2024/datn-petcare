import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

// Hàm lấy doanh thu hàng ngày của đơn hàng SPA
export const getDailySpaRevenue = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/statistics/spa/daily-revenue`, {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily SPA revenue:', error.response?.data || error.message);
    throw error;
  }
};

const ManageStatisticsSpa = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenues, setRevenues] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllDatesInRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const data = await getDailySpaRevenue(start, end);
      console.log('API response:', data);

      if (!Array.isArray(data)) {
        setError('Dữ liệu trả về từ server không đúng định dạng.');
        setRevenues([]);
        setTotalRevenue(0);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setError('Không có dữ liệu doanh thu trong khoảng thời gian này.');
        setRevenues([]);
        setTotalRevenue(0);
        setLoading(false);
        return;
      }

      const allDates = getAllDatesInRange(start, end);
      const revenueMap = new Map(
        data.map((item) => {
          if (!Array.isArray(item) || item.length !== 2) {
            console.error('Invalid data item:', item);
            return [item[0] || '', 0]; // Dự phòng nếu item không đúng định dạng
          }
          return [item[0], Number(item[1])]; // Chuyển revenue thành số
        })
      );
      const formattedRevenues = allDates.map((date) => ({
        date,
        revenue: revenueMap.get(date) || 0,
      }));

      const total = formattedRevenues.reduce((sum, item) => sum + item.revenue, 0);
      console.log('Formatted revenues:', formattedRevenues);
      console.log('Total revenue:', total);

      setRevenues(formattedRevenues);
      setTotalRevenue(total);
    } catch (err) {
      console.error('Error in handleSearch:', err.response?.data || err.message);
      setError(`Không thể tải dữ liệu doanh thu: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Thống Kê Doanh Thu SPA</h1>

      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full sm:w-auto"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full sm:w-auto"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {revenues.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Ngày</th>
                <th className="px-4 py-2 border">Doanh Thu (VND)</th>
              </tr>
            </thead>
            <tbody>
              {revenues.map((item, index) => (
                <tr key={index} className="text-center">
                  <td className="px-4 py-2 border">{item.date}</td>
                  <td className="px-4 py-2 border">{item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-lg font-semibold">
            Tổng doanh thu: {totalRevenue.toLocaleString()} VND
          </div>
        </div>
      )}

      {revenues.length === 0 && !loading && !error && (
        <p className="text-gray-500">Chưa có dữ liệu. Vui lòng tìm kiếm.</p>
      )}
    </div>
  );
};

export default ManageStatisticsSpa;