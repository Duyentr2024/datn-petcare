import React, { useEffect, useState, useRef } from "react";
import StatisticsService from "../../service/manageService/StatisticsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { FaDollarSign, FaChartBar, FaBoxOpen, FaSearch, FaTrophy } from "react-icons/fa";

const ManageStatistics = () => {
  const [revenueToday, setRevenueToday] = useState(null);
  const [revenueYesterday, setRevenueYesterday] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [totalStock, setTotalStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewType, setViewType] = useState("daily");
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [totalOrdersToday, setTotalOrdersToday] = useState(null);
  const [totalOrdersThisMonth, setTotalOrdersThisMonth] = useState(null);
  const chartContainerRef = useRef(null);

  const fetchDefaultMonthlyRevenue = () => {
    setViewType("daily");
    StatisticsService.getDailyRevenueCurrentMonth().then((res) => {
      const data = Object.entries(res.data).map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("vi-VN"),
        revenue: Number(revenue),
      }));
      setChartData(data);
      const total = data.reduce((sum, item) => sum + item.revenue, 0);
      setTotalRevenue(total);
    });
  };

  useEffect(() => {
    StatisticsService.getRevenueToday().then((res) => setRevenueToday(res.data));
    StatisticsService.getRevenueYesterday().then((res) => setRevenueYesterday(res.data));
    StatisticsService.getBestSellingProducts().then((res) => setBestSellingProducts(res.data.slice(0, 5)));
    StatisticsService.getRevenueThisMonth().then((res) => setMonthlyRevenue(res.data));
    StatisticsService.getTotalStock().then((res) => setTotalStock(res.data));
    StatisticsService.getTotalOrdersToday().then((res) => setTotalOrdersToday(res.data));
    StatisticsService.getTotalOrdersThisMonth().then((res) => setTotalOrdersThisMonth(res.data));
    fetchDefaultMonthlyRevenue();
  }, []);

  useEffect(() => {
    const updateChartWidth = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
      }
    };

    updateChartWidth();
    window.addEventListener("resize", updateChartWidth);

    return () => window.removeEventListener("resize", updateChartWidth);
  }, []);

  const fetchRevenueByDate = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (daysDiff > 365) {
      alert("Vui lòng chọn khoảng thời gian không quá 365 ngày.");
      return;
    }

    if (daysDiff <= 30) {
      setViewType("daily");
      StatisticsService.getDailyRevenue(startDate, endDate).then((res) => {
        const data = Object.entries(res.data).map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString("vi-VN"),
          revenue,
        }));
        setChartData(data);
        const total = data.reduce((sum, item) => sum + item.revenue, 0);
        setTotalRevenue(total);
      });
    } else if (daysDiff <= 90) {
      setViewType("weekly");
      StatisticsService.getWeeklyRevenue(startDate, endDate).then((res) => {
        const data = Object.entries(res.data).map(([week, revenue]) => ({
          week,
          revenue,
        }));
        setChartData(data);
        const total = data.reduce((sum, item) => sum + item.revenue, 0);
        setTotalRevenue(total);
      });
    } else {
      setViewType("monthly");
      StatisticsService.getRevenue(startDate, endDate).then((res) => {
        const data = Object.entries(res.data).map(([month, revenue]) => ({
          month,
          revenue,
        }));
        setChartData(data);
        const total = data.reduce((sum, item) => sum + item.revenue, 0);
        setTotalRevenue(total);
      });
    }
  };

  const formatCurrency = (value) => {
    return value
      ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : "Đang tải...";
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
        📊 Thống kê Doanh thu
      </h2>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          {
            title: "Doanh thu hôm nay",
            value: revenueToday,
            icon: <FaDollarSign />,
            color: "text-green-600",
          },
          {
            title: "Đơn hàng hôm nay",
            value: totalOrdersToday,
            icon: <FaChartBar />,
            color: "text-teal-600",
          },
          {
            title: "Doanh thu hôm qua",
            value: revenueYesterday,
            icon: <FaChartBar />,
            color: "text-orange-600",
          },
          {
            title: "Doanh thu tháng này",
            value: monthlyRevenue,
            icon: <FaBoxOpen />,
            color: "text-blue-600",
          },
          {
            title: "Đơn hàng tháng này",
            value: totalOrdersThisMonth,
            icon: <FaChartBar />,
            color: "text-indigo-600",
          },
          {
            title: "Số lượng sản phẩm",
            value: totalStock,
            icon: <FaBoxOpen />,
            color: "text-purple-600",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="border p-3 rounded-lg bg-white shadow hover:shadow-md transition flex items-center"
          >
            <div className={`text-2xl mr-2 ${item.color}`}>{item.icon}</div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">{item.title}</h3>
              <p className="text-lg font-bold text-gray-900">
                {item.title.includes("Doanh thu")
                  ? formatCurrency(item.value)
                  : item.value !== null
                  ? item.value.toLocaleString("vi-VN")
                  : "Đang tải..."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tìm kiếm doanh thu */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow">
        <h3 className="text-md font-semibold flex items-center mb-2">
          <FaSearch className="mr-2 text-gray-600" /> Tìm kiếm doanh thu theo ngày
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-1 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-1 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchRevenueByDate}
            className="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700 transition flex items-center justify-center"
          >
            <FaSearch className="mr-1" /> Tìm kiếm
          </button>
        </div>
        {totalRevenue !== null && (
          <div className="mt-2">
            <h3 className="text-md font-semibold text-gray-800">
              Tổng doanh thu: {formatCurrency(totalRevenue)}
            </h3>
          </div>
        )}
      </div>

      {/* Biểu đồ doanh thu */}
      {chartData.length > 0 && (
        <div className="mb-4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-2">📈 Biểu đồ doanh thu</h3>
          <div className="overflow-x-auto" ref={chartContainerRef}>
            <BarChart width={chartWidth} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={viewType === "daily" ? "date" : viewType === "weekly" ? "week" : "month"}
              />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="rgb(59, 130, 246)" />
            </BarChart>
          </div>
        </div>
      )}

      {/* Sản phẩm bán chạy */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" /> 5 Sản phẩm bán chạy nhất
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {bestSellingProducts.map((product, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 bg-gray-50 shadow hover:shadow-lg transition"
            >
              <img
                src={product.image}
                alt={product.productName}
                className="h-24 w-full object-cover rounded-md mb-2"
              />
              <h4 className="text-sm font-semibold text-gray-800 truncate">
                {product.productName}
              </h4>
              <p className="text-xs text-gray-600">
                Số lượng bán: <span className="font-bold">{product.totalSold}</span>
              </p>
              <p className="text-xs text-green-600 font-bold">
                {formatCurrency(product.price)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageStatistics;