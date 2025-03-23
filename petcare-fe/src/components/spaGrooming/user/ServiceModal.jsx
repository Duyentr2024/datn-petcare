// ServiceModal.jsx
import React, { memo } from 'react';

const ServiceModal = memo(
  ({ isServiceModalOpen, setIsServiceModalOpen, selectedSlots, pets, setPets, serviceErrors, setServiceErrors, serviceOptions, weightOptions, handlePetChange, handleServiceConfirm, addNewPet, removePet }) => (
    <div className={`fixed inset-0 z-50 ${isServiceModalOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Thông tin dịch vụ</h2>
            {pets.length < selectedSlots.length && (
              <button
                onClick={addNewPet}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span className="text-xl">+</span> Thêm thú cưng
              </button>
            )}
          </div>
          <div className="mb-4 text-sm">
            <p className="text-gray-600">
              Số slot đã đặt: <span className="font-medium">{selectedSlots.length}</span>
            </p>
            <p className="text-gray-600">
              Số thú cưng đã thêm: <span className="font-medium">{pets.length}</span>
            </p>
            {serviceErrors.petCount && (
              <p className="text-red-500 mt-1">
                Vui lòng thêm đủ {selectedSlots.length} thú cưng tương ứng với số slot đã đặt
              </p>
            )}
          </div>
          {pets.map((pet, index) => (
            <div key={pet.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">Thú cưng {index + 1}</h3>
                {pets.length > 1 && (
                  <button
                    onClick={() => removePet(index)}
                    className="text-red-500 hover:text-red-600"
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
                    value={pet.petType}
                    onChange={(e) => handlePetChange(index, 'petType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] ${
                      !pet.petType && serviceErrors.petInfo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn loại thú cưng</option>
                    <option value="cat">Mèo</option>
                    <option value="dog">Chó</option>
                  </select>
                  {!pet.petType && serviceErrors.petInfo && (
                    <p className="text-red-500 text-sm mt-1">Vui lòng chọn loại thú cưng</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pet.service}
                    onChange={(e) => handlePetChange(index, 'service', e.target.value)}
                    disabled={!pet.petType}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] ${
                      !pet.service && serviceErrors.petInfo ? 'border-red-500' : 'border-gray-300'
                    } ${!pet.petType ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {pet.petType &&
                      serviceOptions[pet.petType]?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                  {!pet.service && serviceErrors.petInfo && (
                    <p className="text-red-500 text-sm mt-1">Vui lòng chọn dịch vụ</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cân nặng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pet.weight}
                    onChange={(e) => handlePetChange(index, 'weight', e.target.value)}
                    disabled={!pet.petType}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] ${
                      !pet.weight && serviceErrors.petInfo ? 'border-red-500' : 'border-gray-300'
                    } ${!pet.petType ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Chọn cân nặng</option>
                    {pet.petType &&
                      weightOptions[pet.petType]?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                  {!pet.weight && serviceErrors.petInfo && (
                    <p className="text-red-500 text-sm mt-1">Vui lòng chọn cân nặng</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    value={pet.note}
                    onChange={(e) => handlePetChange(index, 'note', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#026AC7] h-[42px] resize-none"
                    placeholder="Ghi chú thêm về thú cưng..."
                  />
                </div>
                <div className="col-span-2 flex justify-end items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">Giá dịch vụ:</span>
                  <span className="text-[#026AC7] font-medium">
                    {pet.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => setIsServiceModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Đóng
            </button>
            <button
              onClick={handleServiceConfirm}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                pets.length === selectedSlots.length &&
                pets.every((pet) => pet.petType && pet.service && pet.weight)
                  ? 'bg-[#026AC7] text-white hover:bg-[#0253a0]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

export default ServiceModal;