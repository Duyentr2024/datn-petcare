import { useState } from 'react';
import { FaPlus, FaTrash, FaFileInvoiceDollar, FaPrint, FaSave } from 'react-icons/fa';

const OfflineInvoice = () => {
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, price: 0, total: 0 }
  ]);

  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if quantity or price changes
          if (field === 'quantity' || field === 'price') {
            updatedItem.quantity = field === 'quantity' ? Number(value) : updatedItem.quantity;
            updatedItem.price = field === 'price' ? Number(value) : updatedItem.price;
            updatedItem.total = updatedItem.quantity * updatedItem.price;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id), 0) + 1;
    setItems([...items, { id: newId, name: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., save invoice to database)
    alert('Hóa đơn đã được tạo thành công!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FaFileInvoiceDollar className="text-[#fbb321] text-2xl mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Tạo hóa đơn offline</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên khách hàng
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={customer.name}
                onChange={handleCustomerChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
                placeholder="Nhập tên khách hàng"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={customer.phone}
                onChange={handleCustomerChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
                placeholder="Nhập email"
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Chi tiết hóa đơn</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm/dịch vụ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
                        placeholder="Tên sản phẩm/dịch vụ"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center text-[#fbb321] hover:text-[#e09a0d]"
          >
            <FaPlus className="mr-1" />
            Thêm sản phẩm/dịch vụ
          </button>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
              placeholder="Nhập ghi chú (nếu có)"
            ></textarea>
          </div>
          <div>
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
              Phương thức thanh toán
            </label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
            >
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ tín dụng</option>
              <option value="banking">Chuyển khoản</option>
              <option value="momo">Ví Momo</option>
            </select>

            <div className="mt-4">
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Giảm giá (%)
              </label>
              <input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min="0"
                max="100"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#fbb321] focus:border-[#fbb321]"
              />
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Tổng tiền hàng:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Giảm giá:</span>
            <span className="font-medium">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-900">Thành tiền:</span>
            <span className="text-[#fbb321]">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <FaPrint className="mr-2" />
            In hóa đơn
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-[#fbb321] text-white rounded-md hover:bg-[#e09a0d]"
          >
            <FaSave className="mr-2" />
            Lưu hóa đơn
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfflineInvoice; 