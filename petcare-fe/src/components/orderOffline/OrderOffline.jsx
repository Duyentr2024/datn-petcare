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

  if (currentTab.products.length === 0) {
    return true; // Vô hiệu hóa nếu không có sản phẩm
  }

  if (currentTab.paymentMethod === 'TRANSFER') {
    return false; // Luôn cho phép thanh toán nếu là chuyển khoản
  }

  if (currentTab.paymentMethod === 'CASH') {
    if (totalAmount === 0) {
      return false; // Cho phép thanh toán nếu tổng tiền là 0
    }
    return currentTab.customerPayment < totalAmount; // Kiểm tra số tiền nếu là tiền mặt
  }

  return true; // Mặc định vô hiệu hóa nếu không có phương thức
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

  // Khi component mount, xác thực nhân viên và lấy giỏ hàng offline
  useEffect(() => {
    const token = cookies.accessToken;
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setStaffId(decoded.userId);
        setStaffName(decoded.fullName || "Nhân viên");
        setIsAuthenticated(true);
        fetchOfflineCartDetails(decoded.userId); // Lấy giỏ hàng offline
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [cookies.accessToken, navigate]);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProductDetails();
        setProductsFromApi(data);
      } catch (error) {
        console.error('Không thể tải sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);

  // Hàm lấy chi tiết giỏ hàng offline từ backend
  const fetchOfflineCartDetails = async (userId) => {
    try {
      const cartDetails = await getOfflineCartDetails(userId);
      const cartProducts = cartDetails.map(cart => ({
        id: cart.productDetails.productDetailId,
        name: cart.productDetails.products.productName,
        variant: `${cart.productDetails.productSizes?.sizeValue || 'N/A'} | ${cart.productDetails.weights?.weightValue || 'N/A'}kg | ${cart.productDetails.productColors?.colorValue || 'N/A'}`,
        quantity: cart.quantityItem,
        price: cart.productDetails.price,
        total: cart.quantityItem * cart.productDetails.price,
        image: cart.productDetails.products?.image || '/images/default-image.jpg'
      }));
      setTabs(tabs.map(tab =>
        tab.id === activeTab ? { ...tab, products: cartProducts } : tab
      ));
    } catch (error) {
      toast.error('Không thể lấy giỏ hàng offline');
    }
  };

  // Component ProductLists (giữ nguyên từ code của bạn, chỉ thêm logic chọn sản phẩm)
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
        <div className="flex items-center bg-white w-[500px] rounded px-1 sm:px-2 py-1 mb-4">
          <IoSearchOutline className="text-gray-500 text-sm sm:text-base" />
          <input
            type="text"
            placeholder="Tìm hàng hóa"
            className="px-1 sm:px-2 outline-none sm:w-auto text-sm sm:text-base"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-auto" style={{ maxHeight: '500px' }}>
          <table className="w-full">
            <thead className="bg-gray-200 sticky top-0">
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
                  className={`border-b hover:bg-gray-100 cursor-pointer ${selectedProducts.some(p => p.id === product.productDetailId) ? 'bg-green-50' : ''}`}
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
                      <IoCheckmark className="text-green-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="px-3 py-1 mx-1 text-sm bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Trước
          </button>
          <span className="px-3 py-1 text-sm">{currentPage} / {totalPages}</span>
          <button
            className="px-3 py-1 mx-1 text-sm bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Sau
          </button>
        </div>
      </>
    );
  };

  // Xử lý thêm/xóa sản phẩm vào giỏ hàng offline
  const handleAddProduct = async (product) => {
    const userId = staffId;
    const productDetailId = product.productDetailId;
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const existingProduct = currentTab.products.find(p => p.id === productDetailId);

    try {
      if (existingProduct) {
        // Xóa sản phẩm khỏi giỏ hàng offline
        await removeProductFromOfflineCart(userId, productDetailId);
        setTabs(tabs.map(tab =>
          tab.id === activeTab
            ? { ...tab, products: tab.products.filter(p => p.id !== productDetailId) }
            : tab
        ));
      } else {
        // Thêm sản phẩm vào giỏ hàng offline
        if (product.quantity < 1) {
          toast.error(`Sản phẩm "${product.products.productName}" đã hết hàng!`);
          return;
        }
        await addProductToOfflineCart(userId, productDetailId, 1);
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
        // toast.success(`Đã thêm ${product.products.productName} vào giỏ hàng offline`); // Xóa dòng này
      }
    } catch (error) {
      toast.error('Không thể cập nhật giỏ hàng offline');
    }
  };

  const handlePaymentMethodChange = (method) => {
    setTabs(tabs.map(tab =>
      tab.id === activeTab ? { ...tab, paymentMethod: method } : tab
    ));
  };

  // Xử lý thanh toán
  const handlePayment = async () => {
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
      customerName: currentTab.customerName || 'Khách vãng lai',
      accumulatePoints: !!currentTab.customerPhone,
      pointsToUse: currentTab.pointsToUse,
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
              customerName: 'Khách vãng lai',
              totalPoints: 0,
              pointsToUse: 0,
              paymentMethod: 'CASH' // Đặt lại về mặc định sau khi thanh toán
            }
            : tab
        )
      );

      const updatedProducts = await getAllProductDetails();
      setProductsFromApi(updatedProducts);
    } catch (error) {
      console.error('Lỗi thanh toán:', error.response ? error.response.data : error.message);
      toast.error(
        'Thanh toán thất bại: ' +
        (error.response?.data?.message || error.message || 'Lỗi không xác định')
      );
    }
  };

  // Các hàm khác (giữ nguyên từ code của bạn)
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

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

  const handleTabChange = (tabId) => setActiveTab(tabId);

  const addNewTab = () => {
    const newTab = {
      id: tabs.length ? Math.max(...tabs.map(tab => tab.id)) + 1 : 1,
      title: `Hóa đơn ${tabs.length + 1}`,
      products: [],
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      error: '',
      customerPhone: '',
      customerName: 'Khách vãng lai',
      accumulatePoints: false,
      totalPoints: 0,
      pointsToUse: 0
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) setActiveTab(newTabs[newTabs.length - 1].id);
  };

  const handleIncrement = (productId) => {
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        const updatedProducts = tab.products.map(product => {
          if (product.id === productId) {
            const productInStock = productsFromApi.find(p => p.productDetailId === productId);
            const stockQuantity = productInStock?.quantity || 0;
            const newQuantity = product.quantity + 1;

            if (newQuantity > stockQuantity) {
              toast.error(`Số lượng vượt quá tồn kho (${stockQuantity})!`);
              return product;
            }

            return { ...product, quantity: newQuantity, total: product.price * newQuantity };
          }
          return product;
        });
        return { ...tab, products: updatedProducts };
      }
      return tab;
    }));
  };

  const handleDecrement = (productId) => {
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        const updatedProducts = tab.products.map(product => {
          if (product.id === productId && product.quantity > 1) {
            const newQuantity = product.quantity - 1;
            return { ...product, quantity: newQuantity, total: product.price * newQuantity };
          }
          return product;
        });
        return { ...tab, products: updatedProducts };
      }
      return tab;
    }));
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
                        customerName: pointInfo.name || 'Khách vãng lai',
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
                      ? { ...t, customerName: 'Khách vãng lai', totalPoints: 0, accumulatePoints: false, pointsToUse: 0 }
                      : t
                  )
                );
              });
          } else {
            updatedTab.customerName = 'Khách vãng lai';
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

  const handleAccumulatePointsChange = (e) => {
    const checked = e.target.checked;
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        return { ...tab, accumulatePoints: checked };
      }
      return tab;
    }));
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#fbb321] p-1 sm:p-2 fixed top-0 left-0 right-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center bg-[#e59f1e] text-white px-2 sm:px-3 py-1 rounded-t border-b-2 
                            ${activeTab === tab.id ? 'border-white' : 'border-transparent hover:border-white'} 
                            cursor-pointer min-w-max`}
              >
                <span className="text-xs sm:text-sm">{tab.title}</span>
                <IoClose
                  className="ml-1 sm:ml-2 hover:bg-red-600 rounded text-sm sm:text-base"
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 ml-2">
            <button className="bg-[#e59f1e] text-white rounded p-1 text-sm sm:text-base">
              <span>◀</span>
            </button>
            <button
              className="bg-[#e59f1e] text-white rounded p-1 text-sm sm:text-base"
              onClick={addNewTab}
            >
              <span>+</span>
            </button>
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
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Giỏ hàng offline</h3>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Thêm sản phẩm
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="p-1 sm:p-2 text-left text-xs sm:text-sm">STT</th>
                    <th className="p-1 sm:p-2 text-left text-xs sm:text-sm">Ảnh</th>
                    <th className="p-1 sm:p-2 text-left text-xs sm:text-sm">Tên sản phẩm</th>
                    <th className="p-1 sm:p-2 text-left text-xs sm:text-sm">Biến thể</th>
                    <th className="p-1 sm:p-2 text-center text-xs sm:text-sm">SL</th>
                    <th className="p-1 sm:p-2 text-right text-xs sm:text-sm">Đơn giá</th>
                    <th className="p-1 sm:p-2 text-right text-xs sm:text-sm">Thành tiền</th>
                    <th className="p-1 sm:p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentTab.products.map((product, index) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-1 sm:p-2 text-xs sm:text-sm">{index + 1}</td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm">
                        <img
                          src={product.image || '/images/default-image.jpg'}
                          alt={product.name || 'Sản phẩm'}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm">{product.name}</td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm">{product.variant}</td>
                      <td className="p-1 sm:p-2">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleDecrement(product.id)}
                            className="px-1 sm:px-2 py-0.5 sm:py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm"
                            disabled={product.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{product.quantity}</span>
                          <button
                            onClick={() => handleIncrement(product.id)}
                            className="px-1 sm:px-2 py-0.5 sm:py-1 text-gray-600 hover:bg-gray-100 rounded text-xs sm:text-sm"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-1 sm:p-2 text-right text-xs sm:text-sm">{product.price.toLocaleString()}đ</td>
                      <td className="p-1 sm:p-2 text-right text-xs sm:text-sm">{product.total.toLocaleString()}đ</td>
                      <td className="p-1 sm:p-2 text-center">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-gray-500 hover:text-red-600 text-xs sm:text-base"
                        >
                          <IoClose />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className={`fixed top-12 left-0 h-[calc(100vh-3rem)] w-2/3 bg-white shadow-xl z-10 transform transition-transform duration-300 ease-in-out
                ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Danh sách sản phẩm</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
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
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  maxLength="10"
                />
                {currentTab.customerPhone && (
                  <button
                    onClick={() => setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, customerPhone: '', totalPoints: 0, pointsToUse: 0 } : tab))}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>

              {currentTab.customerPhone && currentTab.totalPoints >= 10 && (
                <div className="mb-1">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Dùng điểm tích lũy</label>
                  <select
                    value={currentTab.pointsToUse}
                    onChange={(e) => handlePointsToUseChange(e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
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
                <div className="text-xs text-green-600">Điểm tích lũy: {currentTab.totalPoints}</div>
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
                <div className="flex justify-between font-semibold text-green-600 border-t pt-0.5">
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
                      className={`px-2 py-1 rounded text-xs ${currentTab.paymentMethod === method.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                      <span className="text-xs font-bold text-green-600">
                        {Math.max(0, currentTab.products.reduce((sum, p) => sum + p.total, 0) - (currentTab.pointsToUse / 10 * 30000)).toLocaleString()}đ
                      </span>
                    </div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Số tiền khách đưa</label>
                    <input
                      type="text"
                      value={currentTab.inputPayment}
                      onChange={handleInputChange}
                      placeholder="Nhập số tiền"
                      className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ${currentTab.error ? 'border-red-500' : ''}`}
                    />
                    {currentTab.error && <p className="text-red-500 text-xs mt-1">{currentTab.error}</p>}
                  </div>

                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Chọn nhanh</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[50000, 100000, 200000, 500000, 1000000].map(amount => (
                        <button
                          key={amount}
                          className={`py-1 border rounded text-xs transition-colors ${currentTab.customerPayment === amount ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-blue-600 hover:text-white'}`}
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
                  <div className="mb-2 bg-blue-50 p-1 rounded">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700 font-medium">Tiền thối</span>
                      <span className="text-blue-700 font-bold">{currentTab.change.toLocaleString()}đ</span>
                    </div>
                  </div>
                )}

                <button
                  className={`w-full py-1.5 rounded text-sm font-semibold text-white ${isPaymentDisabled(currentTab) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
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