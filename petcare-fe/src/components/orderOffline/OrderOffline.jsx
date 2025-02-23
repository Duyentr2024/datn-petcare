import React, { useState } from 'react';
import { IoSearchOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { IoEllipsisVerticalSharp } from "react-icons/io5";

const OrderOffline = () => {
  const [tabs, setTabs] = useState([
    { 
      id: 1, 
      title: "Hóa đơn 1",
      products: [
        {
          id: 1,
          code: 'SP11122432',
          name: 'Cắt nhật xanh 8l',
          variant: 'Mặc định',
          variants: ['Mặc định', 'Loại 1', 'Loại 2'],
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
          name: 'Nước lau sàn',
          variant: 'Loại A',
          variants: ['Loại A', 'Loại B', 'Loại C'],
          quantity: 2,
          price: 38000,
          total: 76000
        },
        {
          id: 2,
          code: 'SP11122434',
          name: 'Nước rửa chén',
          variant: 'Mặc định',
          variants: ['Mặc định', 'Loại 1'],
          quantity: 1,
          price: 32000,
          total: 32000
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
  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];

  // Hàm chuyển tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const addNewTab = () => {
    const newTab = {
      id: tabs.length ? Math.max(...tabs.map(tab => tab.id)) + 1 : 1,
      title: `Hóa đơn ${tabs.length + 1}`,
      products: [],
      customerPayment: 0,
      inputPayment: '',
      change: 0,
      error: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

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
          inputPayment: amount.toString(),
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
    const totalAmount = currentTab.products.reduce((sum, p) => sum + p.total, 0);
    
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        return {
          ...tab,
          inputPayment: value,
          customerPayment: amount,
          error: amount < totalAmount ? 'Số tiền thanh toán không đủ' : '',
          change: amount >= totalAmount ? amount - totalAmount : 0
        };
      }
      return tab;
    }));
  };

  const handleVariantChange = (productId, newVariant) => {
    setTabs(tabs.map(tab => {
      if (tab.id === activeTab) {
        return {
          ...tab,
          products: tab.products.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                variant: newVariant
              };
            }
            return product;
          })
        };
      }
      return tab;
    }));
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-[#fbb321] p-1 sm:p-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center bg-white rounded px-1 sm:px-2 py-1">
            <IoSearchOutline className="text-gray-500 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Tìm hàng hóa"
              className="px-1 sm:px-2 outline-none w-24 sm:w-auto text-sm sm:text-base"
            />
          </div>
          
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
                <IoMdClose
                  className="ml-1 sm:ml-2 hover:bg-red-600 rounded text-sm sm:text-base"
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </div>
            ))}
          </div>
          
          <div className="flex gap-1 ml-auto">
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
      </div>

      {currentTab && (
        <div className="flex flex-1 min-h-0">
          <div className="w-2/3 p-2 sm:p-4 border-r overflow-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="p-1 sm:p-2 text-left text-xs sm:text-sm">STT</th>
                  <th className="p-1 sm:p-2 text-left text-xs sm:text-sm">Mã SP</th>
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
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">{product.code}</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">{product.name}</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">
                      <select
                        value={product.variant}
                        onChange={(e) => handleVariantChange(product.id, e.target.value)}
                        className="w-full border rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      >
                        {product.variants.map((variant) => (
                          <option key={variant} value={variant}>
                            {variant}
                          </option>
                        ))}
                      </select>
                    </td>
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
                    <td className="p-1 sm:p-2 text-right text-xs sm:text-sm">{product.price.toLocaleString()}</td>
                    <td className="p-1 sm:p-2 text-right text-xs sm:text-sm">{product.total.toLocaleString()}</td>
                    <td className="p-1 sm:p-2 text-center">
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-gray-500 hover:text-red-600 text-xs sm:text-base"
                      >
                        <IoMdClose />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-1/3 p-2 sm:p-4 overflow-auto">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-xs sm:text-sm">Kim Thoa</div>
                <div className="text-xs sm:text-sm text-gray-500">17/01/2025 07:14</div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs sm:text-sm">Ngô Yến Nghi 0834304330</div>
                <button className="text-gray-500"><IoMdClose /></button>
              </div>
              <div className="text-xs sm:text-sm text-green-600">Điểm: 3</div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Tổng tiền hàng</span>
                <span>{currentTab.products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Giảm giá</span>
                <span>0</span>
              </div>
              <div className="flex justify-between text-green-600 text-xs sm:text-sm">
                <span>Khách cần trả</span>
                <span>{currentTab.products.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Khách thanh toán</span>
                <span className={currentTab.error ? 'text-red-600' : ''}>
                  {currentTab.customerPayment.toLocaleString()}
                </span>
              </div>
              {currentTab.error && (
                <div className="text-red-600 text-xs sm:text-sm">
                  {currentTab.error}
                </div>
              )}
              {currentTab.change > 0 && (
                <div className="flex justify-between text-blue-600 text-xs sm:text-sm">
                  <span>Tiền thối</span>
                  <span>{currentTab.change.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex gap-2 mb-4">
                <label className="flex items-center">
                  <input type="radio" name="payment" className="mr-2" defaultChecked />
                  <span className="text-xs sm:text-sm">Tiền mặt</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="payment" className="mr-2" />
                  <span className="text-xs sm:text-sm">Chuyển khoản</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="payment" className="mr-2" />
                  <span className="text-xs sm:text-sm">Thẻ</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="payment" className="mr-2" />
                  <span className="text-xs sm:text-sm">Ví</span>
                </label>
                <button className="text-gray-500">
                  <IoEllipsisVerticalSharp />
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={currentTab.inputPayment}
                    onChange={handleInputChange}
                    placeholder="Nhập số tiền khách đưa"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
                  />
                  {currentTab.inputPayment && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500">
                      {parseInt(currentTab.inputPayment).toLocaleString()}đ
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 mb-4">
                {[45000, 46000, 50000, 60000, 100000, 200000, 500000].map((amount) => (
                  <button 
                    key={amount}
                    className={`px-2 sm:px-3 py-1 sm:py-2 border rounded-md hover:bg-gray-50 text-xs sm:text-sm
                      ${currentTab.customerPayment === amount ? 
                        amount < currentTab.products.reduce((sum, p) => sum + p.total, 0) ? 
                          'bg-red-50 border-red-500' : 
                          'bg-blue-50 border-blue-500' 
                        : ''
                      }`}
                    onClick={() => handleQuickAmount(amount)}
                  >
                    {amount.toLocaleString()}
                  </button>
                ))}
              </div>

              <button 
                className={`w-full py-2 sm:py-3 rounded-md text-xs sm:text-sm ${
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
