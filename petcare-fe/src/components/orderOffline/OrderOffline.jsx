import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoClose, IoCheckmark } from "react-icons/io5";
import { getAllProductDetails, createOfflineOrder, getPointsByPhone, applyDiscount, addProductToOfflineCart, removeProductFromOfflineCart, getOfflineCartDetails } from "../../service/orderOfflineService/OfflineService";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";
import { useCookies } from "react-cookie";
import { decodeToken } from "../utils/jwt";
import { useNavigate } from "react-router-dom";

const isPaymentDisabled = (currentTab) => {
  const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 10 * 30000));
  if (currentTab.products.length === 0) return true;
  if (currentTab.paymentMethod === 'TRANSFER') return false;
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

    const filteredProducts = products.filter(product =>
      product.products?.productName?.toLowerCase().includes(localSearchTerm.toLowerCase()) || false
    );

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
      <>
        <div className="flex items-center bg-white w-[500px] rounded px-1 sm:px-2 py-1 mb-4 border border-[#e59f1e]">
          <IoSearchOutline className="text-[#e59f1e] text-sm sm:text-base" />
          <input
            type="text"
            placeholder="Tìm hàng hóa"
            className="px-1 sm:px-2 outline-none sm:w-auto text-sm sm:text-base text-gray-700"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-auto" style={{ maxHeight: '500px' }}>
          <table className="w-full">
            <thead className="bg-[#e59f1e] text-white sticky top-0">
              <tr>
                <th className="p-1 text-left text-xs">STT</th>
                <th className="p-1 text-right text-xs">Ảnh</th>
                <th className="p-1 text-left text-xs">Tên sản phẩm</th>
                <th className="p-1 text-left text-xs">Biến thể</th>
                <th className="p-1 text-right text-xs">Giá</th>
                <th className="p-1 text-right text-xs">Tồn kho</th>
                <th className="p-1 text-right text-xs"></th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product, index) => (
                <tr
                  key={product.productDetailId}
                  className={`border-b hover:bg-orange-50 cursor-pointer ${selectedProducts.some(p => p.id === product.productDetailId) ? 'bg-orange-100' : ''}`}
                  onClick={() => handleAddProduct(product)}
                >
                  <td className="p-1 text-xs">{indexOfFirstProduct + index + 1}</td>
                  <td className="p-1 text-xs">
                    <img
                      src={product.products?.image || 'default-image.jpg'}
                      alt={product.products?.productName || 'Sản phẩm'}
                      className="w-8 h-8 object-cover rounded"
                    />
                  </td>
                  <td className="p-1 text-xs">{product.products?.productName || 'N/A'}</td>
                  <td className="p-1 text-xs">
                    {`${product.productSizes?.sizeValue || 'N/A'} | ${product.weights?.weightValue || 'N/A'}kg | ${product.productColors?.colorValue || 'N/A'}`}
                  </td>
                  <td className="p-1 text-right text-xs">{product.price?.toLocaleString() || '0'}đ</td>
                  <td className="p-1 text-right text-xs">{product.quantity || 0}</td>
                  <td className="p-1 text-right text-xs">
                    {selectedProducts.some(p => p.id === product.productDetailId) && (
                      <IoCheckmark className="text-[#e59f1e]" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="px-3 py-1 mx-1 text-sm bg-[#e59f1e] text-white rounded hover:bg-[#d18e17] disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Trước
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">{currentPage} / {totalPages}</span>
          <button
            className="px-3 py-1 mx-1 text-sm bg-[#e59f1e] text-white rounded hover:bg-[#d18e17] disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Sau
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
  };

  const handlePayment = async () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const totalAmount = Math.max(
      0,
      currentTab.products.reduce((sum, p) => sum + p.total, 0) -
      (currentTab.pointsToUse / 10) * 30000
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
        const maxUsablePoints = Math.floor(tab.totalPoints / 10) * 10;
        const pointsToUse = Math.min(points, maxUsablePoints);
        return { ...tab, pointsToUse: pointsToUse >= 10 ? pointsToUse : 0 };
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
    const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 10 * 30000));

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
    const totalAmount = Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 10 * 30000));

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

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#e59f1e] p-1 sm:p-2 fixed top-0 left-0 right-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-1 sm:gap-2">
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
        {isAuthenticated && (
          <div className="text-white text-sm mr-4">
            <span>Nhân viên: {staffName}</span>
          </div>
        )}
      </header>

      {currentTab && (
        <div className="flex flex-1 min-h-0 pt-12">
          <div className="w-2/3 p-2 sm:p-4 border-r overflow-auto flex flex-col relative">
            <div className="mb-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900">Giỏ hàng</h3>
                <button
                  className="bg-[#e59f1e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#d18e17] transition-all duration-200 shadow-sm"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Thêm sản phẩm
                </button>
              </div>
              {currentTab.products.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-sm p-8 border border-[#e59f1e]/20">
                  <svg
                    className="w-20 h-20 mb-6 text-[#e59f1e]"
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
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Chưa có sản phẩm nào</h4>
                  <p className="text-sm text-gray-600 text-center max-w-xs">
                    Thêm sản phẩm vào giỏ để bắt đầu tạo hóa đơn bán hàng nhé!
                  </p>
                  <button
                    className="mt-6 bg-[#e59f1e] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#d18e17] transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    Thêm sản phẩm ngay
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-[#e59f1e]/20">
                  <table className="w-full">
                    <thead className="bg-[#e59f1e] text-white">
                      <tr>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">STT</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Ảnh</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Tên sản phẩm</th>
                        <th className="p-2 sm:p-3 text-left text-xs sm:text-sm font-semibold">Biến thể</th>
                        <th className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold">SL</th>
                        <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Đơn giá</th>
                        <th className="p-2 sm:p-3 text-right text-xs sm:text-sm font-semibold">Thành tiền</th>
                        <th className="p-2 sm:p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTab.products.map((product, index) => (
                        <tr key={product.id} className="border-b hover:bg-orange-50 transition-colors duration-100">
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">{index + 1}</td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm">
                            <img
                              src={product.image || '/images/default-image.jpg'}
                              alt={product.name || 'Sản phẩm'}
                              className="w-12 h-12 object-cover rounded-md shadow-sm"
                            />
                          </td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-800">{product.name}</td>
                          <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600">{product.variant}</td>
                          <td className="p-2 sm:p-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDecrement(product.id)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-[#e59f1e]/20 rounded-full transition-colors duration-200 disabled:opacity-50"
                                disabled={product.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-gray-800">{product.quantity}</span>
                              <button
                                onClick={() => handleIncrement(product.id)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-[#e59f1e]/20 rounded-full transition-colors duration-200"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-2 sm:p-3 text-right text-xs sm:text-sm text-gray-800">{product.price.toLocaleString()}đ</td>
                          <td className="p-2 sm:p-3 text-right text-xs sm:text-sm text-gray-800 font-medium">{product.total.toLocaleString()}đ</td>
                          <td className="p-2 sm:p-3 text-center">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-gray-500 hover:text-[#e59f1e] transition-colors duration-200"
                            >
                              <IoClose size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              className={`fixed top-12 left-0 h-[calc(100vh-3rem)] w-2/3 bg-white shadow-xl z-10 transform transition-transform duration-300 ease-in-out
                ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Danh sách sản phẩm</h3>
                  <button
                    className="text-gray-500 hover:text-[#e59f1e]"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    <IoClose size={24} />
                  </button>
                </div>
                <div className="overflow-auto" style={{ height: 'calc(100vh - 150px)' }}>
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

          <div className="w-1/3 p-2 bg-gray-50 flex flex-col h-full">
            {/* Thông tin khách hàng */}
            <div className="bg-white rounded-lg shadow p-2 mb-2 flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-xs text-gray-800">Thông tin khách hàng</span>
                <span className="text-xs text-gray-500">{new Date().toLocaleString('vi-VN')}</span>
              </div>

              <div className="relative mb-1">
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
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e59f1e]"
                  >
                    <IoClose size={14} />
                  </button>
                )}
              </div>

              <div className="relative mb-1">
                <input
                  type="text"
                  value={currentTab.customerName}
                  onChange={handleNameChange}
                  placeholder="Tên khách hàng"
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#e59f1e] text-xs"
                />
              </div>

              {currentTab.customerPhone && currentTab.totalPoints >= 10 && (
                <div className="mb-1">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Dùng điểm tích lũy</label>
                  <select
                    value={currentTab.pointsToUse}
                    onChange={(e) => handlePointsToUseChange(e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#e59f1e] text-xs"
                  >
                    <option value={0}>Không sử dụng</option>
                    {Array.from({ length: Math.floor(currentTab.totalPoints / 10) }, (_, i) => (i + 1) * 10).map(points => (
                      <option key={points} value={points}>
                        {points} điểm (-{(points / 10 * 30000).toLocaleString()}đ)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {currentTab.customerPhone && (
                <div className="text-xs text-[#e59f1e]">Điểm tích lũy: {currentTab.totalPoints}</div>
              )}
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="bg-white rounded-lg shadow p-2 mb-2 flex flex-col">
              <h3 className="text-xs font-semibold mb-1 text-gray-800">Tóm tắt đơn hàng</h3>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền hàng</span>
                  <span>{currentTab.products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá</span>
                  <span>{(currentTab.pointsToUse / 10 * 30000).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between font-semibold text-[#e59f1e] border-t pt-0.5">
                  <span>Khách cần trả</span>
                  <span>{Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 10 * 30000)).toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="bg-white rounded-lg shadow p-3 flex-grow flex flex-col">
              <h3 className="text-sm font-bold mb-2 text-gray-800">Thanh toán</h3>
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                <div className="flex gap-1">
                  {[
                    { value: "CASH", label: "Tiền mặt" },
                    { value: "TRANSFER", label: "Chuyển khoản" },
                  ].map(method => (
                    <button
                      key={method.value}
                      className={`px-2 py-1 rounded text-xs ${currentTab.paymentMethod === method.value ? 'bg-[#e59f1e] text-white' : 'bg-gray-100 text-gray-700 hover:bg-[#e59f1e]/20'}`}
                      onClick={() => handlePaymentMethodChange(method.value)}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {currentTab.paymentMethod === 'CASH' && (
                <>
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-700">Tổng tiền cần trả:</span>
                      <span className="text-xs font-bold text-[#e59f1e]">
                        {Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 10 * 30000)).toLocaleString()}đ
                      </span>
                    </div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Số tiền khách đưa</label>
                    <input
                      type="text"
                      value={currentTab.inputPayment}
                      onChange={handleInputChange}
                      placeholder="Nhập số tiền"
                      className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-[#e59f1e] text-xs ${currentTab.error ? 'border-red-500' : ''}`}
                    />
                    {currentTab.error && <p className="text-red-500 text-xs mt-1">{currentTab.error}</p>}
                  </div>

                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Chọn nhanh</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[50000, 100000, 200000, 500000, 1000000].map(amount => (
                        <button
                          key={amount}
                          className={`py-1 border rounded text-xs transition-colors ${currentTab.customerPayment === amount ? 'bg-[#e59f1e] text-white' : 'bg-gray-100 hover:bg-[#e59f1e] hover:text-white'}`}
                          onClick={() => handleQuickAmount(amount)}
                        >
                          {amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col justify-end flex-grow">
                {currentTab.paymentMethod === 'CASH' && currentTab.change > 0 && (
                  <div className="mb-2 bg-[#e59f1e]/10 p-1 rounded">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#e59f1e] font-medium">Tiền thối</span>
                      <span className="text-[#e59f1e] font-bold">{currentTab.change.toLocaleString()}đ</span>
                    </div>
                  </div>
                )}

                <button
                  className={`w-full py-1.5 rounded text-sm font-semibold text-white ${isPaymentDisabled(currentTab) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#e59f1e] hover:bg-[#d18e17]'}`}
                  disabled={isPaymentDisabled(currentTab)}
                  onClick={handlePayment}
                >
                  THANH TOÁN
                </button>
              </div>
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
`}</style>