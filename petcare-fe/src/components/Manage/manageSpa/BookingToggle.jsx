import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

const VITE_API_BASE_URL = 'http://api.petcarect.store';

const BookingToggle = () => {
  const { token, user, logout } = useAuth();
  const [bookingEnabled, setBookingEnabled] = useState(false);

  const getBookingStatus = async () => {
    try {
      if (import.meta.env.DEV) {
        console.log('Fetching booking status...');
      }
      const response = await axios.get(`${VITE_API_BASE_URL}/api/booking-enabled`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (import.meta.env.DEV) {
        console.log('Booking status response:', response.data);
      }
      return response.data.enabled || false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching booking status:', error);
      }
      throw new Error(error.response?.data?.message || 'Không thể lấy trạng thái đặt lịch');
    }
  };

  const updateBookingStatus = async (enabled, token) => {
    try {
      if (import.meta.env.DEV) {
        console.log(`Updating booking status to: ${enabled}`);
      }
      const response = await axios.put(`${VITE_API_BASE_URL}/api/booking-enabled`, 
        { enabled },
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (import.meta.env.DEV) {
        console.log('Update booking status response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating booking status:', error);
      }
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái đặt lịch');
    }
  };

  useEffect(() => {
    const fetchBookingStatus = async () => {
      try {
        const status = await getBookingStatus();
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
      await updateBookingStatus(newStatus, token);
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