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
  const [cartCount, setCartCount] = useState(0); // Số lượng sản phẩm trong giỏ hàng
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
          totalSpent:
            decoded.totalSpent ||
            "Chưa có điểm tích lũy, vui lòng hãy mua sắm!",
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
      fetchCartCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setCartCount(0);
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
      setUnreadCount(
        normalizedNotifications.filter((notif) => !notif.isRead).length
      );
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
        // Đăng ký topic cho cập nhật giỏ hàng
        stompClient.subscribe(`/topic/cart/${user.userId}`, (message) => {
          handleCartUpdate(message.body);
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
      console.log("Received WebSocket message:", messageBody);
      
      const newNotification = {
        id: notificationData.id,
        message: notificationData.message,
        isRead: false,
        orderId: notificationData.orderId || null,
        timestamp: new Date().toISOString(),
      };
  
      setNotifications((prev) => {
        const updatedNotifications = [newNotification, ...prev];
        return updatedNotifications;
      });
  
      setUnreadCount((prev) => prev + 1);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1500);
  
      // Delay việc fetch dữ liệu để đảm bảo backend đã cập nhật
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
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
      "Xử lý khi nhấn vào thông báo, vị trí:",
      index,
      "Danh sách thông báo:",
      notifications
    );
    if (index < 0 || index >= notifications.length) {
      console.error("Vị trí thông báo không hợp lệ:", index);
      return;
    }
  
    const notification = notifications[index];
    console.log(
      "Thông báo được nhấn:",
      notification,
      "trạng thái đã đọc:",
      notification.isRead
    );
  
    try {
      console.log("Đánh dấu thông báo đã đọc, ID:", notification.id);
      await markNotificationAsRead(notification.id); // Gọi API PUT bất kể isRead
      await fetchNotifications(); // Đồng bộ lại từ backend
      setUnreadCount((prev) => Math.max(prev - 1, 0)); // Giảm số thông báo chưa đọc nếu cần
      console.log("Đánh dấu thông báo đã đọc thành công, ID:", notification.id);
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      if (error.response) {
        console.error(
          "Mã trạng thái phản hồi:",
          error.response.status,
          "Dữ liệu phản hồi:",
          error.response.data
        );
      }
    }
  };
  

  // Hàm lấy số lượng giỏ hàng ban đầu từ backend
  const fetchCartCount = async () => {
    if (!user?.userId || !token) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/api/cart-details/user/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const cartDetails = response.data;
      setCartCount(cartDetails.length); // Cập nhật cartCount dựa trên số lượng sản phẩm
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Xử lý tin nhắn WebSocket cho giỏ hàng
  const handleCartUpdate = (messageBody) => {
    try {
      const newCartCount = parseInt(messageBody, 10);
      console.log("Received cart count update from WebSocket:", newCartCount);
      setCartCount(newCartCount); // Cập nhật cartCount từ WebSocket
    } catch (error) {
      console.error("Error parsing cart update message:", error);
    }
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
    cartCount, // Thêm cartCount vào context
    setCartCount, // Cung cấp hàm để cập nhật cartCount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook để sử dụng context trong các component con
export const useAuth = () => useContext(AuthContext);
