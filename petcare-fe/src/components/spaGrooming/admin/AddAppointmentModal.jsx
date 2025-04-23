import React from 'react';
import { Modal, Button, Input, DatePicker, Select, Radio, Space } from 'antd';

const AddAppointmentModal = ({ 
    isVisible, 
    onCancel, 
    onOk, 
    services, 
    handleAddService, 
    handleRemoveService, 
    handleServiceChange 
}) => {
  return (
    <Modal
      title="Thêm lịch hẹn mới"
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={onOk} className="bg-green-500 hover:bg-green-600">
          Lưu
        </Button>
      ]}
      width={600}
    >
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khách hàng
          </label>
          <div className="space-y-3">
            <Input
              placeholder="Họ và tên"
              className="w-full"
            />
            <Input
              placeholder="Số điện thoại"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày làm
          </label>
          <div className="space-y-3">
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY"
            />
            <Select
              className="w-full"
              placeholder="Chọn giờ"
              options={Array.from({ length: 12 }, (_, i) => ({
                value: `${9 + i}:00`,
                label: `${9 + i}:00`
              }))}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Thú cưng</h3>
            <button
              onClick={handleAddService}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <span className="text-xl">+</span> Thêm thú cưng
            </button>
          </div>
          
          {services.map((service) => (
            <div key={service.id} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-600">Thú cưng {service.id}</h4>
                {services.length > 1 && (
                  <button
                    onClick={() => handleRemoveService(service.id)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Xóa
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại thú cưng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={service.petType}
                    onChange={(e) => handleServiceChange(service.id, 'petType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                  >
                    <option value="">Chọn loại thú cưng</option>
                    <option value="cat">Mèo</option>
                    <option value="dog">Chó</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={service.service}
                    onChange={(e) => handleServiceChange(service.id, 'service', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                  >
                    <option value="">Chọn dịch vụ</option>
                    <option value="service1">Tắm + vệ sinh</option>
                    <option value="service2">Spa cao cấp</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cân nặng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={service.weight}
                    onChange={(e) => handleServiceChange(service.id, 'weight', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                  >
                    <option value="">Chọn cân nặng</option>
                    <option value="weight1">Dưới 5kg</option>
                    <option value="weight2">5kg - 10kg</option>
                    <option value="weight3">Trên 10kg</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={service.note}
                    onChange={(e) => handleServiceChange(service.id, 'note', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-[42px] resize-none"
                    placeholder="Ghi chú thêm về thú cưng..."
                  />
                </div>
                
                <div className="col-span-2 flex justify-end items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">Giá dịch vụ:</span>
                  <span className="text-blue-600 font-medium">
                    {service.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <Radio.Group className="w-full">
            <Space direction="vertical">
              <Radio value="not_arrived">Chưa tới</Radio>
              <Radio value="in_use">Đang sử dụng</Radio>
            </Space>
          </Radio.Group>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <Input.TextArea
            rows={4}
            placeholder="Nhập ghi chú"
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddAppointmentModal; 