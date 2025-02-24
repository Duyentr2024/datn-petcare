import React from 'react'
import TimeSlotSection from './TimeSlotSection'

const AdminAppointment = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex gap-4">
        {/* Phần 1: Thời Gian (3/12) */}
        <div className="w-3/12 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Thời Gian</h2>
          <TimeSlotSection />
        </div>

        {/* Phần 2: Thông tin chi tiết (6/12) */}
        <div className="w-6/12 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Thông Tin Chi Tiết</h2>
          {/* Thêm thông tin chi tiết ở đây */}
        </div>

        {/* Phần 3: Hóa đơn thanh toán (3/12) */}
        <div className="w-3/12 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Hóa Đơn Thanh Toán</h2>
          {/* Thêm nội dung hóa đơn ở đây */}
        </div>
      </div>
    </div>
  )
}

export default AdminAppointment;
