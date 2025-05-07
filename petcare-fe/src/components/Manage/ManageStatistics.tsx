import React, { useEffect, useState } from "react";
import StatisticsService from "../../service/manageService/StatisticsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { FaDollarSign, FaChartBar, FaBoxOpen, FaSearch, FaUsers, FaHospital, FaPalette } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiUser,
  FiPhone,
  FiShoppingCart
} from "react-icons/fi";

// Hàm định dạng tiền tệ
const formatCurrency = (value) => {
  return value !== null && value !== undefined
    ? value.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : "Đang tải...";
};

// Component Tooltip tùy chỉnh
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const offlineData = payload.find((p) => p.name === "Offline");
    return (
      <div className="bg-white border border-gray-200 rounded-md p-2 shadow-md" style={{ fontSize: "11px" }}>
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <div key={index}>
            {entry.name === "Offline" ? (
              <div>
                <p style={{ color: entry.fill }}>
                  {`${entry.name}: ${formatCurrency(entry.value)}`}
                  {offlineData && (
                    <span className="ml-2">
                      (Tiền mặt: {formatCurrency(offlineData.payload.cashRevenue)} - MOMO: {formatCurrency(offlineData.payload.momoRevenue)})
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p style={{ color: entry.fill }}>
                {`${entry.name}: ${
                  entry.name.includes("đơn") || entry.name.includes("Tổng đơn")
                    ? entry.value.toLocaleString("vi-VN")
                    : formatCurrency(entry.value)
                }`}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ManageStatistics = () => {
  // Tab Management
  const [activeTab, setActiveTab] = useState("revenue");
  const [revenueToday, setRevenueToday] = useState(null);
  const [revenueTodayOnline, setRevenueTodayOnline] = useState(null);
  const [revenueTodayOffline, setRevenueTodayOffline] = useState(null);
  const [revenueYesterday, setRevenueYesterday] = useState(null);
  const [revenueYesterdayOnline, setRevenueYesterdayOnline] = useState(null);
  const [revenueYesterdayOffline, setRevenueYesterdayOffline] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [monthlyRevenueOnline, setMonthlyRevenueOnline] = useState(null);
  const [monthlyRevenueOffline, setMonthlyRevenueOffline] = useState(null);
  const [totalStock, setTotalStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [topFavoriteProducts, setTopFavoriteProducts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewType, setViewType] = useState("daily");
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [totalOnlineRevenue, setTotalOnlineRevenue] = useState(0);
  const [totalOfflineRevenue, setTotalOfflineRevenue] = useState(0);
  const [offlineRevenueByPaymentMethod, setOfflineRevenueByPaymentMethod] = useState([]);
  const [viewTypePaymentMethod, setViewTypePaymentMethod] = useState("daily");
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

  // Hàm định dạng ngày từ BE sang dd/mm/yyyy
  const formatDateFromBE = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Hàm định dạng tuần (YEARWEEK) thành chuỗi dễ đọc
  const formatWeek = (yearWeek) => {
    const year = yearWeek.toString().slice(0, 4);
    const week = parseInt(yearWeek.toString().slice(4), 10);
    return `Tuần ${week}/${year}`;
  };

  // Hàm định dạng tháng (yyyy-MM) thành chuỗi dễ đọc
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    return `Tháng ${parseInt(month, 10)}/${year}`;
  };

  const exportRevenueReport = async () => {
    if (chartData.length === 0) {
      toast.error("Không có dữ liệu để xuất.");
      return;
    }

    const totalRevenueSum = chartData.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
    const totalOrderCount = chartData.reduce((sum, item) => sum + (Number(item.orderCount) || 0), 0);
    const totalOnlineOrders = ordersByRange.onlineOrders || 0;
    const totalOfflineOrders = ordersByRange.offlineOrders || 0;
    const totalOnlineRevenueSum = chartData.reduce((sum, item) => sum + (Number(item.onlineRevenue) || 0), 0);
    const totalOfflineRevenueSum = chartData.reduce((sum, item) => sum + (Number(item.offlineRevenue) || 0), 0);

    console.log("Excel - Tổng doanh thu:", totalRevenueSum);
    console.log("Excel - Doanh thu Online:", totalOnlineRevenueSum);
    console.log("Excel - Doanh thu Offline:", totalOfflineRevenueSum);
    console.log("Excel - Tổng đơn Online:", totalOnlineOrders);
    console.log("Excel - Tổng đơn Offline:", totalOfflineOrders);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo Doanh thu");

    // Tiêu đề chính
    const titleRow = worksheet.addRow(["BÁO CÁO DOANH THU PETCARE"]);
    titleRow.font = { name: 'Calibri', bold: true, size: 14, color: { argb: "FFFFFF" } };
    titleRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    titleRow.height = 35;
    worksheet.mergeCells("A1:J1");
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getRow(1).getCell(col);
      cell.fill = {
        type: "gradient",
        gradient: "angle",
        degree: 45,
        stops: [
          { position: 0, color: { argb: "BFDBFE" } },
          { position: 1, color: { argb: "93C5FD" } },
        ],
      };
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    }

    // Ngày xuất báo cáo
    const dateRow = worksheet.addRow([`Ngày xuất báo cáo: ${new Date().toLocaleDateString("vi-VN")}`]);
    dateRow.font = { name: 'Calibri', bold: true, size: 11, color: { argb: "FFFFFF" } };
    dateRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    dateRow.height = 25;
    worksheet.mergeCells("A2:J2");
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getRow(2).getCell(col);
      cell.fill = {
        type: "gradient",
        gradient: "angle",
        degree: 45,
        stops: [
          { position: 0, color: { argb: "9CA3AF" } },
          { position: 1, color: { argb: "D1D5DB" } },
        ],
      };
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    }

    // Thời gian thống kê
    const periodRow = worksheet.addRow([
      `Thời gian: ${startDate && endDate
        ? `${new Date(startDate).toLocaleDateString("vi-VN")} - ${new Date(endDate).toLocaleDateString("vi-VN")}`
        : "Tháng hiện tại"
      }`,
    ]);
    periodRow.font = { name: 'Calibri', bold: true, size: 11, color: { argb: "FFFFFF" } };
    periodRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    periodRow.height = 25;
    worksheet.mergeCells("A3:J3");
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getRow(3).getCell(col);
      cell.fill = {
        type: "gradient",
        gradient: "angle",
        degree: 45,
        stops: [
          { position: 0, color: { argb: "9CA3AF" } },
          { position: 1, color: { argb: "D1D5DB" } },
        ],
      };
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    }

    worksheet.addRow([]);

    // Header
    const headerRow = worksheet.addRow([
      "STT",
      viewType === "daily" ? "Ngày" : viewType === "weekly" ? "Tuần" : "Tháng",
      "Doanh thu (VND)",
      "Doanh thu Online (VND)",
      "Doanh thu Offline (VND)",
      "Tổng đơn hàng",
      "Đơn Online",
      "Đơn Offline",
      "Tỷ lệ Online (%)",
      "Tỷ lệ Offline (%)",
    ]);
    headerRow.font = { name: 'Calibri', bold: true, size: 11, color: { argb: "FFFFFF" } };
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "3B82F6" } };
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    });

    // Dữ liệu
    chartData.forEach((item, index) => {
      const onlinePercentage = item.revenue ? ((item.onlineRevenue / item.revenue) * 100).toFixed(2) : 0;
      const offlinePercentage = item.revenue ? ((item.offlineRevenue / item.revenue) * 100).toFixed(2) : 0;
      const row = worksheet.addRow([
        index + 1,
        item.date || item.week || item.month || "N/A",
        item.revenue !== undefined ? Number(item.revenue) : 0,
        item.onlineRevenue || 0,
        item.offlineRevenue || 0,
        item.orderCount || 0,
        item.onlineOrders || 0,
        item.offlineOrders || 0,
        onlinePercentage,
        offlinePercentage,
      ]);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "000000" } },
          left: { style: "thin", color: { argb: "000000" } },
          bottom: { style: "thin", color: { argb: "000000" } },
          right: { style: "thin", color: { argb: "000000" } },
        };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      });
      row.getCell(3).numFmt = "#,##0 ₫";
      row.getCell(4).numFmt = "#,##0 ₫";
      row.getCell(5).numFmt = "#,##0 ₫";
      row.getCell(6).numFmt = "#,##0";
      row.getCell(7).numFmt = "#,##0";
      row.getCell(8).numFmt = "#,##0";
      row.getCell(9).numFmt = "0.00";
      row.getCell(10).numFmt = "0.00";
    });

    // Tổng cộng
    const totalRow = worksheet.addRow([
      "",
      "Tổng cộng",
      totalRevenueSum,
      totalOnlineRevenueSum,
      totalOfflineRevenueSum,
      totalOrderCount,
      totalOnlineOrders,
      totalOfflineOrders,
      totalRevenueSum ? ((totalOnlineRevenueSum / totalRevenueSum) * 100).toFixed(2) : 0,
      totalRevenueSum ? ((totalOfflineRevenueSum / totalRevenueSum) * 100).toFixed(2) : 0,
    ]);
    totalRow.font = { name: 'Calibri', bold: true, size: 11 };
    totalRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    for (let col = 1; col <= 10; col++) {
      const cell = totalRow.getCell(col);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E5E7EB" } };
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "double", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
      if (col >= 3 && col <= 5) cell.numFmt = "#,##0 ₫";
      if (col >= 6 && col <= 8) cell.numFmt = "#,##0";
      if (col >= 9 && col <= 10) cell.numFmt = "0.00";
    }

    // Điều chỉnh độ rộng cột
    worksheet.columns = [
      { width: 6 },
      { width: 16 },
      { width: 16 },
      { width: 16 },
      { width: 16 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
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
      toast.error("Có lỗi xảy ra khi xuất file Excel!");
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
      StatisticsService.getOrdersByDateRange(startOfMonth, endOfMonth),
      StatisticsService.getDailyRevenueByType(startOfMonth, endOfMonth),
      StatisticsService.getDailyOfflineRevenueByPaymentMethod(startOfMonth, endOfMonth),
    ])
      .then(([revenueRes, orderCountRes, ordersByRangeRes, revenueByTypeRes, offlineRevenueByPaymentRes]) => {
        console.log("Default Monthly - Revenue data:", revenueRes.data);
        console.log("Default Monthly - Order count data:", orderCountRes.data);
        console.log("Default Monthly - Orders by range:", ordersByRangeRes.data);
        console.log("Default Monthly - Revenue by type:", revenueByTypeRes.data);
        console.log("Default Monthly - Offline Revenue by Payment Method:", offlineRevenueByPaymentRes.data);

        setOrdersByRange({
          onlineOrders: Number(ordersByRangeRes.data?.onlineOrders || 0),
          offlineOrders: Number(ordersByRangeRes.data?.offlineOrders || 0),
        });

        const dateList = [];
        let currentDate = new Date(startOfMonth);
        const end = new Date(endOfMonth);
        while (currentDate <= end) {
          dateList.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const revenueData = Object.entries(revenueRes.data || {}).map(([date, stats]) => ({
          date: formatDateFromBE(date),
          revenue: Number(stats.revenue || 0),
          orderCount: Number(stats.orderCount || 0),
        }));

        const orderCountData = Object.entries(orderCountRes.data || {}).reduce((acc, [date, stats]) => {
          const normalizedDate = formatDateFromBE(date);
          acc[normalizedDate] = {
            onlineOrders: Number(stats.onlineOrders || 0),
            offlineOrders: Number(stats.offlineOrders || 0),
          };
          return acc;
        }, {});

        const revenueByTypeData = Object.entries(revenueByTypeRes.data || {}).reduce((acc, [date, stats]) => {
          const normalizedDate = formatDateFromBE(date);
          acc[normalizedDate] = {
            onlineRevenue: Number(stats.onlineRevenue || 0),
            offlineRevenue: Number(stats.offlineRevenue || 0),
          };
          return acc;
        }, {});

        const offlineRevenueByPaymentData = Object.entries(offlineRevenueByPaymentRes.data || {}).map(([date, stats]) => ({
          date: formatDateFromBE(date),
          cashRevenue: Number(stats.cashRevenue || 0),
          momoRevenue: Number(stats.momoRevenue || 0),
        }));

        const combinedData = dateList.map((date) => {
          const formattedDate = formatDateFromBE(date.toISOString());
          const revenueItem = revenueData.find((item) => item.date === formattedDate) || {
            revenue: 0,
            orderCount: 0,
          };
          const orderItem = orderCountData[formattedDate] || {
            onlineOrders: 0,
            offlineOrders: 0,
          };
          const revenueByType = revenueByTypeData[formattedDate] || {
            onlineRevenue: 0,
            offlineRevenue: 0,
          };
          const offlinePayment = offlineRevenueByPaymentData.find((item) => item.date === formattedDate) || {
            cashRevenue: 0,
            momoRevenue: 0,
          };

          return {
            date: formattedDate,
            revenue: revenueItem.revenue,
            orderCount: revenueItem.orderCount,
            onlineOrders: orderItem.onlineOrders,
            offlineOrders: orderItem.offlineOrders,
            onlineRevenue: revenueByType.onlineRevenue,
            offlineRevenue: revenueByType.offlineRevenue,
            cashRevenue: offlinePayment.cashRevenue,
            momoRevenue: offlinePayment.momoRevenue,
          };
        });

        setChartData(combinedData);
        const total = combinedData.reduce((sum, item) => sum + item.revenue, 0);
        const totalOnlineRevenueSum = combinedData.reduce((sum, item) => sum + item.onlineRevenue, 0);
        const totalOfflineRevenueSum = combinedData.reduce((sum, item) => sum + item.offlineRevenue, 0);

        setTotalRevenue(total);
        setTotalOnlineRevenue(totalOnlineRevenueSum);
        setTotalOfflineRevenue(totalOfflineRevenueSum);

        console.log("Default Monthly - Tổng doanh thu:", total);
        console.log("Default Monthly - Doanh thu Online:", totalOnlineRevenueSum);
        console.log("Default Monthly - Doanh thu Offline:", totalOfflineRevenueSum);
        console.log("Default Monthly - Tổng đơn Online:", ordersByRangeRes.data?.onlineOrders);
        console.log("Default Monthly - Tổng đơn Offline:", ordersByRangeRes.data?.offlineOrders);
      })
      .catch((error) => {
        console.error("Error fetching default monthly revenue:", error);
        toast.error("Có lỗi khi lấy dữ liệu tháng hiện tại!");
        setChartData([]);
      });
  };

  useEffect(() => {
    Promise.all([
      StatisticsService.getRevenueToday(),
      StatisticsService.getRevenueTodayByType(),
      StatisticsService.getTotalOrdersToday(),
      StatisticsService.getRevenueYesterday(),
      StatisticsService.getRevenueYesterdayByType(),
      StatisticsService.getTotalOrdersYesterday(),
      StatisticsService.getYesterdayOrderStats(),
      StatisticsService.getRevenueThisMonth(),
      StatisticsService.getRevenueThisMonthByType(),
      StatisticsService.getTotalOrdersThisMonth(),
      StatisticsService.getTotalStock(),
      StatisticsService.getTotalCustomers(),
      StatisticsService.getTopFiveCustomers(),
      StatisticsService.getBestSellingProducts(),
      StatisticsService.getTopFavoriteProducts(),
    ])
      .then(
        ([
          revenueTodayRes,
          revenueTodayByTypeRes,
          ordersTodayRes,
          revenueYesterdayRes,
          revenueYesterdayByTypeRes,
          totalOrdersYesterdayRes,
          statsYesterdayRes,
          revenueThisMonthRes,
          revenueThisMonthByTypeRes,
          ordersThisMonthRes,
          totalStockRes,
          totalCustomersRes,
          topFiveCustomersRes,
          bestSellingProductsRes,
          topFavoriteProductsRes,
        ]) => {
          const totalRevenueToday = revenueTodayRes.data;
          setRevenueToday(totalRevenueToday);
          setRevenueTodayOnline(revenueTodayByTypeRes.data?.onlineRevenue || 0);
          setRevenueTodayOffline(revenueTodayByTypeRes.data?.offlineRevenue || 0);
          setTotalOrdersToday({
            totalOrders: ordersTodayRes.data?.totalOrders || 0,
            offlineOrders: ordersTodayRes.data?.offlineOrders || 0,
            onlineOrders: ordersTodayRes.data?.onlineOrders || 0,
          });

          const totalRevenueYesterday = revenueYesterdayRes.data;
          setRevenueYesterday(totalRevenueYesterday);
          setRevenueYesterdayOnline(revenueYesterdayByTypeRes.data?.onlineRevenue || 0);
          setRevenueYesterdayOffline(revenueYesterdayByTypeRes.data?.offlineRevenue || 0);
          setTotalOrdersYesterday({
            totalOrders: totalOrdersYesterdayRes.data || 0,
            offlineOrders: statsYesterdayRes.data?.offlineOrdersYesterday || 0,
            onlineOrders: statsYesterdayRes.data?.onlineOrdersYesterday || 0,
          });

          const totalRevenueThisMonth = revenueThisMonthRes.data;
          setMonthlyRevenue(totalRevenueThisMonth);
          setMonthlyRevenueOnline(revenueThisMonthByTypeRes.data?.onlineRevenue || 0);
          setMonthlyRevenueOffline(revenueThisMonthByTypeRes.data?.offlineRevenue || 0);
          setTotalOrdersThisMonth({
            totalOrders: ordersThisMonthRes.data?.totalOrders || 0,
            offlineOrders: ordersThisMonthRes.data?.offlineOrders || 0,
            onlineOrders: ordersThisMonthRes.data?.onlineOrders || 0,
          });

          setTotalStock(totalStockRes.data || 0);
          setTotalCustomers(totalCustomersRes.data || 0);
          setTopFiveCustomers(topFiveCustomersRes.data || []);
          setBestSellingProducts(bestSellingProductsRes.data?.slice(0, 5) || []);
          setTopFavoriteProducts(topFavoriteProductsRes.data?.slice(0, 5) || []);

          console.log("Today - Total:", totalRevenueToday, "Online:", revenueTodayByTypeRes.data?.onlineRevenue, "Offline:", revenueTodayByTypeRes.data?.offlineRevenue);
          console.log("Yesterday - Total:", totalRevenueYesterday, "Online:", revenueYesterdayByTypeRes.data?.onlineRevenue, "Offline:", revenueYesterdayByTypeRes.data?.offlineRevenue);
          console.log("This Month - Total:", totalRevenueThisMonth, "Online:", revenueThisMonthByTypeRes.data?.onlineRevenue, "Offline:", revenueThisMonthByTypeRes.data?.offlineRevenue);
          console.log("Top Favorite Products:", topFavoriteProductsRes.data);
        }
      )
      .catch((error) => {
        console.error("Error fetching initial data:", error);
        toast.error("Có lỗi khi lấy dữ liệu ban đầu!");
      });

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

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > 365) {
      toast.error("Vui lòng chọn khoảng thời gian không quá 365 ngày.");
      return;
    }

    if (daysDiff <= 30) {
      setViewType("daily");
      Promise.all([
        StatisticsService.getDailyRevenue(startDate, endDate),
        StatisticsService.getDailyOrderCountByType(startDate, endDate),
        StatisticsService.getOrdersByDateRange(startDate, endDate),
        StatisticsService.getDailyRevenueByType(startDate, endDate),
        StatisticsService.getDailyOfflineRevenueByPaymentMethod(startDate, endDate),
      ])
        .then(([revenueRes, orderCountRes, ordersByRangeRes, revenueByTypeRes, offlineRevenueByPaymentRes]) => {
          console.log("Search Daily - Raw revenue data:", revenueRes.data);
          console.log("Search Daily - Raw order count data:", orderCountRes.data);
          console.log("Search Daily - Raw orders by range:", ordersByRangeRes.data);
          console.log("Search Daily - Raw revenue by type:", revenueByTypeRes.data);
          console.log("Search Daily - Raw offline revenue by payment:", offlineRevenueByPaymentRes.data);

          const dateList = [];
          let currentDate = new Date(start);
          while (currentDate <= end) {
            dateList.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          const revenueData = Object.entries(revenueRes.data || {}).map(([date, stats]) => ({
            date: formatDateFromBE(date),
            revenue: Number(stats.revenue || 0),
            orderCount: Number(stats.orderCount || 0),
          }));

          const orderCountData = Object.entries(orderCountRes.data || {}).reduce((acc, [date, stats]) => {
            const normalizedDate = formatDateFromBE(date);
            acc[normalizedDate] = {
              onlineOrders: Number(stats.onlineOrders || 0),
              offlineOrders: Number(stats.offlineOrders || 0),
            };
            return acc;
          }, {});

          const revenueByTypeData = Object.entries(revenueByTypeRes.data || {}).reduce((acc, [date, stats]) => {
            const normalizedDate = formatDateFromBE(date);
            acc[normalizedDate] = {
              onlineRevenue: Number(stats.onlineRevenue || 0),
              offlineRevenue: Number(stats.offlineRevenue || 0),
            };
            return acc;
          }, {});

          const offlineRevenueByPaymentData = Object.entries(offlineRevenueByPaymentRes.data || {}).map(([date, stats]) => ({
            date: formatDateFromBE(date),
            cashRevenue: Number(stats.cashRevenue || 0),
            momoRevenue: Number(stats.momoRevenue || 0),
          }));

          const combinedData = dateList.map((date) => {
            const formattedDate = formatDateFromBE(date.toISOString());
            const revenueItem = revenueData.find((item) => item.date === formattedDate) || {
              revenue: 0,
              orderCount: 0,
            };
            const orderItem = orderCountData[formattedDate] || {
              onlineOrders: 0,
              offlineOrders: 0,
            };
            const revenueByType = revenueByTypeData[formattedDate] || {
              onlineRevenue: 0,
              offlineRevenue: 0,
            };
            const offlinePayment = offlineRevenueByPaymentData.find((item) => item.date === formattedDate) || {
              cashRevenue: 0,
              momoRevenue: 0,
            };

            return {
              date: formattedDate,
              revenue: revenueItem.revenue,
              orderCount: revenueItem.orderCount,
              onlineOrders: orderItem.onlineOrders,
              offlineOrders: orderItem.offlineOrders,
              onlineRevenue: revenueByType.onlineRevenue,
              offlineRevenue: revenueByType.offlineRevenue,
              cashRevenue: offlinePayment.cashRevenue,
              momoRevenue: offlinePayment.momoRevenue,
            };
          });

          console.log("Search Daily - Combined Data:", combinedData);

          const total = combinedData.reduce((sum, item) => sum + item.revenue, 0);
          const totalOnlineRevenueSum = combinedData.reduce((sum, item) => sum + item.onlineRevenue, 0);
          const totalOfflineRevenueSum = combinedData.reduce((sum, item) => sum + item.offlineRevenue, 0);

          setChartData(combinedData);
          setTotalRevenue(total);
          setTotalOnlineRevenue(totalOnlineRevenueSum);
          setTotalOfflineRevenue(totalOfflineRevenueSum);
          setOrdersByRange({
            onlineOrders: Number(ordersByRangeRes.data?.onlineOrders || 0),
            offlineOrders: Number(ordersByRangeRes.data?.offlineOrders || 0),
          });

          console.log("Search Daily - Tổng doanh thu:", total);
          console.log("Search Daily - Doanh thu Online:", totalOnlineRevenueSum);
          console.log("Search Daily - Doanh thu Offline:", totalOfflineRevenueSum);
          console.log("Search Daily - Tổng đơn Online:", ordersByRangeRes.data?.onlineOrders);
          console.log("Search Daily - Tổng đơn Offline:", ordersByRangeRes.data?.offlineOrders);
        })
        .catch((error) => {
          console.error("Error fetching daily data:", error);
          toast.error("Có lỗi khi lấy dữ liệu hàng ngày!");
          setChartData([]);
          setTotalRevenue(0);
          setTotalOnlineRevenue(0);
          setTotalOfflineRevenue(0);
          setOrdersByRange({ onlineOrders: 0, offlineOrders: 0 });
        });
    } else if (daysDiff <= 90) {
      setViewType("weekly");
      Promise.all([
        StatisticsService.getWeeklyRevenue(startDate, endDate),
        StatisticsService.getWeeklyOrderCountByType(startDate, endDate),
        StatisticsService.getOrdersByDateRange(startDate, endDate),
        StatisticsService.getWeeklyRevenueByType(startDate, endDate),
        StatisticsService.getWeeklyOfflineRevenueByPaymentMethod(startDate, endDate),
      ])
        .then(([revenueRes, orderCountRes, ordersByRangeRes, revenueByTypeRes, offlineRevenueByPaymentRes]) => {
          console.log("Search Weekly - Raw revenue data:", revenueRes.data);
          console.log("Search Weekly - Raw order count data:", orderCountRes.data);
          console.log("Search Weekly - Raw orders by range:", ordersByRangeRes.data);
          console.log("Search Weekly - Raw revenue by type:", revenueByTypeRes.data);
          console.log("Search Weekly - Raw offline revenue by payment:", offlineRevenueByPaymentRes.data);

          const weekList = [];
          let currentDate = new Date(start);
          currentDate.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
          while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const firstDayOfYear = new Date(year, 0, 1);
            const daysSinceStartOfYear = Math.floor(
              (currentDate.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24)
            );
            const weekNumber = Math.ceil((daysSinceStartOfYear + firstDayOfYear.getDay() + 1) / 7);
            const weekKey = `${year}${weekNumber.toString().padStart(2, "0")}`;
            if (!weekList.includes(weekKey)) {
              weekList.push(weekKey);
            }
            currentDate.setDate(currentDate.getDate() + 7);
          }

          const revenueData = (revenueRes.data || []).map((item) => ({
            weekKey: item.week?.toString() || "",
            week: formatWeek(item.week || ""),
            revenue: Number(item.revenue || 0),
            orderCount: Number(item.orderCount || 0),
          }));

          const orderCountData = (orderCountRes.data || []).reduce((acc, item) => {
            const weekKey = item.week?.toString() || "";
            acc[weekKey] = {
              orderCount: Number(item.orderCount || 0),
              onlineOrders: Number(item.onlineOrders || 0),
              offlineOrders: Number(item.offlineOrders || 0),
              formattedWeek: formatWeek(weekKey),
            };
            return acc;
          }, {});

          const revenueByTypeData = (revenueByTypeRes.data || []).reduce((acc, item) => {
            const weekKey = item.week?.toString() || "";
            acc[weekKey] = acc[weekKey] || { onlineRevenue: 0, offlineRevenue: 0, formattedWeek: formatWeek(weekKey) };
            if (item.type === "ORDER ONLINE") {
              acc[weekKey].onlineRevenue = Number(item.revenue || 0);
            } else if (item.type === "OFFLINE") {
              acc[weekKey].offlineRevenue = Number(item.revenue || 0);
            }
            return acc;
          }, {});

          const offlineRevenueByPaymentData = (offlineRevenueByPaymentRes.data || []).map((item) => ({
            weekKey: item.week?.toString() || "",
            week: formatWeek(item.week || ""),
            cashRevenue: Number(item.cashRevenue || 0),
            momoRevenue: Number(item.momoRevenue || 0),
          }));

          const combinedData = weekList.map((weekKey) => {
            const formattedWeek = formatWeek(weekKey);
            const revenueItem = revenueData.find((item) => item.weekKey === weekKey) || {
              revenue: 0,
              orderCount: 0,
            };
            const orderItem = orderCountData[weekKey] || {
              orderCount: 0,
              onlineOrders: 0,
              offlineOrders: 0,
            };
            const revenueByType = revenueByTypeData[weekKey] || {
              onlineRevenue: 0,
              offlineRevenue: 0,
            };
            const offlinePayment = offlineRevenueByPaymentData.find((item) => item.weekKey === weekKey) || {
              cashRevenue: 0,
              momoRevenue: 0,
            };

            return {
              week: formattedWeek,
              revenue: revenueItem.revenue,
              orderCount: orderItem.orderCount,
              onlineOrders: orderItem.onlineOrders,
              offlineOrders: orderItem.offlineOrders,
              onlineRevenue: revenueByType.onlineRevenue,
              offlineRevenue: revenueByType.offlineRevenue,
              cashRevenue: offlinePayment.cashRevenue,
              momoRevenue: offlinePayment.momoRevenue,
            };
          });

          console.log("Search Weekly - Combined Data:", combinedData);

          const total = combinedData.reduce((sum, item) => sum + item.revenue, 0);
          const totalOnlineRevenueSum = combinedData.reduce((sum, item) => sum + item.onlineRevenue, 0);
          const totalOfflineRevenueSum = combinedData.reduce((sum, item) => sum + item.offlineRevenue, 0);

          setChartData(combinedData);
          setTotalRevenue(total);
          setTotalOnlineRevenue(totalOnlineRevenueSum);
          setTotalOfflineRevenue(totalOfflineRevenueSum);
          setOrdersByRange({
            onlineOrders: Number(ordersByRangeRes.data?.onlineOrders || 0),
            offlineOrders: Number(ordersByRangeRes.data?.offlineOrders || 0),
          });

          console.log("Search Weekly - Tổng doanh thu:", total);
          console.log("Search Weekly - Doanh thu Online:", totalOnlineRevenueSum);
          console.log("Search Weekly - Doanh thu Offline:", totalOfflineRevenueSum);
          console.log("Search Weekly - Tổng đơn Online:", ordersByRangeRes.data?.onlineOrders);
          console.log("Search Weekly - Tổng đơn Offline:", ordersByRangeRes.data?.offlineOrders);
        })
        .catch((error) => {
          console.error("Error fetching weekly data:", error);
          toast.error("Có lỗi khi lấy dữ liệu hàng tuần!");
          setChartData([]);
          setTotalRevenue(0);
          setTotalOnlineRevenue(0);
          setTotalOfflineRevenue(0);
          setOrdersByRange({ onlineOrders: 0, offlineOrders: 0 });
        });
    } else {
      setViewType("monthly");
      Promise.all([
        StatisticsService.getMonthlyRevenue(startDate, endDate),
        StatisticsService.getMonthlyOrderCountByType(startDate, endDate),
        StatisticsService.getOrdersByDateRange(startDate, endDate),
        StatisticsService.getMonthlyRevenueByType(startDate, endDate),
        StatisticsService.getMonthlyOfflineRevenueByPaymentMethod(startDate, endDate),
      ])
        .then(([revenueRes, orderCountRes, ordersByRangeRes, revenueByTypeRes, offlineRevenueByPaymentRes]) => {
          console.log("Search Monthly - Raw revenue data:", revenueRes.data);
          console.log("Search Monthly - Raw order count data:", orderCountRes.data);
          console.log("Search Monthly - Raw orders by range:", ordersByRangeRes.data);
          console.log("Search Monthly - Raw revenue by type data:", revenueByTypeRes.data);
          console.log("Search Monthly - Raw offline revenue by payment:", offlineRevenueByPaymentRes.data);

          const monthList = [];
          let currentDate = new Date(start);
          currentDate.setDate(1);
          const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
          while (currentDate <= endMonth) {
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
            const monthStr = formatMonth(monthKey);
            monthList.push({ monthKey, monthStr });
            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          const revenueData = (revenueRes.data || []).map((item) => ({
            monthKey: item.month || "",
            month: formatMonth(item.month || ""),
            revenue: Number(item.revenue || 0),
            orderCount: Number(item.orderCount || 0),
          }));

          const orderCountData = (orderCountRes.data || []).reduce((acc, item) => {
            const monthKey = item.month || "";
            acc[monthKey] = {
              orderCount: Number(item.orderCount || 0),
              onlineOrders: Number(item.onlineOrders || 0),
              offlineOrders: Number(item.offlineOrders || 0),
              formattedMonth: formatMonth(monthKey),
            };
            return acc;
          }, {});

          const revenueByTypeData = (revenueByTypeRes.data || []).reduce((acc, item) => {
            const monthKey = item.month || "";
            acc[monthKey] = {
              onlineRevenue: Number(item.onlineRevenue || 0),
              offlineRevenue: Number(item.offlineRevenue || 0),
            };
            return acc;
          }, {});

          const offlineRevenueByPaymentData = (offlineRevenueByPaymentRes.data || []).map((item) => ({
            monthKey: item.month || "",
            month: formatMonth(item.month || ""),
            cashRevenue: Number(item.cashRevenue || 0),
            momoRevenue: Number(item.momoRevenue || 0),
          }));

          const combinedData = monthList.map(({ monthKey, monthStr }) => {
            const revenueItem = revenueData.find((item) => item.monthKey === monthKey) || {
              revenue: 0,
              orderCount: 0,
            };
            const orderItem = orderCountData[monthKey] || {
              orderCount: 0,
              onlineOrders: 0,
              offlineOrders: 0,
            };
            const revenueByTypeItem = revenueByTypeData[monthKey] || {
              onlineRevenue: 0,
              offlineRevenue: 0,
            };
            const offlinePayment = offlineRevenueByPaymentData.find((item) => item.monthKey === monthKey) || {
              cashRevenue: 0,
              momoRevenue: 0,
            };

            return {
              month: monthStr,
              revenue: revenueItem.revenue,
              orderCount: orderItem.orderCount,
              onlineOrders: orderItem.onlineOrders,
              offlineOrders: orderItem.offlineOrders,
              onlineRevenue: revenueByTypeItem.onlineRevenue,
              offlineRevenue: revenueByTypeItem.offlineRevenue,
              cashRevenue: offlinePayment.cashRevenue,
              momoRevenue: offlinePayment.momoRevenue,
            };
          });

          console.log("Search Monthly - Combined Data:", combinedData);

          const total = combinedData.reduce((sum, item) => sum + item.revenue, 0);
          const totalOnlineRevenueSum = combinedData.reduce((sum, item) => sum + item.onlineRevenue, 0);
          const totalOfflineRevenueSum = combinedData.reduce((sum, item) => sum + item.offlineRevenue, 0);

          setChartData(combinedData);
          setTotalRevenue(total);
          setTotalOnlineRevenue(totalOnlineRevenueSum);
          setTotalOfflineRevenue(totalOfflineRevenueSum);
          setOrdersByRange({
            onlineOrders: Number(ordersByRangeRes.data?.onlineOrders || 0),
            offlineOrders: Number(ordersByRangeRes.data?.offlineOrders || 0),
          });

          console.log("Search Monthly - Tổng doanh thu:", total);
          console.log("Search Monthly - Doanh thu Online:", totalOnlineRevenueSum);
          console.log("Search Monthly - Doanh thu Offline:", totalOfflineRevenueSum);
          console.log("Search Monthly - Tổng đơn Online:", ordersByRangeRes.data?.onlineOrders);
          console.log("Search Monthly - Tổng đơn Offline:", ordersByRangeRes.data?.offlineOrders);
        })
        .catch((error) => {
          console.error("Error fetching monthly data:", error);
          toast.error("Có lỗi khi lấy dữ liệu hàng tháng!");
          setChartData([]);
          setTotalRevenue(0);
          setTotalOnlineRevenue(0);
          setTotalOfflineRevenue(0);
          setOrdersByRange({ onlineOrders: 0, offlineOrders: 0 });
        });
    }
  };

  const formatNumber = (value) => {
    return value !== null && value !== undefined ? value.toLocaleString("vi-VN") : "Đang tải...";
  };

  return (
    <div className="p-1 bg-gray-50 rounded-lg max-w-[1280px] mx-auto mt-2">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Tab Selection */}
      <div className="flex border-b overflow-x-auto">
        {[
          { name: "revenue", label: "Thống kê doanh thu", icon: <FaDollarSign size={11} /> },
          { name: "products", label: "Sản phẩm bán chạy", icon: <FaBoxOpen size={11} /> },
          { name: "customers", label: "Khách hàng thân thiết", icon: <FaUsers size={11} /> },
          // { name: "spa", label: "Quản lý Spa", icon: <FaHospital size={11} /> },
          // { name: "interface", label: "Quản lý giao diện", icon: <FaPalette size={11} /> }
        ].map((tab) => (
          <button
            key={tab.name}
            className={`py-1.5 px-3.5 font-medium text-xs md:text-sm rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === tab.name
                ? "bg-white text-blue-600 border-b-2 border-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            <span className="inline-flex items-center gap-1">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg p-3.5">
        {activeTab === "revenue" && (
          <div>
            {/* Revenue Tab Content */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3 overflow-x-auto">
              {[
                {
                  title: "Hôm nay",
                  revenue: revenueToday,
                  orders: totalOrdersToday,
                  icon: <FaDollarSign size={12} />,
                  color: "text-green-500",
                },
                {
                  title: "Hôm qua",
                  revenue: revenueYesterday,
                  orders: totalOrdersYesterday,
                  icon: <FaChartBar size={12} />,
                  color: "text-orange-500",
                },
                {
                  title: "Tháng này",
                  revenue: monthlyRevenue,
                  orders: totalOrdersThisMonth,
                  icon: <FaBoxOpen size={12} />,
                  color: "text-blue-500",
                },
                {
                  title: "Sản phẩm",
                  value: totalStock,
                  icon: <FaBoxOpen size={12} />,
                  color: "text-purple-500",
                },
                {
                  title: "Khách hàng",
                  value: totalCustomers,
                  icon: <FaUsers size={12} />,
                  color: "text-teal-500",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-2 rounded-lg bg-white hover:bg-gray-50 transition flex items-center gap-2 group relative"
                >
                  <div className={`text-base ${item.color}`}>{item.icon}</div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-600 truncate">{item.title}</h3>
                    {item.revenue !== undefined ? (
                      <>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {formatCurrency(item.revenue)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Đơn: {formatNumber(item.orders?.totalOrders || item.orders)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-gray-900 truncate">{formatNumber(item.value)}</p>
                    )}
                  </div>
                  {item.revenue !== undefined && item.onlineRevenue !== undefined && item.offlineRevenue !== undefined && (
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-md p-2 z-10 top-full left-0 mt-1 min-w-[150px] shadow-lg">
                      <p className="truncate">Online: {formatCurrency(item.onlineRevenue)}</p>
                      <p className="truncate">Offline: {formatCurrency(item.offlineRevenue)}</p>
                      {item.orders && typeof item.orders === "object" && (
                        <>
                          <p className="truncate">Đơn Online: {formatNumber(item.orders.onlineOrders)}</p>
                          <p className="truncate">Đơn Offline: {formatNumber(item.orders.offlineOrders)}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-3.5 bg-white p-2.5 rounded-md border border-gray-200">
              <div className="flex items-center mb-1.5 text-gray-800">
                <FaSearch className="mr-1.5 text-blue-600" size={11} />
                <span className="text-sm font-semibold">Tìm kiếm doanh thu</span>
              </div>
              <div className="flex flex-row gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={fetchRevenueByDate}
                  className="bg-blue-600 text-white px-3.5 py-2 rounded hover:bg-blue-700 transition flex items-center text-sm"
                >
                  <FaSearch className="mr-1" size={10} /> Tìm
                </button>
              </div>
              <div className="flex flex-row justify-between items-center mt-2.5">
                {totalRevenue !== null && (
                  <div>
                    <p className="text-sm font-semibold text-green-700 truncate">
                      Tổng: {formatCurrency(totalRevenue)}
                    </p>
                    {(totalOnlineRevenue > 0 || totalOfflineRevenue > 0) && (
                      <div className="flex flex-col mt-1">
                        <p className="text-xs text-blue-600 truncate">
                          Online: {formatCurrency(totalOnlineRevenue)}
                        </p>
                        <p className="text-xs text-orange-600 truncate">
                          Offline: {formatCurrency(totalOfflineRevenue)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={exportRevenueReport}
                  className="bg-green-600 text-white px-3.5 py-2 rounded hover:bg-green-700 transition flex items-center text-sm"
                >
                  📥 Excel
                </button>
              </div>
              {ordersByRange.offlineOrders !== null && ordersByRange.onlineOrders !== null && (
                <div className="mt-1.5 flex flex-row gap-3.5">
                  <p className="text-xs text-gray-700 truncate">
                    Đơn Offline: {formatNumber(ordersByRange.offlineOrders)}
                  </p>
                  <p className="text-xs text-gray-700 truncate">
                    Đơn Online: {formatNumber(ordersByRange.onlineOrders)}
                  </p>
                </div>
              )}
            </div>

            {chartData.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-base font-semibold text-gray-800">📈 Biểu đồ</span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }} barCategoryGap={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey={viewType === "daily" ? "date" : viewType === "weekly" ? "week" : "month"}
                      tickFormatter={(value) => value}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      height={30}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#3B82F6"
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        else if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return value;
                      }}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      width={40}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                      allowDecimals={false}
                      tickFormatter={(value) => value}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    {/* ===== Doanh thu ===== */}
                    <Bar yAxisId="left" dataKey="revenue" fill="#4B5563" name="Tổng doanh thu" barSize={10} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="onlineRevenue" fill="#1E90FF" name="Online" barSize={10} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="offlineRevenue" fill="#FF8C00" name="Offline" barSize={10} radius={[4, 4, 0, 0]} />
                    {/* ===== Đơn hàng ===== */}
                    <Bar yAxisId="right" dataKey="orderCount" fill="#82ca9d" name="Tổng đơn" barSize={10} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="onlineOrders" fill="#4682B4" name="Đơn Online" barSize={10} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="offlineOrders" fill="#FFD700" name="Đơn Offline" barSize={10} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="mb-2.5">
              <span className="text-sm font-semibold text-blue-600">Top 5 sản phẩm bán chạy</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 overflow-x-auto">
              {bestSellingProducts.length > 0 ? (
                bestSellingProducts.map((product, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-md p-2.5 bg-white transition hover:bg-gray-50 relative group"
                  >
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="h-20 w-full object-cover rounded-md mb-1.5"
                    />
                    <h4 className="text-sm font-semibold text-gray-800 truncate" title={product.productName}>
                      {product.productName}
                    </h4>
                    <p className="text-xs text-gray-600">
                      Màu: <span className="font-medium">{product.colorValue}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Size: <span className="font-medium">{product.sizeValue}</span>
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      Khối lượng: <span className="font-medium">{product.weightValue} kg</span>
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-600 truncate">
                        Bán được: {formatNumber(product.totalSold)}
                      </p>
                      <p className="text-sm font-bold text-green-600 truncate">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Không có dữ liệu.</p>
              )}
            </div>

            <div className="mb-2.5 mt-6">
              <span className="text-sm font-semibold text-blue-600">Top 5 sản phẩm được yêu thích nhất</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 overflow-x-auto">
              {topFavoriteProducts.length > 0 ? (
                topFavoriteProducts.map((product, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-md p-2.5 bg-white transition hover:bg-gray-50 relative group"
                  >
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="h-20 w-full object-cover rounded-md mb-1.5"
                    />
                    <h4 className="text-sm font-semibold text-gray-800 truncate" title={product.productName}>
                      {product.productName}
                    </h4>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-600 truncate">
                        Lượt yêu thích: {formatNumber(product.favoriteCount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Không có dữ liệu.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div>
            <div className="flex items-center mb-2.5">
              <FiUser className="mr-1.5 text-blue-600" size={13} />
              <span className="text-sm font-semibold text-blue-600">Top 5 khách hàng</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 overflow-x-auto">
              {topFiveCustomers.length > 0 ? (
                topFiveCustomers.map((customer, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-md p-2.5 bg-white transition hover:bg-gray-50"
                  >
                    <h6 className="text-sm font-semibold text-gray-800 truncate">{customer.fullName}</h6>
                    <div className="mt-1 text-xs text-gray-700 space-y-0.5">
                      <p className="flex items-center gap-1.5 truncate">
                        <FiPhone className="text-gray-600" size={11} />
                        <span className="text-gray-600">{customer.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <FiShoppingCart className="text-blue-600" size={11} />
                        <span className="font-bold text-blue-600">{formatNumber(customer.orderCount)}</span> đơn
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Không có dữ liệu.</p>
              )}
            </div>
          </div>
        )}

        {/*{activeTab === "spa" && (*/}
        {/*  <div className="p-4">*/}
        {/*    <div className="flex flex-col items-center justify-center my-8 text-center">*/}
        {/*      <FaHospital className="text-blue-500 text-4xl mb-4" />*/}
        {/*      <h3 className="text-lg font-semibold text-gray-700 mb-2">Quản lý Spa</h3>*/}
        {/*      <p className="text-gray-500 max-w-md">*/}
        {/*        Tính năng Quản lý Spa đang được phát triển. Vui lòng quay lại sau.*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}

        {/*{activeTab === "interface" && (*/}
        {/*  <div className="p-4">*/}
        {/*    <div className="flex flex-col items-center justify-center my-8 text-center">*/}
        {/*      <FaPalette className="text-purple-500 text-4xl mb-4" />*/}
        {/*      <h3 className="text-lg font-semibold text-gray-700 mb-2">Quản lý giao diện</h3>*/}
        {/*      <p className="text-gray-500 max-w-md">*/}
        {/*        Tính năng Quản lý giao diện đang được phát triển. Vui lòng quay lại sau.*/}
        {/*      </p>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </div>
  );
};

export default ManageStatistics;