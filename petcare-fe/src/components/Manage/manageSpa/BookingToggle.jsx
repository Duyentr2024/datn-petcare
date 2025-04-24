import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import TimeSlotService from "../../../service/spaService/TimeSlotService";

const BookingToggle = () => {
  const { token, user, logout } = useAuth();
  const [bookingEnabled, setBookingEnabled] = useState(false);

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const status = await TimeSlotService.getBookingStatus();
        setBookingEnabled(status);
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái đặt lịch:", error.message);
      }
    };
    fetchBookingStatus();
  }, []);

  const handleToggleBooking = async () => {
    if (!token) {
      console.error("Token không có sẵn");
      return;
    }
    try {
      const newStatus = !bookingEnabled;
      await TimeSlotService.updateBookingStatus(newStatus, token);
      setBookingEnabled(newStatus);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đặt lịch:", error.message);
      if (error.message.includes("Phiên đăng nhập hết hạn")) {
        logout();
      }
    }
  };

  const canToggleBooking = user && (user.role === "ADMIN" || user.role === "STAFF");

  return (
    <div>
      <h2>Trạng thái đặt lịch: {bookingEnabled ? "Bật" : "Tắt"}</h2>
      <button
        onClick={handleToggleBooking}
        disabled={!canToggleBooking}
      >
        {bookingEnabled ? "Tắt đặt lịch" : "Bật đặt lịch"}
      </button>
      {!canToggleBooking && (
        <p style={{ color: "red" }}>
          Chỉ ADMIN hoặc STAFF mới có thể bật/tắt đặt lịch.
        </p>
      )}
    </div>
  );
};

export default BookingToggle;