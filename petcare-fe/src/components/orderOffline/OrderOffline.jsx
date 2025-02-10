import { IoSearchOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import { useState } from "react";

const OrderOffline = () => {
  // State cho tabs
  const [tabs, setTabs] = useState([
    { 
      id: 1, 
      title: "Hóa đơn 1",
      products: [
        {
          id: 1,
          code: 'SP11122432',
          name: 'Cát nhật xanh 8l',
          quantity: 1,
          price: 45000,
          total: 45000
        }
      ],
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      error: ''
    },
    { 
      id: 2, 
      title: "Hóa đơn 2",
      products: [
        {
          id: 1,
          code: 'SP11122433',
          name: 'chó',
          quantity: 2,
          price: 38000,
          total: 76000
        },
        {
          id: 2,
          code: 'SP11122434',
          name: 'mèo',
          quantity: 1,
          price: 32000,
          total: 32000
        },
        {
          id: 3,
          code: 'SP11122435',
          name: 'hiếu minh',
          quantity: 3,
          price: 85000,
          total: 255000
        }
      ],
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      error: ''
    }
  ]);
  const [activeTab, setActiveTab] = useState(1);

  // Lấy thông tin của tab hiện tại
  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Hàm thêm tab mới
  const addNewTab = () => {
    const newTab = {
      id: tabs.length ? Math.max(...tabs.map(tab => tab.id)) + 1 : 1,
      title: `Hóa đơn ${tabs.length + 1}`,
      products: [], // Khởi tạo với mảng sản phẩm rỗng
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      error: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id); // Chuyển sang tab mới
  };

  // Hàm đóng tab
  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Giữ ít nhất 1 tab

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // Nếu đóng tab đang active, chuyển sang tab khác
    if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  // Các hàm xử lý cho tab hiện tại
  const handleIncrement = (productId) => {
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        const updatedProducts = tab.products.map(product => {
          if (product.id === productId) {
            const newQuantity = product.quantity + 1;
            return {
              ...product,
              quantity: newQuantity,
              total: product.price * newQuantity
            };
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
            return {
              ...product,
              quantity: newQuantity,
              total: product.price * newQuantity
            };
          }
          return product;
        });
        return { ...tab, products: updatedProducts };
      }
      return tab;
    }));
  };

  const handleDelete = (productId) => {
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        return {
          ...tab,
          products: tab.products.filter(product => product.id !== productId)
        };
      }
      return tab;
    }));
  };

  const handleQuickAmount = (amount) => {
    const totalAmount = currentTab.products.reduce((sum, p) => sum + p.total, 0);
    
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        return {
          ...tab,
          customerPayment: amount,
          error: amount < totalAmount ? 'Số tiền thanh toán không đủ' : '',
          change: amount >= totalAmount ? amount - totalAmount : 0
        };
      }
      return tab;
    }));
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const amount = parseInt(value) || 0;
    
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        return {
          ...tab,
          inputPayment: value,
          customerPayment: amount
        };
      }
      return tab;
    }));
    
    handleQuickAmount(amount);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header with tabs */}
      <div className="bg-[#fbb321] p-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded px-2 py-1">
            <IoSearchOutline className="text-gray-500" />
            <input
              type="text"
              placeholder="Tìm sản phẩm"
              className="px-2 outline-none"
            />
          </div>
          
          {/* Tabs */}
          <div className="flex">
            {tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center bg-[#e59f1e] text-white px-3 py-1 rounded-t border-b-2 
                  ${activeTab === tab.id ? 'border-white' : 'border-transparent hover:border-white'} 
                  cursor-pointer`}
              >
                <span className="text-sm">{tab.title}</span>
                <IoMdClose
                  className="ml-2 hover:bg-red-600 rounded"
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </div>
            ))}
          </div>
          
          {/* Right side buttons */}
          <div className="flex gap-1 ml-auto">
            <button className="bg-[#e59f1e] text-white rounded p-1">
              <span>◀</span>
            </button>
            <button 
              className="bg-[#e59f1e] text-white rounded p-1"
              onClick={addNewTab}
            >
              <span>+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content section - chỉ hiển thị nội dung của tab hiện tại */}
      {currentTab && (
        <div className="flex flex-1">
          {/* Left side - Product Table */}
          <div className="w-2/3 p-4 border-r">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="p-2 text-left">STT</th>
                  <th className="p-2 text-left">Mã SP</th>
                  <th className="p-2 text-left">Tên sản phẩm</th>
                  <th className="p-2 text-center">SL</th>
                  <th className="p-2 text-right">Đơn giá</th>
                  <th className="p-2 text-right">Thành tiền</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {currentTab.products.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{product.code}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleDecrement(product.id)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                          disabled={product.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{product.quantity}</span>
                        <button 
                          onClick={() => handleIncrement(product.id)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-2 text-right">{product.price.toLocaleString()}</td>
                    <td className="p-2 text-right">{product.total.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <IoMdClose />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Right side - Payment Info */}
        <div className="w-1/3 p-4">
          {/* Customer Info */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">Kim Thoa</div>
              <div className="text-sm text-gray-500">17/01/2025 07:14</div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm">Ngô Yến Nghi 0834304330</div>
              <button className="text-gray-500"><IoMdClose /></button>
            </div>
            <div className="text-sm text-green-600">Điểm: 3</div>
          </div>

            {/* Payment Summary */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tổng tiền hàng</span>
                <span>{currentTab.products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Khách cần trả</span>
                <span>{currentTab.products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Khách thanh toán</span>
                <span className={currentTab.error ? 'text-red-600' : ''}>
                  {currentTab.customerPayment.toLocaleString()}
                </span>
              </div>
              {currentTab.error && (
                <div className="text-red-600 text-sm">
                  {currentTab.error}
                </div>
              )}
              {currentTab.change > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Tiền thối</span>
                  <span>{currentTab.change.toLocaleString()}</span>
                </div>
              )}
            </div>

          {/* Payment Methods */}
          <div className="mt-4">
            <div className="flex gap-2 mb-4">
              <label className="flex items-center">
                <input type="radio" name="payment" className="mr-2" checked />
                <span>Tiền mặt</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" className="mr-2" />
                <span>Chuyển khoản</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" className="mr-2" />
                <span>Thẻ</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" className="mr-2" />
                <span>Ví</span>
              </label>
              <button className="text-gray-500">
                <IoEllipsisVerticalSharp />
              </button>
            </div>

              {/* Input Payment */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={currentTab.inputPayment}
                    onChange={handleInputChange}
                    placeholder="Nhập số tiền khách đưa"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                  />
                  {currentTab.inputPayment && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      {parseInt(currentTab.inputPayment).toLocaleString()}đ
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[50000, 100000, 200000, 500000, 600000, 700000, 800000, 900000, 1000000].map((amount) => (
                  <button 
                    key={amount}
                    className={`px-3 py-2 border rounded-md hover:bg-gray-50 
                      ${currentTab.customerPayment === amount ? 
                        amount < currentTab.products.reduce((sum, p) => sum + p.total, 0) ? 
                          'bg-red-50 border-red-500' : 
                          'bg-blue-50 border-blue-500' 
                        : ''
                      }`}
                    onClick={() => {
                      handleQuickAmount(amount);
                      setTabs(tabs.map(tab => {
                        if (tab.id === activeTab) {
                          return {
                            ...tab,
                            inputPayment: amount.toString(),
                            customerPayment: amount
                          };
                        }
                        return tab;
                      }));
                    }}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Payment Button */}
              <button 
                className={`w-full py-3 rounded-md ${
                  currentTab.error || currentTab.customerPayment < currentTab.products.reduce((sum, p) => sum + p.total, 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                disabled={currentTab.error || currentTab.customerPayment < currentTab.products.reduce((sum, p) => sum + p.total, 0)}
              >
                THANH TOÁN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderOffline;
