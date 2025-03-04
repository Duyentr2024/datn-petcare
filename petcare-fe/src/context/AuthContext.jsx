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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null); // Thêm state để lưu thông báo được chọn
  // Lắng nghe sự thay đổi của cookies và cập nhật token
  useEffect(() => {
    if (cookies.accessToken && cookies.accessToken !== token) {
      setToken(cookies.accessToken);
    }
  }, [cookies.accessToken]);

  // Giải mã token để lấy thông tin user
  useEffect(() => {
    if (token) {
      try {
        const decoded = decodeToken(token);
        console.log("decoded", decoded);
        if (decoded) {
          setUser({
            userId: decoded.userId,
            fullName: decoded.fullName,
            role: decoded.roles?.[0]?.roleName || "Guest",
            email: decoded.email || "",
            phone: decoded.phone || "",
            registration_date: decoded.registration_date || "",
            imageUrl: decoded.imageUrl || "",
            totalSpent:
              decoded.totalSpent ||
              "Chưa có điểm tích lũy, vui lòng hãy mua sắm!",
          });
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setUser(null);
      }
    } else {
      setUser(null);
      setNotifications([]); // Xóa thông báo khi đăng xuất
      setUnreadCount(0);
    }
  }, [token]);

  // Lấy thông báo từ BE khi user thay đổi
  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.userId]);

  // Gọi API để lấy thông báo từ BE
  const fetchNotifications = async () => {
    console.log("Fetching notifications for userId:", user?.userId);
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
      setNotifications(
        response.data.map((notif) => ({
          ...notif,
          isRead: notif.read || notif.isRead, // Đảm bảo field là 'isRead'
        }))
      );
      const unread = await axios.get(
        `http://localhost:8080/api/notifications/user/${user.userId}/unread`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(
        "Unread notifications fetched with isRead field:",
        unread.data
      );
      setUnreadCount(unread.data.length);
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
  // Thiết lập WebSocket
  useEffect(() => {
    if (!user?.userId) {
      console.log("[WebSocket] Skipping subscription: userId not available");
      return;
    }

    const socket = new SockJS("http://localhost:8080/ws/");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000, // Gửi heartbeat để giữ kết nối
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log("[WebSocket] Connected (Context)");
        // Đăng ký nhận tin nhắn từ /topic/status
        stompClient.subscribe(`/topic/status`, (message) => {
          try {
            // Xử lý message.body như chuỗi văn bản
            const messageText = message.body;
            const newNotification = {
              id: Date.now(),
              message: messageText,
              isRead: false,
            };
            console.log("[WebSocket] Received (Context):", newNotification);
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 1500);
            // Lưu thông báo mới vào BE
            
          } catch (error) {
            console.error("[WebSocket] Error processing message:", error);
          }
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

  // Hàm đăng xuất
  const logout = () => {
    removeCookie("accessToken");
    setToken(null);
    setUser(null);
    
  };

  // Cập nhật trạng thái đã đọc trên BE
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
      fetchNotifications(); // Cập nhật lại danh sách thông báo
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  // Trong AuthContext.jsx, cập nhật handleViewNotification
  const handleViewNotification = async (index) => {
    console.log(
      "Handling notification click, index:",
      index,
      "Notifications:",
      notifications
    );
    const notification = notifications[index];
    if (!notification) {
      console.error("Notification not found at index:", index);
      return;
    }
    console.log("Clicked notification with isRead:", notification.isRead);
    if (!notification.isRead) {
      // Sử dụng notification.isRead thay vì read
      try {
        console.log("Marking notification as read for ID:", notification.id);
        const updatedNotifications = [...notifications];
        updatedNotifications[index].isRead = true;
        const sortedNotifications = [
          ...updatedNotifications.filter((n) => !n.isRead),
          ...updatedNotifications.filter((n) => n.isRead),
        ];
        setNotifications(sortedNotifications);
        setUnreadCount((prev) => prev - 1);
        setIsShaking(false);
        await markNotificationAsRead(notification.id);
        console.log(
          "Notification marked as read successfully for ID:",
          notification.id
        );
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
        const rollbackNotifications = [...notifications];
        rollbackNotifications[index].isRead = false;
        setNotifications(rollbackNotifications);
        setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })));
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
    setSelectedNotification, // Đảm bảo setSelectedNotification được cung cấp
    handleViewNotification, // Đảm bảo khai báo handleViewNotification
    markNotificationAsRead, // Thêm để cập nhật trạng thái đã đọc
    setNotifications, // Đảm bảo setNotifications được cung cấp
    setUnreadCount, // Đảm bảo setUnreadCount được cung cấp
    setIsShaking, // Đảm bảo setIsShaking được cung cấp
    
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để lấy thông tin xác thực và thông báo
export const useAuth = () => useContext(AuthContext);
