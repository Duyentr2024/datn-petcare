import React, { createContext, useContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { decodeToken } from "../components/utils/jwt";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios"; // Thêm axios để gọi API

// Tạo context để lưu thông tin xác thực và thông báo WebSocket
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const [token, setToken] = useState(cookies.accessToken || null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]); // Lưu danh sách thông báo
  const [unreadCount, setUnreadCount] = useState(0); // Đếm số thông báo chưa đọc
  const [isShaking, setIsShaking] = useState(false); // Trạng thái hiệu ứng lắc chuông
  const [selectedNotification, setSelectedNotification] = useState(null); // Thông báo được chọn trong modal

  // Cập nhật token khi cookies thay đổi
  useEffect(() => {
    if (cookies.accessToken && cookies.accessToken !== token) {
      setToken(cookies.accessToken);
    }
  }, [cookies.accessToken, token]);

  // Giải mã token để lấy thông tin user khi token thay đổi
  useEffect(() => {
    if (token) {
      try {
        const decoded = decodeToken(token);
        console.log("Decoded token:", decoded);
        setUser({
          userId: decoded.userId,
          fullName: decoded.fullName,
          role: decoded.roles?.[0]?.roleName || "Guest",
          email: decoded.email || "",
          phone: decoded.phone || "",
          registration_date: decoded.registration_date || "",
          imageUrl: decoded.imageUrl || "",
          totalSpent: decoded.totalSpent || "Chưa có điểm tích lũy, vui lòng hãy mua sắm!",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        setUser(null);
        setNotifications([]); // Xóa thông báo khi token không hợp lệ
        setUnreadCount(0);
      }
    } else {
      setUser(null);
      setNotifications([]); // Xóa thông báo khi đăng xuất
      setUnreadCount(0);
    }
  }, [token]);

  // Fetch danh sách thông báo từ backend khi user thay đổi
  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.userId]);

  /**
   * Gọi API để lấy danh sách thông báo từ backend
   * @returns {Promise<void>} Không trả về giá trị, chỉ cập nhật state
   */
  const fetchNotifications = async () => {
    console.log("Fetching notifications for userId:", user?.userId);
    if (!user?.userId || !token) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/api/notifications/user/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Notifications fetched with isRead field:", response.data);
      const normalizedNotifications = response.data.map((notif) => ({
        ...notif,
        isRead: notif.read || notif.isRead || false, // Chuẩn hóa field isRead
      }));
      setNotifications(normalizedNotifications);
      setUnreadCount(normalizedNotifications.filter((notif) => !notif.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response) {
        console.error(
          "Response status:",
          error.response.status,
          "Data:",
          error.response.data
        );
      }
    }
  };

  // Thiết lập WebSocket để nhận thông báo realtime
  useEffect(() => {
    if (!user?.userId) {
      console.log("[WebSocket] Skipping subscription: userId not available");
      return;
    }

    const socket = new SockJS("http://localhost:8080/ws/");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Tự động kết nối lại sau 5 giây nếu mất kết nối
      heartbeatIncoming: 10000, // Gửi heartbeat từ server đến client mỗi 10 giây
      heartbeatOutgoing: 10000, // Gửi heartbeat từ client đến server mỗi 10 giây
      onConnect: () => {
        console.log("[WebSocket] Connected (Context)");
        // Đăng ký nhận tin nhắn từ topic /topic/status
        stompClient.subscribe("/topic/status", (message) => {
          handleWebSocketMessage(message.body);
        });
      },
      onStompError: (error) => {
        console.error("[WebSocket] Error (Context):", error);
      },
      onDisconnect: () => {
        console.log("[WebSocket] Disconnected unexpectedly (Context)");
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      console.log("[WebSocket] Disconnected (Context)");
    };
  }, [user?.userId]);

  /**
   * Xử lý tin nhắn nhận được từ WebSocket
   * @param {string} messageBody - Nội dung tin nhắn từ WebSocket (JSON string)
   */
  const handleWebSocketMessage = (messageBody) => {
    try {
      const notificationData = JSON.parse(messageBody);
      console.log("Parsed notification data from WebSocket:", notificationData);
      const newNotification = {
        id: notificationData.id, // Sử dụng ID từ backend (thực tế từ database)
        message: notificationData.message,
        isRead: false,
        orderId: notificationData.orderId || null, // Trích xuất orderId nếu có
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1500);
      fetchNotifications(); // Đảm bảo đồng bộ với database sau khi nhận WebSocket
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    removeCookie("accessToken");
    setToken(null);
    setUser(null);
    setNotifications([]); // Xóa thông báo khi đăng xuất
    setUnreadCount(0);
    setIsShaking(false);
    setSelectedNotification(null); // Xóa thông báo được chọn khi đăng xuất
  };

  /**
   * Đánh dấu một thông báo là đã đọc trên backend
   * @param {number} notificationId - ID của thông báo cần đánh dấu
   * @returns {Promise<void>} Không trả về giá trị, chỉ cập nhật state
   */
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotifications(); // Cập nhật lại danh sách thông báo sau khi đánh dấu
    } catch (error) {
      console.error("Error marking notification as read:", error);
      if (error.response) {
        console.error(
          "Response status:",
          error.response.status,
          "Data:",
          error.response.data
        );
      }
    }
  };

  /**
   * Xử lý khi nhấp vào thông báo trong danh sách
   * @param {number} index - Vị trí của thông báo trong danh sách notifications
   */
  const handleViewNotification = async (index) => {
    console.log(
      "Handling notification click, index:",
      index,
      "Notifications:",
      notifications
    );
    if (index < 0 || index >= notifications.length) {
      console.error("Invalid notification index:", index);
      return;
    }

    const notification = notifications[index];
    console.log("Clicked notification:", notification, "with isRead:", notification.isRead);

    if (!notification.isRead) {
      try {
        console.log("Marking notification as read for ID:", notification.id);
        await markNotificationAsRead(notification.id); // Sử dụng notification.id thay vì notificationId
        const updatedNotifications = [...notifications];
        updatedNotifications[index] = { ...notification, isRead: true };
        const sortedNotifications = [
          ...updatedNotifications.filter((n) => !n.isRead),
          ...updatedNotifications.filter((n) => n.isRead),
        ];
        setNotifications(sortedNotifications);
        setUnreadCount((prev) => prev - 1);
        setIsShaking(false);
        console.log(
          "Notification marked as read successfully for ID:",
          notification.id
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
        if (error.response && error.response.status === 500) {
          console.error("Backend returned 500, retrying with fetch...");
          await fetchNotifications(); // Thử fetch lại để đồng bộ
        }
        // Rollback nếu cần
        const rollbackNotifications = [...notifications];
        rollbackNotifications[index] = { ...notification, isRead: false };
        setNotifications(rollbackNotifications);
        setUnreadCount((prev) => prev + 1);
      }
    }

    console.log("Setting selected notification:", notification);
    setSelectedNotification(notification);
  };

  const value = {
    token,
    setToken,
    user,
    setUser,
    logout,
    notifications,
    unreadCount,
    isShaking,
    selectedNotification,
    setSelectedNotification, // Cung cấp hàm để cập nhật thông báo được chọn
    handleViewNotification, // Hàm xử lý nhấp vào thông báo
    markNotificationAsRead, // Hàm đánh dấu thông báo là đã đọc
    setNotifications, // Cung cấp để cập nhật danh sách thông báo
    setUnreadCount, // Cung cấp để cập nhật số thông báo chưa đọc
    setIsShaking, // Cung cấp để cập nhật hiệu ứng lắc
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng context trong các component con
export const useAuth = () => useContext(AuthContext);