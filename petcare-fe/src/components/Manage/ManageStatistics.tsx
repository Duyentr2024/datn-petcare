import React, { useEffect, useState } from "react";
import StatisticsService from "../../service/manageService/StatisticsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { FaDollarSign, FaChartBar, FaBoxOpen, FaSearch, FaTrophy, FaUsers } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [totalOrdersToday, setTotalOrdersToday] = useState({
    totalOrders: null,
    offlineOrders: null,
    onlineOrders: null,
  });
  const [totalOrdersYesterday, setTotalOrdersYesterday] = useState({
    totalOrders: null,
    offlineOrders: null,
    onlineOrders: null,
  });
  const [totalOrdersThisMonth, setTotalOrdersThisMonth] = useState({
    totalOrders: null,
    offlineOrders: null,
    onlineOrders: null,
  });
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [topFiveCustomers, setTopFiveCustomers] = useState([]);
  const [ordersByRange, setOrdersByRange] = useState({ offlineOrders: null, onlineOrders: null });

  const exportRevenueReport = async () => {
    if (chartData.length === 0) {
      toast.error("Không có dữ liệu để xuất.");
      return;
    }

    const totalRevenueSum = chartData.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
    const totalOrderCount = chartData.reduce((sum, item) => sum + (Number(item.orderCount) || 0), 0);
    const totalOnlineOrders = chartData.reduce(
      (sum, item) => sum + (Number(item.onlineOrders) || 0),
      0
    );
    const totalOfflineOrders = chartData.reduce(
      (sum, item) => sum + (Number(item.offlineOrders) || 0),
      0
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo Doanh thu");

    const titleRow = worksheet.addRow(["BÁO CÁO DOANH THU PETCARE"]);
    titleRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A1:F1");
    const dateRow = worksheet.addRow([`Ngày xuất báo cáo: ${new Date().toLocaleDateString("vi-VN")}`]);
    dateRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A2:F2");
    const periodRow = worksheet.addRow([
      `Thời gian thống kê: ${startDate && endDate
        ? `${new Date(startDate).toLocaleDateString("vi-VN")} - ${new Date(
          endDate
        ).toLocaleDateString("vi-VN")}`
        : "Tháng hiện tại"
      }`,
    ]);
    periodRow.getCell(1).alignment = { horizontal: "center" };
    worksheet.mergeCells("A3:F3");
    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "STT",
      "Thời gian",
      "Doanh thu (VND)",
      "Tổng đơn hàng",
      "Đơn Online",
      "Đơn Offline",
    ]);
    headerRow.font = { bold: true, size: 12, color: { argb: "000000" } };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      cell.alignment = { horizontal: "center" };
    });

    chartData.forEach((item, index) => {
      const row = worksheet.addRow([
        index + 1,
        item.date || item.week || item.month || "N/A",
        item.revenue !== undefined ? Number(item.revenue) : 0,
        item.orderCount || 0,
        item.onlineOrders || 0,
        item.offlineOrders || 0,
      ]);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
        cell.alignment = { horizontal: "center" };
      });
      row.getCell(3).numFmt = "#,##0";
      row.getCell(4).numFmt = "#,##0";
      row.getCell(5).numFmt = "#,##0";
      row.getCell(6).numFmt = "#,##0";
    });

    const totalRow = worksheet.addRow([
      "",
      "Tổng cộng",
      totalRevenueSum,
      totalOrderCount,
      totalOnlineOrders,
      totalOfflineOrders,
    ]);
    totalRow.font = { bold: true, size: 12 };
    totalRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "double", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      cell.alignment = { horizontal: "center" };
      if (colNumber === 3) cell.numFmt = "#,##0";
      if (colNumber >= 4) cell.numFmt = "#,##0";
    });

    worksheet.columns = [
      { width: 6 },
      { width: 22 },
      { width: 20 },
      { width: 14 },
      { width: 14 },
      { width: 14 },
    ];

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const data = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(data, `BaoCaoDoanhThu_PetCare_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      toast.error("Có lỗi xảy ra khi xuất file Excel. Vui lòng kiểm tra console!");
    }
  };

  const fetchDefaultMonthlyRevenue = () => {
    setViewType("daily");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    Promise.all([
      StatisticsService.getDailyRevenueCurrentMonth(),
      StatisticsService.getDailyOrderCountByType(startOfMonth, endOfMonth),
    ])
      .then(([revenueRes, orderCountRes]) => {
        const revenueData = Object.entries(revenueRes.data).map(([date, stats]) => ({
          date: new Date(date).toISOString().slice(0, 10), // Chuẩn hóa thành yyyy-mm-dd
          revenue: Number(stats.revenue),
          orderCount: Number(stats.orderCount),
        }));

        const orderCountData = Object.entries(orderCountRes.data).reduce((acc, [date, stats]) => {
          const normalizedDate = new Date(date).toISOString().slice(0, 10);
          acc[normalizedDate] = {
            onlineOrders: Number(stats.onlineOrders),
            offlineOrders: Number(stats.offlineOrders),
          };
          return acc;
        }, {});

        const combinedData = revenueData.map((item) => ({
          date: new Date(item.date).toLocaleDateString("vi-VN"), // Hiển thị dạng dd/mm/yyyy
          revenue: item.revenue,
          orderCount: item.orderCount,
          onlineOrders: orderCountData[item.date]?.onlineOrders || 0,
          offlineOrders: orderCountData[item.date]?.offlineOrders || 0,
        }));

        setChartData(combinedData);
        const total = combinedData.reduce((sum, item) => sum + item.revenue, 0);
        setTotalRevenue(total);
      })
      .catch((error) => {
        console.error("Error fetching default monthly revenue:", error);
        toast.error("Có lỗi khi lấy dữ liệu tháng hiện tại!");
      });
  };

  useEffect(() => {
    StatisticsService.getRevenueToday().then((res) => setRevenueToday(res.data));
    StatisticsService.getRevenueYesterday().then((res) => setRevenueYesterday(res.data));
    StatisticsService.getBestSellingProducts().then((res) => setBestSellingProducts(res.data.slice(0, 5)));
    StatisticsService.getRevenueThisMonth().then((res) => setMonthlyRevenue(res.data));
    StatisticsService.getTotalStock().then((res) => setTotalStock(res.data));
    StatisticsService.getTotalOrdersToday().then((res) => setTotalOrdersToday(res.data));
    StatisticsService.getTotalOrdersYesterday().then((res) =>
      setTotalOrdersYesterday((prev) => ({ ...prev, totalOrders: res.data }))
    );
    StatisticsService.getYesterdayOrderStats().then((res) =>
      setTotalOrdersYesterday((prev) => ({
        ...prev,
        offlineOrders: res.data.offlineOrdersYesterday,
        onlineOrders: res.data.onlineOrdersYesterday,
      }))
    );
    StatisticsService.getTotalOrdersThisMonth().then((res) => setTotalOrdersThisMonth(res.data));
    StatisticsService.getTotalCustomers().then((res) => setTotalCustomers(res.data));
    StatisticsService.getTopFiveCustomers().then((res) => setTopFiveCustomers(res.data));
    fetchDefaultMonthlyRevenue();
  }, []);

  const fetchRevenueByDate = () => {
    if (!startDate || !endDate) {
      toast.error("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (daysDiff > 365) {
      toast.error("Vui lòng chọn khoảng thời gian không quá 365 ngày.");
      return;
    }

    if (daysDiff <= 30) {
      setViewType("daily");
      Promise.all([
        StatisticsService.getDailyRevenue(startDate, endDate),
        StatisticsService.getDailyOrderCountByType(startDate, endDate),
      ])
        .then(([revenueRes, orderCountRes]) => {
          const revenueData = Object.entries(revenueRes.data).map(([date, stats]) => ({
            date: new Date(date).toISOString().slice(0, 10),
            revenue: Number(stats.revenue || stats),
            orderCount: stats.orderCount ? Number(stats.orderCount) : 0,
          }));

          const orderCountData = Object.entries(orderCountRes.data).reduce((acc, [date, stats]) => {
            const normalizedDate = new Date(date).toISOString().slice(0, 10);
            acc[normalizedDate] = {
              onlineOrders: Number(stats.onlineOrders),
              offlineOrders: Number(stats.offlineOrders),
            };
            return acc;
          }, {});

          const combinedData = revenueData.map((item) => ({
            date: new Date(item.date).toLocaleDateString("vi-VN"),
            revenue: item.revenue,
            orderCount: item.orderCount,
            onlineOrders: orderCountData[item.date]?.onlineOrders || 0,
            offlineOrders: orderCountData[item.date]?.offlineOrders || 0,
          }));

          const filteredData = combinedData.filter((item) => {
            const itemDate = new Date(item.date.split("/").reverse().join("-"));
            return itemDate >= start && itemDate <= end;
          });

          setChartData(filteredData);
          const total = filteredData.reduce((sum, item) => sum + item.revenue, 0);
          setTotalRevenue(total);
        })
        .catch((error) => {
          console.error("Error fetching daily data:", error);
          toast.error("Có lỗi khi lấy dữ liệu hàng ngày!");
        });
      StatisticsService.getOrdersByDateRange(startDate, endDate).then((res) => {
        setOrdersByRange(res.data);
        setTotalOrdersByRange({
          totalOrders: (res.data.offlineOrders || 0) + (res.data.onlineOrders || 0),
          offlineOrders: res.data.offlineOrders || 0,
          onlineOrders: res.data.onlineOrders || 0,
        });
      });
    } else if (daysDiff <= 90) {
      setViewType("weekly");
      Promise.all([
        StatisticsService.getWeeklyRevenue(startDate, endDate),
        StatisticsService.getWeeklyOrderCountByType(startDate, endDate),
      ])
        .then(([revenueRes, orderCountRes]) => {
          const revenueData = revenueRes.data.map((item) => ({
            week: item.week,
            revenue: Number(item.revenue),
          }));

          const orderCountData = orderCountRes.data.reduce((acc, item) => {
            acc[item.week] = {
              orderCount: Number(item.orderCount),
              onlineOrders: Number(item.onlineOrders),
              offlineOrders: Number(item.offlineOrders),
            };
            return acc;
          }, {});

          const combinedData = revenueData.map((item) => ({
            week: item.week,
            revenue: item.revenue,
            orderCount: orderCountData[item.week]?.orderCount || 0,
            onlineOrders: orderCountData[item.week]?.onlineOrders || 0,
            offlineOrders: orderCountData[item.week]?.offlineOrders || 0,
          }));

          setChartData(combinedData);
          const total = combinedData.reduce((sum, item) => sum + item.revenue, 0);
          setTotalRevenue(total);
        })
        .catch((error) => {
          console.error("Error fetching weekly data:", error);
          toast.error("Có lỗi khi lấy dữ liệu hàng tuần!");
        });
      StatisticsService.getOrdersByDateRange(startDate, endDate).then((res) => {
        setOrdersByRange(res.data);
        setTotalOrdersByRange({
          totalOrders: (res.data.offlineOrders || 0) + (res.data.onlineOrders || 0),
          offlineOrders: res.data.offlineOrders || 0,
          onlineOrders: res.data.onlineOrders || 0,
        });
      });
    } else {
      setViewType("monthly");
      Promise.all([
        StatisticsService.getRevenue(startDate, endDate),
        StatisticsService.getMonthlyOrderCountByType(startDate, endDate),
      ])
        .then(([revenueRes, orderCountRes]) => {
          const totalRevenue = Number(revenueRes.data);
          const orderCountData = orderCountRes.data.map((item) => ({
            month: item.month, // Định dạng yyyy-MM (e.g., "2025-02")
            orderCount: Number(item.orderCount),
            onlineOrders: Number(item.onlineOrders),
            offlineOrders: Number(item.offlineOrders),
          }));

          const combinedData = orderCountData.map((item) => {
            const monthDate = new Date(item.month + "-01"); // Chuyển yyyy-MM thành Date
            const monthStr = monthDate.toLocaleDateString("vi-VN", {
              month: "long",
              year: "numeric",
            }); // Hiển thị dạng "Tháng 2 2025"
            return {
              month: monthStr,
              revenue:
                orderCountData.length === 1
                  ? totalRevenue
                  : (totalRevenue * item.orderCount) / orderCountData.reduce((sum, i) => sum + i.orderCount, 0),
              orderCount: item.orderCount,
              onlineOrders: item.onlineOrders,
              offlineOrders: item.offlineOrders,
            };
          });

          setChartData(combinedData);
          setTotalRevenue(totalRevenue);
        })
        .catch((error) => {
          console.error("Error fetching monthly data:", error);
          toast.error("Có lỗi khi lấy dữ liệu hàng tháng! Kiểm tra console để xem chi tiết.");
        });
      // Lấy tổng đơn hàng, đơn offline, và đơn online cho khoảng thời gian monthly
      StatisticsService.getOrdersByDateRange(startDate, endDate).then((res) => {
        setOrdersByRange(res.data);
        setTotalOrdersByRange({
          totalOrders: (res.data.offlineOrders || 0) + (res.data.onlineOrders || 0),
          offlineOrders: res.data.offlineOrders || 0,
          onlineOrders: res.data.onlineOrders || 0,
        });
      });
    }
  };
  const formatCurrency = (value) => {
    return value !== null
      ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : "Đang tải...";
  };

  const formatNumber = (value) => {
    return value !== null ? value.toLocaleString("vi-VN") : "Đang tải...";
  };

  return (
    <div className="p-3 bg-gray-100 rounded-lg shadow-lg max-w-6xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h2 className="text-2xl font-bold text-center mb-2 text-blue-600">📊 Thống kê Doanh thu</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        {[
          {
            title: "Thống kê hôm nay",
            revenue: revenueToday,
            orders: totalOrdersToday,
            icon: <FaDollarSign />,
            color: "text-green-600",
          },
          {
            title: "Thống kê hôm qua",
            revenue: revenueYesterday,
            orders: totalOrdersYesterday,
            icon: <FaChartBar />,
            color: "text-orange-600",
          },
          {
            title: "Thống kê tháng này",
            revenue: monthlyRevenue,
            orders: totalOrdersThisMonth,
            icon: <FaBoxOpen />,
            color: "text-blue-600",
          },
          {
            title: "Số lượng sản phẩm",
            value: totalStock,
            icon: <FaBoxOpen />,
            color: "text-purple-600",
          },
          {
            title: "Tổng số khách hàng",
            value: totalCustomers,
            icon: <FaUsers />,
            color: "text-teal-600",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="border p-2 rounded-lg bg-white shadow hover:shadow-md transition flex items-center"
          >
            <div className={`text-xl mr-1 ${item.color}`}>{item.icon}</div>
            <div>
              <h3 className="text-xs font-semibold text-gray-700 truncate">{item.title}</h3>
              {item.revenue !== undefined ? (
                <>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    Doanh thu: {formatCurrency(item.revenue)}
                  </p>
                  {item.orders !== undefined && (
                    typeof item.orders === "object" && item.orders ? (
                      <>
                        <p className="text-xs text-gray-900 truncate">
                          Tổng đơn: {formatNumber(item.orders.totalOrders)}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          Offline: {formatNumber(item.orders.offlineOrders)}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          Online: {formatNumber(item.orders.onlineOrders)}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-900 truncate">
                        Đơn hàng: {formatNumber(item.orders)}
                      </p>
                    )
                  )}
                </>
              ) : (
                <p className="text-sm font-bold text-gray-900 truncate">
                  {formatNumber(item.value)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3 bg-white p-4 rounded-md shadow">
        <h3 className="text-md font-semibold flex items-center mb-3 text-gray-800">
          <FaSearch className="mr-2 text-blue-600" /> Tìm kiếm doanh thu theo ngày
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-1.5 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-1.5 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={fetchRevenueByDate}
            className="bg-blue-600 text-white px-3 py-1.5 rounded shadow hover:bg-blue-700 transition flex items-center justify-center text-sm"
          >
            <FaSearch className="mr-1" /> Tìm
          </button>
        </div>
        {totalRevenue !== null && (
          <div className="mt-3">
            <h3 className="text-md font-semibold text-green-700">
              Tổng doanh thu: {formatCurrency(totalRevenue)}
            </h3>
          </div>
        )}
        {ordersByRange.offlineOrders !== null && ordersByRange.onlineOrders !== null && (
          <div className="mt-2">
            <p className="text-sm text-gray-700">
              Đơn Offline: <span className="font-bold">{formatNumber(ordersByRange.offlineOrders)}</span>
            </p>
            <p className="text-sm text-gray-700">
              Đơn Online: <span className="font-bold">{formatNumber(ordersByRange.onlineOrders)}</span>
            </p>
          </div>
        )}
        <button
          onClick={exportRevenueReport}
          className="bg-green-600 text-white px-3 py-1.5 rounded shadow hover:bg-green-700 transition mt-4 flex items-center text-sm"
        >
          📥 Xuất Excel
        </button>
      </div>

      {chartData.length > 0 && (
        <div className="mb-4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-md font-semibold mb-2">📈 Biểu đồ doanh thu và đơn hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viewType === "daily" ? "date" : viewType === "weekly" ? "week" : "month"} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#3B82F6"
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  else if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#82ca9d"
                allowDecimals={false}
                tickFormatter={(value) => value}
              />
              <Tooltip
                formatter={(value, name) =>
                  name === "revenue" ? formatCurrency(value) : value.toLocaleString("vi-VN")
                }
              />
              <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Doanh thu" />
              <Bar yAxisId="right" dataKey="orderCount" fill="#82ca9d" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow mb-4">
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
              <h4 className="text-sm font-semibold text-gray-800 truncate">{product.productName}</h4>
              <p className="text-xs text-gray-600">
                Số lượng bán: <span className="font-bold">{product.totalSold}</span>
              </p>
              <p className="text-xs text-green-600 font-bold">{formatCurrency(product.price)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" /> Top 5 Khách hàng thân thiết
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topFiveCustomers.length > 0 ? (
            topFiveCustomers.map((customer, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 bg-gray-50 shadow hover:shadow-lg transition"
              >
                <h6 className="text-sm font-semibold text-gray-800 truncate">{customer.fullName}</h6>
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p className="flex items-center gap-2">
                    📞 <span className="text-gray-600">{customer.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    🛒 <span className="font-bold text-blue-600">{customer.orderCount}</span> đơn hàng
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Đang tải...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageStatistics;