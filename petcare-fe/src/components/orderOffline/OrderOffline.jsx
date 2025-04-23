import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoClose, IoCheckmark, IoRefresh } from "react-icons/io5";
import { getAllProductDetails, createOfflineOrder, getPointsByPhone, applyDiscount, addProductToOfflineCart, removeProductFromOfflineCart, getOfflineCartDetails } from "../../service/orderOfflineService/OfflineService";
import MomoService from "../../service/paymentService/MomoService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";
import { useCookies } from "react-cookie";
import { decodeToken } from "../utils/jwt";
import { useNavigate } from "react-router-dom";
import QRImage from '/src/assets/images/QR.jpg';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';


const isPaymentDisabled = (currentTab) => {
  const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000));
  if (currentTab.products.length === 0) return true;
  if (currentTab.paymentMethod === 'TRANSFER' || currentTab.paymentMethod === 'MOMO') return false;
  if (currentTab.paymentMethod === 'CASH') {
    if (totalAmount === 0) return false;
    return currentTab.customerPayment < totalAmount;
  }
  return true;
};

const OrderOffline = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      title: "Hóa đơn 1",
      products: [],
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      paymentMethod: 'CASH',
      error: '',
      customerPhone: '',
      customerName: 'Khách lẻ',
      accumulatePoints: false,
      totalPoints: 0,
      pointsToUse: 0
    },
    {
      id: 2,
      title: "Hóa đơn 2",
      products: [],
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      paymentMethod: 'CASH',
      error: '',
      customerPhone: '',
      customerName: 'Khách lẻ',
      accumulatePoints: false,
      totalPoints: 0,
      pointsToUse: 0
    },
    {
      id: 3,
      title: "Hóa đơn 3",
      products: [],
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      paymentMethod: 'CASH',
      error: '',
      customerPhone: '',
      customerName: 'Khách lẻ',
      accumulatePoints: false,
      totalPoints: 0,
      pointsToUse: 0
    }
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [productsFromApi, setProductsFromApi] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [staffId, setStaffId] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cookies] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  const [showMomoModal, setShowMomoModal] = useState(false);
  const [momoQrString, setMomoQrString] = useState('');
  const [momoTransactionId, setMomoTransactionId] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState('');


  // Hàm xử lý quay lại trang admin
  const handleBackToAdmin = () => {
    navigate("/admin"); // Điều hướng đến trang admin
  };

  useEffect(() => {
    const token = cookies.accessToken;
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setStaffId(decoded.userId);
        setStaffName(decoded.fullName || "Nhân viên");
        setIsAuthenticated(true);
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [cookies.accessToken, navigate]);

  useEffect(() => {
    if (!staffId) return;

    const fetchProducts = async () => {
      try {
        const data = await getAllProductDetails();
        setProductsFromApi(data);
      } catch (error) {
        console.error('Không thể tải sản phẩm:', error);
      }
    };

    const fetchInitialCart = async () => {
      try {
        for (const tab of tabs) {
          await fetchOfflineCartDetails(staffId, tab.id);
        }
      } catch (error) {
        console.error('Không thể tải giỏ hàng ban đầu:', error);
      }
    };

    fetchProducts();
    fetchInitialCart();
  }, [staffId]);

  const fetchOfflineCartDetails = async (userId, tabId) => {
    try {
      const cartDetails = await getOfflineCartDetails(userId, tabId);
      const cartProducts = cartDetails.map(cart => ({
        id: cart.productDetails.productDetailId,
        name: cart.productDetails.products.productName,
        variant: `${cart.productDetails.productSizes?.sizeValue || 'N/A'} | ${cart.productDetails.weights?.weightValue || 'N/A'}kg | ${cart.productDetails.productColors?.colorValue || 'N/A'}`,
        quantity: cart.quantityItem,
        price: cart.productDetails.price,
        total: cart.quantityItem * cart.productDetails.price,
        image: cart.productDetails.products?.image || '/images/default-image.jpg'
      }));
      setTabs(prevTabs => prevTabs.map(tab =>
        tab.id === tabId ? { ...tab, products: cartProducts } : tab
      ));
    } catch (error) {
      console.error(`Không thể lấy giỏ hàng cho tab ${tabId}:`, error);
      toast.error(`Không thể lấy giỏ hàng cho tab ${tabId}`);
    }
  };

  const ProductLists = ({ products, handleAddProduct, selectedProducts, currentPage, setCurrentPage }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const productsPerPage = 10;

    // Lọc sản phẩm: Ẩn productDetails.status = false và lọc theo tên
    const filteredProducts = products.filter(product => {
      const isProductActive = product.products?.status === true; // Kiểm tra sản phẩm chính
      const isDetailActive = product.status !== false; // Kiểm tra biến thể (nếu có trường status)
      const matchesSearch = product.products?.productName?.toLowerCase().includes(localSearchTerm.toLowerCase()) || false;
      return isProductActive && isDetailActive && matchesSearch;
    });

    // Sắp xếp sản phẩm để các biến thể cùng productId nằm gần nhau
    const sortedProducts = filteredProducts.sort((a, b) => {
      // Chuyển productId thành chuỗi, mặc định là '0' nếu không tồn tại
      const productIdA = String(a.products?.productId ?? '0');
      const productIdB = String(b.products?.productId ?? '0');

      if (productIdA === productIdB) {
        // Nếu cùng productId, sắp xếp theo biến thể (size, weight, color)
        const variantA = `${a.productSizes?.sizeValue || ''}${a.weights?.weightValue || ''}${a.productColors?.colorValue || ''}`;
        const variantB = `${b.productSizes?.sizeValue || ''}${b.weights?.weightValue || ''}${b.productColors?.colorValue || ''}`;
        return variantA.localeCompare(variantB);
      }
      return productIdA.localeCompare(productIdB); // Sắp xếp theo productId
    });

    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
      <>
        <div className="flex items-center bg-white w-full rounded px-2 py-1 mb-2 border border-[#e59f1e] focus-within:ring-1 focus-within:ring-[#e59f1e]/50 focus-within:border-[#e59f1e]">
          <IoSearchOutline className="text-[#e59f1e] text-sm mr-1" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="px-1 outline-none w-full text-xs text-gray-700"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
          {localSearchTerm && (
            <button
              onClick={() => setLocalSearchTerm("")}
              className="text-gray-400 hover:text-[#e59f1e]"
            >
              <IoClose size={14} />
            </button>
          )}
        </div>
        <div className="bg-gray-50 rounded-md mb-2 p-1">
          <div className="text-[10px] text-gray-500 flex justify-between items-center">
            <span>Tìm thấy {filteredProducts.length} sản phẩm</span>
            <span>Trang {currentPage}/{totalPages || 1}</span>
          </div>
        </div>
        <div className="overflow-auto flex-1 rounded-md border border-gray-200">
          <table className="w-full">
            <thead className="bg-[#e59f1e] text-white sticky top-0 z-10">
              <tr>
                <th className="p-1 text-left text-[10px] font-semibold">STT</th>
                <th className="p-1 text-left text-[10px] font-semibold">Ảnh</th>
                <th className="p-1 text-left text-[10px] font-semibold">Tên sản phẩm</th>
                <th className="p-1 text-left text-[10px] font-semibold">Biến thể</th>
                <th className="p-1 text-right text-[10px] font-semibold">Giá</th>
                <th className="p-1 text-right text-[10px] font-semibold">Tồn</th>
                <th className="p-1 text-center text-[10px] font-semibold">TT</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => {
                  const isSelected = selectedProducts.some(p => p.id === product.productDetailId);
                  const inStock = product.quantity > 0;
                  return (
                    <tr
                      key={product.productDetailId}
                      className={`border-b ${!inStock ? 'bg-gray-100 opacity-60' : isSelected ? 'bg-orange-50' : 'hover:bg-gray-50'} transition-colors duration-100 cursor-pointer`}
                      onClick={() => inStock ? handleAddProduct(product) : toast.warn(`Sản phẩm "${product.products?.productName}" đã hết hàng!`)}
                    >
                      <td className="p-1 text-[10px]">{indexOfFirstProduct + index + 1}</td>
                      <td className="p-1">
                        <div className="relative">
                          <img
                            src={product.products?.image || '/images/default-image.jpg'}
                            alt={product.products?.productName || 'Sản phẩm'}
                            className="w-8 h-8 object-cover rounded border border-gray-200"
                          />
                          {!inStock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                              <span className="text-[8px] font-bold text-white">HẾT HÀNG</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-1 text-[10px] font-medium">{product.products?.productName || 'N/A'}</td>
                      <td className="p-1 text-[10px] text-gray-600">
                        {`${product.productSizes?.sizeValue || ''} ${product.weights?.weightValue ? `| ${product.weights?.weightValue}kg` : ''} ${product.productColors?.colorValue ? `| ${product.productColors?.colorValue}` : ''}`}
                      </td>
                      <td className="p-1 text-right text-[10px] font-medium">{product.price?.toLocaleString() || '0'}đ</td>
                      <td className="p-1 text-right text-[10px]">
                        <span className={`${product.quantity < 5 && product.quantity > 0 ? 'text-orange-500' : product.quantity === 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {product.quantity || 0}
                        </span>
                      </td>
                      <td className="p-1 text-center">
                        {isSelected ? (
                          <div className="bg-[#e59f1e] rounded-full w-4 h-4 mx-auto flex items-center justify-center">
                            <IoCheckmark className="text-white text-[10px]" />
                          </div>
                        ) : (
                          inStock && (
                            <div className="bg-gray-200 hover:bg-[#e59f1e]/20 rounded-full w-4 h-4 mx-auto"></div>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-[10px] text-gray-500">
                    {localSearchTerm ?
                      <div className="flex flex-col items-center py-2">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <p>Không tìm thấy sản phẩm phù hợp với "{localSearchTerm}"</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalSearchTerm("");
                          }}
                          className="mt-1 text-[#e59f1e] hover:underline"
                        >
                          Xóa tìm kiếm
                        </button>
                      </div> :
                      "Không có sản phẩm nào"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-2">
          <button
            className="px-2 py-1 text-[10px] bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Trước
          </button>

          <div className="flex items-center">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Hiển thị các trang xung quanh trang hiện tại
              let pageToShow;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }

              return (
                <button
                  key={i}
                  className={`w-5 h-5 mx-0.5 text-[10px] rounded-full ${currentPage === pageToShow ? 'bg-[#e59f1e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setCurrentPage(pageToShow)}
                >
                  {pageToShow}
                </button>
              );
            })}
          </div>

          <button
            className="px-2 py-1 text-[10px] bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Sau
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </>
    );
  };

  const handleAddProduct = async (product) => {
    const userId = staffId;
    const productDetailId = product.productDetailId;
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const existingProduct = currentTab.products.find(p => p.id === productDetailId);

    try {
      if (existingProduct) {
        await removeProductFromOfflineCart(userId, productDetailId, activeTab);
        setTabs(tabs.map(tab =>
          tab.id === activeTab
            ? { ...tab, products: tab.products.filter(p => p.id !== productDetailId) }
            : tab
        ));
      } else {
        if (product.quantity < 1) {
          toast.error(`Sản phẩm "${product.products.productName}" đã hết hàng!`);
          return;
        }
        await addProductToOfflineCart(userId, productDetailId, 1, activeTab);
        setTabs(tabs.map(tab =>
          tab.id === activeTab
            ? {
              ...tab,
              products: [...tab.products, {
                id: product.productDetailId,
                name: product.products.productName,
                variant: `${product.productSizes?.sizeValue || 'N/A'} | ${product.weights?.weightValue || 'N/A'}kg | ${product.productColors?.colorValue || 'N/A'}`,
                quantity: 1,
                price: product.price,
                total: product.price,
                image: product.products?.image || '/images/default-image.jpg'
              }]
            }
            : tab
        ));
      }
    } catch (error) {
      toast.error('Không thể cập nhật giỏ hàng offline: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handlePaymentMethodChange = (method) => {
    setTabs(tabs.map(tab =>
      tab.id === activeTab ? { ...tab, paymentMethod: method } : tab
    ));

    if (method === 'MOMO') {
      setShowMomoModal(true);
      const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];
      const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000));
      const paymentCode = `PETCARE-${currentTab.id}-${new Date().getTime().toString().slice(-6)}`;
      generateMomoQrString(totalAmount, paymentCode);
    } else {
      setShowMomoModal(false);
    }
  };

  const generateMomoQrString = async (amount, orderInfo) => {
    try {
      setMomoQrString(''); // Reset QR code while loading

      // Làm tròn số tiền (chỉ lấy số nguyên)
      const amountFormatted = Math.floor(amount).toString();

      // Tạo mã giao dịch duy nhất
      const timestamp = new Date().getTime();
      const uniqueId = `MOMO${timestamp}`;

      // Fallback khi không kết nối được với backend
      // Tạo chuỗi thanh toán theo chuẩn MoMo với số điện thoại của bạn
      const momoPaymentString = `2|99|0976867330|Cua Hang PETCARE|0|${uniqueId}|${amountFormatted}|${orderInfo}`;

      // Tạo QR code từ chuỗi thanh toán MoMo
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(momoPaymentString)}&color=b0006d`;

      console.log("MoMo Payment String:", momoPaymentString);
      console.log("Số tiền thanh toán:", amountFormatted, "VND");
      console.log("Mã đơn hàng (lời nhắn):", orderInfo);

      // Lưu URL QR để hiển thị
      setMomoQrString(qrCodeUrl);
      setMomoTransactionId(uniqueId);

      return uniqueId;
    } catch (error) {
      console.error("Error generating MoMo QR:", error);

      // Fallback với QR code chuẩn MoMo đơn giản
      const amount_str = Math.floor(amount).toString();
      const fallbackString = `2|99|0976867330|Cua Hang PETCARE|0|MOMO${Date.now()}|${amount_str}|${orderInfo}`;
      const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fallbackString)}&color=b0006d`;

      setMomoQrString(fallbackQrUrl);
      setMomoTransactionId("MOMO_FALLBACK_" + Date.now());

      return null;
    }
  };
  const generateInvoicePDF = (orderData, response) => {
    try {
      console.log("Bắt đầu tạo PDF với dữ liệu:", { orderData, response });
  
      // Kiểm tra dữ liệu đầu vào
      if (!orderData || !response || !response.orderId) {
        console.error("Dữ liệu không đầy đủ để tạo hóa đơn:", { orderData, response });
        toast.error("Không thể xuất hóa đơn PDF: Thiếu thông tin đơn hàng");
        return;
      }
  
      // Đảm bảo currentTab tồn tại và có sản phẩm
      const currentTab = tabs.find(tab => tab.id === activeTab);
      if (!currentTab || !currentTab.products || currentTab.products.length === 0) {
        console.error("Không có sản phẩm trong giỏ hàng để tạo hóa đơn");
        toast.error("Không thể xuất hóa đơn PDF: Giỏ hàng trống");
        return;
      }
  
      try {
        // Chuyển đổi chữ tiếng Việt sang không dấu để hiển thị tốt hơn
        const removeDiacritics = (text) => {
          if (!text) return "";
          return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, match => match === 'đ' ? 'd' : 'D');
        };
  
        const formatText = (str) => removeDiacritics(str);
  
        // Khởi tạo đối tượng PDF với kích thước A4
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
  
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const bottomMargin = 30; // Khoảng cách tối thiểu từ đáy trang
  
        // Sử dụng font mặc định
        const primaryFont = "helvetica";
  
        // Header: Background và tiêu đề cửa hàng
        doc.setFillColor(255, 246, 227);
        doc.rect(0, 0, pageWidth, 45, "F");
  
        // Logo hoặc tên cửa hàng
        doc.setTextColor(176, 0, 109);
        doc.setFontSize(18);
        doc.setFont(primaryFont, "bold");
        doc.text("PETCARE", pageWidth / 2, 18, { align: "center" });
  
        // Tiêu đề hóa đơn
        doc.setFontSize(16);
        doc.text(formatText("HOA DON BAN HANG"), pageWidth / 2, 30, { align: "center" });
  
        // Thông tin cửa hàng
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont(primaryFont, "normal");
        doc.text(formatText("Dia chi: E62, Duong so 2, khu do thi moi Hung Phu, Phuong Hung Thanh, Quan Cai Rang, TP. Can Tho"), pageWidth / 2, 38, { align: "center" });
        doc.text("Hotline: 0844233799", pageWidth / 2, 43, { align: "center" });
  
        // Đường kẻ phân cách
        doc.setDrawColor(176, 0, 109);
        doc.setLineWidth(0.5);
        doc.line(20, 50, pageWidth - 20, 50);
  
        // Thông tin hóa đơn và khách hàng
        doc.setFontSize(12);
        doc.setFont(primaryFont, "bold");
        doc.setTextColor(176, 0, 109);
        doc.text(formatText("THONG TIN HOA DON"), pageWidth / 2, 60, { align: "center" });
  
        // Vẽ khung thông tin
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(20, 63, pageWidth - 40, 40, 2, 2, "F");
  
        // Nội dung thông tin hóa đơn và khách hàng
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont(primaryFont, "normal");
  
        const leftColumnX = 25;
        const rightColumnX = pageWidth / 2 + 5;
        const labelWidth = 30;
        let infoY = 70;
        const infoLineHeight = 8;
  
        // Cột trái: Thông tin hóa đơn
        doc.text(formatText("Ma hoa don:"), leftColumnX, infoY);
        doc.setFont(primaryFont, "bold");
        doc.text(formatText(`${response.orderId || "N/A"}`), leftColumnX + labelWidth, infoY);
  
        doc.setFont(primaryFont, "normal");
        doc.text(formatText("Ngay:"), leftColumnX, infoY + infoLineHeight);
        doc.setFont(primaryFont, "bold");
        doc.text(formatText(`${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}`), leftColumnX + labelWidth, infoY + infoLineHeight);
  
        doc.setFont(primaryFont, "normal");
        doc.text(formatText("Gio:"), leftColumnX, infoY + 2 * infoLineHeight);
        doc.setFont(primaryFont, "bold");
        doc.text(formatText(`${new Date().toLocaleTimeString('vi-VN')}`), leftColumnX + labelWidth, infoY + 2 * infoLineHeight);
  
        doc.setFont(primaryFont, "normal");
        doc.text(formatText("Nhan vien:"), leftColumnX, infoY + 3 * infoLineHeight);
        doc.setFont(primaryFont, "bold");
        doc.text(formatText(`${staffName || "N/A"}`), leftColumnX + labelWidth, infoY + 3 * infoLineHeight);
  
        // Cột phải: Thông tin khách hàng
        doc.setFont(primaryFont, "normal");
        doc.text(formatText("Ten khach hang:"), rightColumnX, infoY);
        doc.setFont(primaryFont, "bold");
        doc.text(formatText(`${orderData.customerName || "Khach le"}`), rightColumnX + labelWidth, infoY);
  
        doc.setFont(primaryFont, "normal");
        doc.text(formatText("SDT:"), rightColumnX, infoY + infoLineHeight);
        doc.setFont(primaryFont, "bold");
        doc.text(formatText(`${orderData.customerPhone || "N/A"}`), rightColumnX + labelWidth, infoY + infoLineHeight);
  
        if (orderData.pointsToUse > 0) {
          doc.setFont(primaryFont, "normal");
          doc.text(formatText("Diem su dung:"), rightColumnX, infoY + 2 * infoLineHeight);
          doc.setFont(primaryFont, "bold");
          doc.text(formatText(`${orderData.pointsToUse} diem`), rightColumnX + labelWidth, infoY + 2 * infoLineHeight);
  
          doc.setFont(primaryFont, "normal");
          doc.text(formatText("Diem tich luy:"), rightColumnX, infoY + 3 * infoLineHeight);
          doc.setFont(primaryFont, "bold");
          doc.text(formatText(`${currentTab.totalPoints} diem`), rightColumnX + labelWidth, infoY + 3 * infoLineHeight);
        }
  
        // Danh sách sản phẩm
        doc.setFontSize(14);
        doc.setFont(primaryFont, "bold");
        doc.setTextColor(176, 0, 109);
        doc.text(formatText("DANH SACH SAN PHAM"), pageWidth / 2, 115, { align: "center" });
  
        doc.setDrawColor(176, 0, 109);
        doc.setLineWidth(0.3);
        doc.line(20, 118, pageWidth - 20, 118);
  
        // Tạo bảng sản phẩm
        const tableColumn = [
          formatText("STT"),
          formatText("Ten san pham"),
          formatText("Bien the"),
          "SL",
          formatText("Don gia"),
          formatText("Thanh tien")
        ];
  
        const tableRows = currentTab.products.map((product, index) => [
          index + 1,
          formatText(product.name || "N/A"),
          formatText(product.variant ? product.variant.replace(/\|/g, ', ') : "N/A"),
          product.quantity || 0,
          (product.price || 0).toLocaleString() + "d",
          (product.total || 0).toLocaleString() + "d"
        ]);
  
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 122,
          theme: 'grid',
          headStyles: {
            fillColor: [176, 0, 109],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.3,
            lineColor: [150, 0, 109],
            fontSize: 12,
            cellPadding: 4
          },
          alternateRowStyles: {
            fillColor: [252, 242, 248]
          },
          bodyStyles: {
            lineColor: [230, 230, 230],
            lineWidth: 0.3,
            fontSize: 10,
            cellPadding: 4
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 50, halign: 'left', fontStyle: 'normal' },
            2: { cellWidth: 45, halign: 'left', fontStyle: 'normal' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 25, halign: 'right', fontStyle: 'normal' },
            5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
          },
          margin: { left: 20, right: 20 },
          didDrawPage: function (data) {
            if (data.pageCount > 1) {
              doc.setFillColor(255, 246, 227);
              doc.rect(0, 0, pageWidth, 30, "F");
  
              doc.setFontSize(14);
              doc.setFont(primaryFont, "bold");
              doc.setTextColor(176, 0, 109);
              doc.text(formatText("PETCARE - HOA DON BAN HANG"), pageWidth / 2, 15, { align: "center" });
              doc.text(`(Trang ${data.pageCount})`, pageWidth / 2, 22, { align: "center" });
  
              doc.setDrawColor(176, 0, 109);
              doc.setLineWidth(0.3);
              doc.line(20, 25, pageWidth - 20, 25);
  
              data.settings.margin.top = 30;
            }
          }
        });
  
        // Xác định vị trí cuối của bảng
        let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 160;
  
        // Tính toán chiều cao thực tế của phần thông tin thanh toán
        const rowHeight = 8;
        let paymentSectionHeight = 15; // Khoảng cách ban đầu từ tiêu đề đến nội dung + padding
        paymentSectionHeight += rowHeight; // Dòng tiêu đề "THÔNG TIN THANH TOÁN"
        paymentSectionHeight += rowHeight; // Dòng "Tổng tiền hàng"
        const discountAmount = orderData.pointsToUse > 0 ? (orderData.pointsToUse / 100 * 30000) : 0;
        if (discountAmount > 0) {
          paymentSectionHeight += (rowHeight - 2); // Dòng "Giảm giá"
          paymentSectionHeight += rowHeight; // Dòng điểm sử dụng
        }
        paymentSectionHeight += rowHeight; // Đường kẻ phân cách
        paymentSectionHeight += (rowHeight + 2); // Dòng "Tổng thanh toán"
        paymentSectionHeight += rowHeight; // Dòng "Phương thức"
        if (orderData.paymentMethod === 'CASH') {
          paymentSectionHeight += rowHeight; // Dòng "Tiền khách đưa"
          paymentSectionHeight += rowHeight; // Dòng "Tiền thối"
        }
        paymentSectionHeight += 5; // Khoảng cách thêm để đảm bảo không gian
  
        const footerHeight = 30; // Ước tính chiều cao footer
        // Chỉ chuyển trang nếu danh sách sản phẩm dài (ví dụ: hơn 5 sản phẩm)
        const productCount = currentTab.products.length;
        const estimatedTableHeight = 10 + (productCount * 10); // Ước tính chiều cao bảng (header + mỗi dòng ~10mm)
        const spaceNeeded = finalY + estimatedTableHeight + paymentSectionHeight + footerHeight;
        if (spaceNeeded > pageHeight - bottomMargin && productCount > 5) {
          doc.addPage();
          finalY = 30; // Bắt đầu từ đầu trang mới
          // Thêm header cho trang mới
          doc.setFillColor(255, 246, 227);
          doc.rect(0, 0, pageWidth, 30, "F");
          doc.setFontSize(14);
          doc.setFont(primaryFont, "bold");
          doc.setTextColor(176, 0, 109);
          doc.text(formatText("PETCARE - HOA DON BAN HANG"), pageWidth / 2, 15, { align: "center" });
          doc.text(`(Trang ${doc.internal.getNumberOfPages()})`, pageWidth / 2, 22, { align: "center" });
          doc.setDrawColor(176, 0, 109);
          doc.setLineWidth(0.3);
          doc.line(20, 25, pageWidth - 20, 25);
        }
  
        // Vẽ khung thông tin thanh toán
        doc.setDrawColor(176, 0, 109);
        doc.setFillColor(255, 246, 227);
        doc.roundedRect(pageWidth - 120, finalY, 100, paymentSectionHeight, 3, 3, "F");
  
        // Tiêu đề "THÔNG TIN THANH TOÁN" bên trong khung
        doc.setFontSize(12);
        doc.setFont(primaryFont, "bold");
        doc.setTextColor(176, 0, 109);
        doc.text(formatText("THONG TIN THANH TOAN"), pageWidth - 70, finalY + 10, { align: "center" });
  
        // Chi tiết thanh toán
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.setFont(primaryFont, "normal");
  
        const paymentTextX = pageWidth - 110;
        const paymentValueX = pageWidth - 25;
        let rowY = finalY + 20;
  
        // Tổng tiền hàng
        doc.text(formatText("Tong tien hang:"), paymentTextX, rowY);
        doc.text(`${currentTab.products.reduce((sum, p) => sum + (p.total || 0), 0).toLocaleString()}d`, paymentValueX, rowY, { align: "right" });
        rowY += rowHeight;
  
        // Giảm giá (nếu có)
        if (discountAmount > 0) {
          doc.text(formatText("Giam gia:"), paymentTextX, rowY);
          doc.text(`-${discountAmount.toLocaleString()}d`, paymentValueX, rowY, { align: "right" });
          rowY += rowHeight - 2;
  
          doc.text(`(${orderData.pointsToUse} diem)`, paymentValueX, rowY, { align: "right" });
          rowY += rowHeight;
        }
  
        // Đường kẻ phân cách
        doc.setDrawColor(176, 0, 109);
        doc.setLineWidth(0.3);
        doc.line(paymentTextX, rowY, paymentValueX, rowY);
        rowY += rowHeight;
  
        // Tổng thanh toán
        doc.setFont(primaryFont, "bold");
        doc.setFontSize(12);
        doc.setTextColor(176, 0, 109);
        doc.text(formatText("Tong thanh toan:"), paymentTextX, rowY);
        doc.text(`${Math.max(0, currentTab.products.reduce((sum, p) => sum + (p.total || 0), 0) - discountAmount).toLocaleString()}d`, paymentValueX, rowY, { align: "right" });
        rowY += rowHeight + 2;
  
        // Phương thức thanh toán
        doc.setFont(primaryFont, "normal");
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const paymentMethodText = orderData.paymentMethod === 'CASH' ? formatText('Tien mat') :
          orderData.paymentMethod === 'TRANSFER' ? formatText('Chuyen khoan') :
            orderData.paymentMethod === 'MOMO' ? 'MoMo' : formatText('Khac');
        doc.text(formatText("Phuong thuc:"), paymentTextX, rowY);
        doc.text(`${paymentMethodText}`, paymentValueX, rowY, { align: "right" });
        rowY += rowHeight;
  
        // Chi tiết thanh toán tiền mặt (nếu có)
        if (orderData.paymentMethod === 'CASH') {
          doc.text(formatText("Tien khach dua:"), paymentTextX, rowY);
          doc.text(`${currentTab.customerPayment.toLocaleString()}d`, paymentValueX, rowY, { align: "right" });
          rowY += rowHeight;
  
          doc.text(formatText("Tien thoi:"), paymentTextX, rowY);
          doc.text(`${currentTab.change.toLocaleString()}d`, paymentValueX, rowY, { align: "right" });
          rowY += rowHeight;
        }
  
        // Footer
        const footerY = Math.max(rowY + 15, pageHeight - bottomMargin);
  
        doc.setDrawColor(176, 0, 109);
        doc.setLineWidth(0.3);
        doc.line(20, footerY - 12, pageWidth - 20, footerY - 12);
  
        doc.setFontSize(9);
        doc.setFont(primaryFont, "italic");
        doc.setTextColor(120, 120, 120);
        doc.text(formatText(`Hoa don duoc xuat ngay ${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')} luc ${new Date().toLocaleTimeString('vi-VN')}`), 20, footerY - 5);
  
        doc.setFontSize(11);
        doc.setFont(primaryFont, "bold");
        doc.setTextColor(176, 0, 109);
        doc.text(formatText("Cam on quy khach da mua hang tai PETCARE!"), pageWidth / 2, footerY + 5, { align: "center" });
  
        doc.setFontSize(9);
        doc.setFont(primaryFont, "italic");
        doc.setTextColor(120, 120, 120);
        doc.text(formatText("Chuc quy khach va thu cung mot ngay tot lanh!"), pageWidth / 2, footerY + 12, { align: "center" });
  
        // Lưu file PDF
        try {
          doc.save(`hoa-don-${response.orderId}.pdf`);
          setLastInvoiceId(response.orderId);
          setShowInvoiceModal(true);
          toast.success("Hóa đơn đã được xuất dưới dạng PDF!");
        } catch (saveError) {
          console.error("Lỗi khi lưu file PDF:", saveError);
          toast.error("Không thể lưu file PDF. Vui lòng thử lại.");
        }
      } catch (docError) {
        console.error("Lỗi khi khởi tạo tài liệu PDF:", docError);
        toast.error("Không thể tạo tài liệu PDF. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn PDF:", error);
      toast.error("Không thể xuất hóa đơn PDF. Vui lòng thử lại sau.");
    }
  };

  const handlePayment = async () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const totalAmount = Math.max(
      0,
      currentTab.products.reduce((sum, p) => sum + p.total, 0) -
      (currentTab.pointsToUse / 100 * 30000)
    );

    if (currentTab.paymentMethod === 'CASH' && currentTab.customerPayment < totalAmount) {
      toast.warn('Số tiền khách đưa không đủ để thanh toán!');
      return;
    }

    const orderData = {
      userId: staffId,
      items: currentTab.products.map((product) => ({
        productDetailId: product.id,
        quantity: product.quantity,
      })),
      paymentMethod: currentTab.paymentMethod,
      customerPhone: currentTab.customerPhone || null,
      customerName: currentTab.customerName || 'Khách lẻ',
      accumulatePoints: !!currentTab.customerPhone,
      pointsToUse: currentTab.pointsToUse,
      tabId: activeTab
    };

    try {
      let response;
      if (currentTab.pointsToUse > 0) {
        response = await applyDiscount(orderData);
      } else {
        response = await createOfflineOrder(orderData);
      }

      toast.success(
        `Thanh toán thành công!\nMã đơn:${response.orderId}\nTổng tiền: ${response.totalAmount.toLocaleString()}đ`
      );

      // Tạo và lưu file PDF hóa đơn
      generateInvoicePDF(orderData, response);

      setTabs(
        tabs.map((tab) =>
          tab.id === activeTab
            ? {
              ...tab,
              products: [],
              customerPayment: 0,
              inputPayment: '',
              change: 0,
              error: '',
              customerPhone: '',
              customerName: 'Khách lẻ',
              totalPoints: 0,
              pointsToUse: 0,
              paymentMethod: 'CASH'
            }
            : tab
        )
      );

      const updatedProducts = await getAllProductDetails();
      setProductsFromApi(updatedProducts);

      await fetchOfflineCartDetails(staffId, activeTab);
    } catch (error) {
      console.error('Lỗi thanh toán:', error.response ? error.response.data : error.message);
      toast.error(
        'Thanh toán thất bại: ' +
        (error.response?.data?.message || error.message || 'Lỗi không xác định')
      );
    }
  };

  const handlePointsToUseChange = (value) => {
    const points = parseInt(value) || 0;
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        const maxUsablePoints = Math.floor(tab.totalPoints / 100) * 100; // Chỉ dùng bội số của 100
        const pointsToUse = Math.min(points, maxUsablePoints);
        return { ...tab, pointsToUse: pointsToUse >= 100 ? pointsToUse : 0 };
      }
      return tab;
    }));
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (staffId) fetchOfflineCartDetails(staffId, tabId);
  };

  const handleIncrement = async (productId) => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const product = currentTab.products.find(p => p.id === productId);
    const productInStock = productsFromApi.find(p => p.productDetailId === productId);
    const stockQuantity = productInStock?.quantity || 0;
    const newQuantity = product.quantity + 1;

    if (newQuantity > stockQuantity) {
      toast.error(`Số lượng vượt quá tồn kho (${stockQuantity})!`);
      return;
    }

    try {
      await addProductToOfflineCart(staffId, productId, 1, activeTab);
      setTabs(tabs.map(tab =>
        tab.id === activeTab
          ? {
            ...tab,
            products: tab.products.map(p =>
              p.id === productId ? { ...p, quantity: newQuantity, total: p.price * newQuantity } : p
            )
          }
          : tab
      ));
    } catch (error) {
      toast.error('Không thể tăng số lượng: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleDecrement = async (productId) => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const product = currentTab.products.find(p => p.id === productId);

    if (product.quantity <= 1) return;

    try {
      await addProductToOfflineCart(staffId, productId, -1, activeTab);
      setTabs(tabs.map(tab =>
        tab.id === activeTab
          ? {
            ...tab,
            products: tab.products.map(p =>
              p.id === productId ? { ...p, quantity: p.quantity - 1, total: p.price * (p.quantity - 1) } : p
            )
          }
          : tab
      ));
    } catch (error) {
      toast.error('Không thể giảm số lượng: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleDelete = (productId) => {
    handleAddProduct(productsFromApi.find(p => p.productDetailId === productId));
  };

  const handleQuickAmount = (amount) => {
    const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000));

    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        const change = amount >= totalAmount ? amount - totalAmount : 0;
        const error = amount < totalAmount ? 'Số tiền khách đưa không đủ!' : '';
        return {
          ...tab,
          customerPayment: amount,
          inputPayment: amount.toString(),
          change,
          error
        };
      }
      return tab;
    }));
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const amount = parseInt(value) || 0;
    const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000));

    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        const change = amount >= totalAmount ? amount - totalAmount : 0;
        const error = amount < totalAmount && value.length > 0 ? 'Số tiền khách đưa không đủ!' : '';
        return {
          ...tab,
          inputPayment: value,
          customerPayment: amount,
          change,
          error
        };
      }
      return tab;
    }));
  };

  const handlePhoneChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTab) {
          const updatedTab = { ...tab, customerPhone: value };
          if (value.length === 10) {
            getPointsByPhone(value)
              .then((pointInfo) => {
                setTabs((tabs) =>
                  tabs.map((t) =>
                    t.id === activeTab
                      ? {
                        ...t,
                        customerName: pointInfo.name || 'Khách lẻ',
                        totalPoints: pointInfo.totalPoints || 0,
                        accumulatePoints: true,
                      }
                      : t
                  )
                );
              })
              .catch((error) => {
                console.error('Không thể lấy thông tin khách hàng:', error);
                setTabs((tabs) =>
                  tabs.map((t) =>
                    t.id === activeTab
                      ? { ...t, customerName: 'Khách lẻ', totalPoints: 0, accumulatePoints: false, pointsToUse: 0 }
                      : t
                  )
                );
              });
          } else {
            updatedTab.customerName = 'Khách lẻ';
            updatedTab.totalPoints = 0;
            updatedTab.accumulatePoints = false;
            updatedTab.pointsToUse = 0;
          }
          return updatedTab;
        }
        return tab;
      })
    );
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        return { ...tab, customerName: value };
      }
      return tab;
    }));
  };

  const handleReload = () => {
    window.location.reload();
  };

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];
  const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000));
  const paymentCode = `PETCARE-${currentTab.id}-${new Date().getTime().toString().slice(-6)}`;

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#e59f1e] p-1 sm:p-2 fixed top-0 left-0 right-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút quay lại trang admin */}
          <button
            onClick={handleBackToAdmin}
            className="text-white hover:text-gray-200 transition-colors duration-200"
            title="Quay lại trang admin"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Tabs hóa đơn */}
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center bg-[#d18e17] text-white px-2 sm:px-3 py-1 rounded-t border-b-2 
                      ${activeTab === tab.id ? 'border-white' : 'border-transparent hover:border-white'} 
                      cursor-pointer min-w-max mr-2`}
              >
                <span className="text-xs sm:text-sm">{tab.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Thông tin nhân viên */}
          {isAuthenticated && (
            <div className="text-white text-xs sm:text-sm">
              <span>Nhân viên: {staffName}</span>
            </div>
          )}

          {/* Nút reload */}
          <button
            onClick={handleReload}
            className="text-white hover:text-gray-200 transition-colors duration-200"
            title="Load lại trang"
          >
            <IoRefresh size={20} />
          </button>
        </div>
      </header>

      {currentTab && (
        <div className="flex flex-1 min-h-0 pt-10">
          <div className="w-2/3 p-1 sm:p-2 border-r overflow-hidden flex flex-col relative">
            <div className="mb-2 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#e59f1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Giỏ hàng
                </h3>
                <button
                  className="bg-[#e59f1e] text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-[#d18e17] transition-all duration-200 shadow-sm flex items-center"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Thêm sản phẩm
                </button>
              </div>
              {currentTab.products.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm p-4 border border-[#e59f1e]/20">
                  <svg
                    className="w-16 h-16 mb-4 text-[#e59f1e]/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 3h18l-2 13H5L3 3zm0 0l2 13m4-5h6m-6 4h6"
                    />
                  </svg>
                  <h4 className="text-base font-bold text-gray-800 mb-1">Chưa có sản phẩm nào</h4>
                  <p className="text-xs text-gray-600 text-center max-w-xs">
                    Thêm sản phẩm vào giỏ để bắt đầu tạo hóa đơn bán hàng nhé!
                  </p>
                  <button
                    className="mt-4 bg-[#e59f1e] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#d18e17] transition-all duration-200 flex items-center"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Thêm sản phẩm ngay
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-[#e59f1e]/20 h-[calc(100vh-130px)] overflow-hidden flex flex-col">
                  <table className="w-full">
                    <thead className="bg-[#e59f1e] text-white sticky top-0 z-10">
                      <tr>
                        <th className="p-1 text-left text-[10px] sm:text-xs font-semibold">STT</th>
                        <th className="p-1 text-left text-[10px] sm:text-xs font-semibold">Ảnh</th>
                        <th className="p-1 text-left text-[10px] sm:text-xs font-semibold">Tên SP</th>
                        <th className="p-1 text-left text-[10px] sm:text-xs font-semibold">Biến thể</th>
                        <th className="p-1 text-center text-[10px] sm:text-xs font-semibold">SL</th>
                        <th className="p-1 text-right text-[10px] sm:text-xs font-semibold">Giá</th>
                        <th className="p-1 text-right text-[10px] sm:text-xs font-semibold">T.Tiền</th>
                        <th className="p-1"></th>
                      </tr>
                    </thead>
                  </table>

                  <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh-180px)' }}>
                    <table className="w-full">
                      <tbody>
                        {currentTab.products.map((product, index) => (
                          <tr key={product.id} className="border-b hover:bg-orange-50 transition-colors duration-100">
                            <td className="p-1 text-[10px] sm:text-xs text-gray-700 w-8">{index + 1}</td>
                            <td className="p-1 text-[10px] sm:text-xs w-12">
                              <img
                                src={product.image || '/images/default-image.jpg'}
                                alt={product.name || 'Sản phẩm'}
                                className="w-8 h-8 object-cover rounded-md shadow-sm border border-gray-200"
                              />
                            </td>
                            <td className="p-1 text-[10px] sm:text-xs font-medium text-gray-800">{product.name}</td>
                            <td className="p-1 text-[10px] sm:text-xs text-gray-600">
                              {product.variant.replace(/\|/g, '•').replace(/N\/A/g, '').replace(/\s+•\s+/g, ' • ').replace(/^\s+•\s+|\s+•\s+$/g, '')}
                            </td>
                            <td className="p-1 text-center w-12">
                              <div className="flex items-center justify-center gap-0.5">
                                <button
                                  onClick={() => handleDecrement(product.id)}
                                  className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-[#e59f1e]/20 rounded-full transition-colors duration-200 disabled:opacity-50"
                                  disabled={product.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="w-4 text-center text-[10px] sm:text-xs font-medium text-gray-800">{product.quantity}</span>
                                <button
                                  onClick={() => handleIncrement(product.id)}
                                  className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-[#e59f1e]/20 rounded-full transition-colors duration-200"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-1 text-right text-[10px] sm:text-xs text-gray-800 w-16">{product.price.toLocaleString()}đ</td>
                            <td className="p-1 text-right text-[10px] sm:text-xs text-gray-800 font-medium w-20">{product.total.toLocaleString()}đ</td>
                            <td className="p-1 text-center w-8">
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-gray-400 hover:text-[#e59f1e] hover:bg-[#e59f1e]/10 transition-colors duration-200 rounded-full w-5 h-5 flex items-center justify-center"
                              >
                                <IoClose size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gray-50 p-1.5 text-[10px] sm:text-xs text-gray-600 border-t flex justify-between items-center sticky bottom-0 left-0 right-0">
                    <span>Tổng số: <span className="font-medium">{currentTab.products.length}</span> sản phẩm</span>
                    <span>Tổng tiền: <span className="font-medium text-[#e59f1e]">{currentTab.products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}đ</span></span>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`fixed top-10 left-0 h-[calc(100vh-2.5rem)] w-2/3 bg-white shadow-xl z-10 transform transition-transform duration-300 ease-in-out
                ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="p-2 h-full flex flex-col">
                <div className="flex justify-between items-center mb-2 border-b pb-2">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-[#e59f1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    Danh sách sản phẩm
                  </h3>
                  <button
                    className="text-gray-500 hover:text-[#e59f1e] bg-gray-100 rounded-full p-1"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <IoClose size={16} />
                  </button>
                </div>
                <div className="overflow-hidden flex-1">
                  <ProductLists
                    products={productsFromApi}
                    handleAddProduct={handleAddProduct}
                    selectedProducts={currentTab.products}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-1/3 p-1 bg-gray-100 flex flex-col h-full min-h-0">
            <div className="flex flex-col h-full space-y-1">
              {/* Thông tin khách hàng */}
              <div className="bg-white rounded-lg shadow p-2 flex flex-col" style={{ height: '170px' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-xs text-gray-800">Thông tin khách hàng</span>
                  <span className="text-[10px] text-gray-500">{new Date().toLocaleString('vi-VN')}</span>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={currentTab.customerPhone}
                      onChange={handlePhoneChange}
                      placeholder="Số ĐT khách hàng"
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#e59f1e] text-xs"
                      maxLength="10"
                    />
                    {currentTab.customerPhone && (
                      <button
                        onClick={() => setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, customerPhone: '', totalPoints: 0, pointsToUse: 0 } : tab))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e59f1e]"
                      >
                        <IoClose size={14} />
                      </button>
                    )}
                  </div>

                  {/* Hiển thị tên khách hàng ngay dưới input */}
                  <div className="text-xs text-gray-700 min-h-[14px]">
                    {currentTab.customerPhone.length === 10 && currentTab.customerName !== 'Khách lẻ' ? (
                      <>Tên: <span className="font-medium">{currentTab.customerName}</span></>
                    ) : (
                      currentTab.customerPhone ?
                        <span className="text-gray-500 italic">Nhập đủ 10 số để tìm thông tin khách hàng</span> :
                        <span className="text-gray-500 italic">Nhập số điện thoại để tìm khách hàng</span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={currentTab.customerName}
                      onChange={handleNameChange}
                      placeholder={currentTab.customerPhone ? "Tên khách hàng" : "Khách lẻ (không cần nhập số ĐT)"}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#e59f1e] text-xs"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {currentTab.customerPhone && currentTab.totalPoints >= 100 && (
                      <div className="flex-1 min-w-[180px]">
                        <select
                          value={currentTab.pointsToUse}
                          onChange={(e) => handlePointsToUseChange(e.target.value)}
                          className="w-full px-1 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#e59f1e] text-xs"
                        >
                          <option value={0}>Không dùng điểm</option>
                          {Array.from({ length: Math.floor(currentTab.totalPoints / 100) }, (_, i) => (i + 1) * 100).map(points => (
                            <option key={points} value={points}>
                              {points} điểm (-{(points / 100 * 30000).toLocaleString()}đ)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {currentTab.customerPhone && currentTab.totalPoints > 0 ? (
                      <div className="text-xs text-[#e59f1e] font-medium whitespace-nowrap">
                        Điểm tích lũy: {currentTab.totalPoints}
                      </div>
                    ) : currentTab.customerPhone && currentTab.customerPhone.length === 10 ? (
                      <div className="text-xs text-gray-500 italic whitespace-nowrap">
                        Chưa có điểm tích lũy
                      </div>
                    ) : (
                      !currentTab.customerPhone &&
                      <div className="text-xs text-gray-500 italic">
                        Nhập SĐT để sử dụng/tích điểm
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tóm tắt đơn hàng */}
              <div className="bg-white rounded-lg shadow p-2 flex flex-col" style={{ height: '100px' }}>
                <h3 className="text-xs font-semibold mb-1 text-gray-800">Tóm tắt đơn hàng</h3>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tổng tiền hàng</span>
                    <span className="font-medium">{currentTab.products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="font-medium">{(currentTab.pointsToUse / 100 * 30000).toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#e59f1e] border-t pt-1 mt-1 text-xs">
                    <span>Khách cần trả</span>
                    <span>{Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000)).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              {/* Thanh toán */}
              <div className="bg-white rounded-lg shadow p-2 flex-1 flex flex-col h-[calc(100vh-300px)]">
                <h3 className="text-xs font-semibold mb-1 text-gray-800">Thanh toán</h3>

                {/* Phương thức thanh toán */}
                <div className="mb-1">
                  <div className="flex gap-0.5">
                    {[
                      { value: "CASH", label: "Tiền mặt" },
                      { value: "MOMO", label: "MoMo" },
                    ].map(method => (
                      <button
                        key={method.value}
                        className={`px-1 py-1 rounded text-xs font-medium flex-1 ${currentTab.paymentMethod === method.value ? 'bg-[#e59f1e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-[#e59f1e]/20'}`}
                        onClick={() => handlePaymentMethodChange(method.value)}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chi tiết thanh toán */}
                <div className="flex-1 overflow-hidden mb-1">
                  {/* CASH Payment Method */}
                  {currentTab.paymentMethod === 'CASH' && (
                    <div className="space-y-1 h-full">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-700">Tổng cần trả:</span>
                          <span className="text-xs font-bold text-[#e59f1e]">
                            {Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000)).toLocaleString()}đ
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <input
                            type="text"
                            value={currentTab.inputPayment}
                            onChange={handleInputChange}
                            placeholder="Số tiền khách đưa"
                            className={`flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#e59f1e] text-xs ${currentTab.error ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {currentTab.error && <p className="text-red-500 text-[10px] mt-0.5">{currentTab.error}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Chọn nhanh</label>
                        <div className="grid grid-cols-3 gap-0.5">
                          {[50000, 100000, 200000, 500000, 1000000].map(amount => (
                            <button
                              key={amount}
                              className={`py-1 border rounded text-[10px] transition-colors ${currentTab.customerPayment === amount ? 'bg-[#e59f1e] text-white' : 'bg-gray-100 hover:bg-[#e59f1e]/20'}`}
                              onClick={() => handleQuickAmount(amount)}
                            >
                              {amount.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TRANSFER Payment Method */}
                  {/* MOMO Payment Method */}
                  {currentTab.paymentMethod === 'MOMO' && (
                    <div className="p-1 border rounded bg-gray-50 flex flex-col items-center h-full">
                      <h3 className="text-xs font-semibold text-gray-700 mb-0.5 flex items-center justify-center">
                        <span className="mr-0.5">Thanh toán MoMo</span>
                        <div className="w-3 h-3 rounded-full bg-[#b0006d] flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">M</span>
                        </div>
                      </h3>

                      <div className="text-[10px] text-center mb-0.5">
                        <p className="font-medium">Số tiền: <span className="text-[#b0006d] font-bold">{Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 100 * 30000)).toLocaleString()}đ</span></p>
                      </div>

                      <div className="flex justify-center mb-0.5">
                        <div className="p-0.5 border-2 border-[#b0006d] rounded-lg bg-white">
                          {momoQrString ? (
                            <img
                              src={momoQrString}
                              alt="MoMo QR Code for Payment"
                              className="w-24 h-24 object-contain"
                              onError={(e) => {
                                console.error("QR Code image failed to load");
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmaWxsPSIjYjAwMDZkIj5UcmFuZyB0aOG6uyBNb01vPC90ZXh0Pjwvc3ZnPg==';
                                e.target.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="w-24 h-24 flex items-center justify-center bg-gray-100">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#b0006d] mx-auto mb-0.5"></div>
                                <p className="text-gray-500 text-[10px]">Đang tải...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-center text-gray-600">
                        <p>Nội dung: PETCARE {currentTab.id}-{new Date().getTime().toString().slice(-6)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tiền thối và nút thanh toán */}
                <div className="mt-auto">
                  {currentTab.paymentMethod === 'CASH' && currentTab.change > 0 && (
                    <div className="mb-1 bg-[#e59f1e]/10 p-1 rounded">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#e59f1e] font-medium">Tiền thối</span>
                        <span className="text-[#e59f1e] font-bold">{currentTab.change.toLocaleString()}đ</span>
                      </div>
                    </div>
                  )}

                  <button
                    className={`w-full py-1.5 rounded text-xs font-semibold text-white ${isPaymentDisabled(currentTab) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#e59f1e] hover:bg-[#d18e17]'}`}
                    disabled={isPaymentDisabled(currentTab)}
                    onClick={handlePayment}
                  >
                    THANH TOÁN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMomoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-lg p-4 max-w-sm w-full animate-fadeIn my-4 mx-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-gray-800 flex items-center">
                <div className="w-6 h-6 rounded-full bg-[#b0006d] flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                Thanh toán MoMo
              </h3>
              <button
                onClick={() => setShowMomoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="text-center mb-2">
              <p className="text-sm font-medium mb-1">Số tiền thanh toán:</p>
              <p className="text-lg font-bold text-[#b0006d]">{totalAmount.toLocaleString()}đ</p>
            </div>

            <div className="flex justify-center mb-3">
              <div className="p-2 border-2 border-[#b0006d] rounded-lg bg-white">
                {momoQrString ? (
                  <img
                    src={momoQrString}
                    alt="MoMo QR Code for Payment"
                    className="w-48 h-48 object-contain"
                    onError={(e) => {
                      console.error("QR Code image failed to load");
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCBzYW5zLXNlcmlmIiBmaWxsPSIjYjAwMDZkIj5UcmFuZyB0aOG6uyBNb01vPC90ZXh0Pjwvc3ZnPg==';
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#b0006d] mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Đang tải mã QR...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-2 rounded-lg mb-3 text-xs">
              <p className="text-center text-gray-700 mb-1 font-medium">Thông tin thanh toán:</p>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{momoTransactionId || paymentCode}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Cửa hàng:</span>
                <span className="font-medium">PETCARE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium text-[#b0006d]">{totalAmount.toLocaleString()}đ</span>
              </div>
            </div>

            <div className="bg-[#b0006d]/10 p-2 rounded-lg mb-3 max-h-32 overflow-y-auto">
              <p className="text-xs text-center text-gray-700 font-medium mb-1">Hướng dẫn thanh toán:</p>
              <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
                <li>Mở ứng dụng MoMo trên điện thoại</li>
                <li>Chọn "Quét mã" từ màn hình chính</li>
                <li>Quét mã QR để thanh toán</li>
                <li>Nhập số tiền đúng với đơn hàng</li>
                <li>Hoàn tất thanh toán trên ứng dụng MoMo</li>
                <li>Nhấn "Đã thanh toán" sau khi hoàn tất</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowMomoModal(false);
                  handlePayment();
                }}
                className="w-full py-2 bg-[#b0006d] text-white rounded-lg font-medium hover:bg-[#900057] text-sm"
              >
                Đã thanh toán
              </button>

              <button
                onClick={() => setShowMomoModal(false)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 text-sm"
              >
                Huỷ thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thêm modal thông báo hóa đơn */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Hóa đơn đã được tạo</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <IoCheckmark className="text-green-500 w-10 h-10" />
                </div>
              </div>
              <p className="text-center text-gray-700 mb-1">
                Hóa đơn đã được xuất thành công dưới dạng PDF!
              </p>
              <p className="text-center text-gray-500 text-sm">
                Mã hóa đơn: <span className="font-semibold">{lastInvoiceId}</span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default OrderOffline;

<style jsx>{`
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }  
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }  
`}</style>
