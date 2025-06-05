import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaMicrophone,
  FaStop,
  FaExpand,
  FaCompress,
  FaPaperclip,
  FaSmile,
  FaPaperPlane,
} from "react-icons/fa";
import { GiSittingDog } from "react-icons/gi"; // Icon chó ngồi
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Logo from "../assets/images/banner1.png"; // Thay đổi đường dẫn đến logo của bạn

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [currentFlow, setCurrentFlow] = useState(null);
  const [flowStep, setFlowStep] = useState(0);
  const [flowData, setFlowData] = useState({});
  const [isMaximized, setIsMaximized] = useState(false);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Các tùy chọn ban đầu
  const mainOptions = [
    { label: "Tìm sản phẩm", value: "find_product" },
    { label: "Xem sản phẩm theo danh mục", value: "category_filter" },
    { label: "Xem sản phẩm giá rẻ", value: "price_filter_min" },
    { label: "Xem sản phẩm giá cao", value: "price_filter_max" },
    { label: "Xem sản phẩm bán chạy", value: "best_sellers" },
    { label: "Thông tin cửa hàng", value: "store_info" },
  ];

  // Tùy chọn loại thú cưng
  const petTypes = [
    { label: "Chó", value: "chó" },
    { label: "Mèo", value: "mèo" },
  ];

  // Tùy chọn danh mục
  const categories = [
    { label: "Chuồng", value: "chuồng" },
    { label: "Thức ăn", value: "thức ăn" },
    { label: "Đồ chơi", value: "đồ chơi" },
    { label: "Phụ kiện", value: "phụ kiện" },
  ];

  // Tùy chọn mức giá
  const priceRanges = [
    { label: "Dưới 100,000", value: "under_100k" },
    { label: "100,000 - 200,000", value: "100k_200k" },
    { label: "Trên 200,000", value: "above_200k" },
  ];

  // Kiểm tra trạng thái đăng nhập và giải mã token
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);
        const storedUserName =
          decodedToken.fullName || decodedToken.sub || "Khách hàng";
        const storedUserId = decodedToken.userId;
        if (!storedUserId) {
          throw new Error("Không tìm thấy userId trong token");
        }
        setIsAuthenticated(true);
        setUserName(storedUserName);
        setUserId(storedUserId.toString());
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        setIsAuthenticated(false);
        setUserName("");
        setUserId("");
      }
    }
  }, []);

  const toggleChat = () => {
    if (!isAuthenticated) {
      setChatHistory([{ sender: 'bot', text: 'Vui lòng đăng nhập để sử dụng chatbot!' }]);
      setIsOpen(true);
      return;
    }
  
    if (!isOpen && isFirstOpen) {
      setChatHistory([
        { 
          sender: 'bot', 
          text: `Xin chào ${userName}! Tôi là trợ lý AI của PetCare. Bạn cần tôi tư vấn gì hôm nay?` 
        },
        { 
          sender: 'bot', 
          text: '', 
          options: mainOptions 
        },
      ]);
      setIsFirstOpen(false);
    }
  
    setIsOpen(!isOpen);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Hàm xử lý khi người dùng chọn một tùy chọn
  window.handleOptionClick = (value) => {
    let botMessage = "";
    let botOptions = null;
    let newFlow = value;
    let category = "";

    if (value.startsWith("category_filter_")) {
      newFlow = "category_filter";
      category = value.replace("category_filter_", "");
      botMessage = `Bạn muốn xem sản phẩm ${category} dành cho loại thú cưng nào ạ?`;
      botOptions = petTypes;
    } else if (!currentFlow) {
      setCurrentFlow(value);
      setFlowStep(1);
      setFlowData({});

      switch (value) {
        case "find_product":
          botMessage =
            "Bạn muốn tìm sản phẩm gì? (Ví dụ: sữa tắm, đồ chơi, thức ăn...)";
          break;
        case "category_filter":
        case "price_filter_min":
        case "price_filter_max":
        case "best_sellers":
          botMessage = "Sản phẩm dành cho loại thú cưng nào ạ?";
          botOptions = petTypes;
          break;
        case "store_info":
          handleSendMessage("giờ mở cửa");
          return;
        default:
          botMessage = "Mình chưa hiểu ý bạn. Bạn có thể chọn lại nhé!";
          botOptions = mainOptions;
      }
    } else {
      handleFlowStep(value);
      return;
    }

    setCurrentFlow(newFlow);
    setFlowStep(1);
    setFlowData({ category });
    setChatHistory((prev) => [...prev, { sender: "bot", text: botMessage, options: botOptions }]);
  };

  window.viewProduct = (productId) => {
    console.log(`Xem chi tiết sản phẩm với ID: ${productId}`);
    window.location.href = `/productDetail/${productId}`;
  };

  const handleFlowStep = (value) => {
    let botMessage = "";
    let botOptions = null;
    const updatedFlowData = { ...flowData };

    if (currentFlow === "find_product") {
      if (flowStep === 1) {
        updatedFlowData.product = value;
        setFlowData(updatedFlowData);
        setFlowStep(2);
        botMessage = "Sản phẩm này dành cho loại thú cưng nào ạ?";
        botOptions = petTypes;
      } else if (flowStep === 2) {
        updatedFlowData.petType = value;
        setFlowData(updatedFlowData);
        setFlowStep(3);
        botMessage = "Bạn muốn sản phẩm có mức giá như thế nào?";
        botOptions = priceRanges;
      } else if (flowStep === 3) {
        updatedFlowData.priceRange = value;
        setFlowData(updatedFlowData);
        const messageToSend = `${updatedFlowData.product} ${
          updatedFlowData.petType
        } ${
          value === "under_100k"
            ? "giá rẻ"
            : value === "above_200k"
            ? "giá cao"
            : ""
        }`.trim();
        handleSendMessage(messageToSend);
        return;
      }
    } else if (currentFlow === "category_filter") {
      if (flowStep === 1) {
        updatedFlowData.petType = value;
        setFlowData(updatedFlowData);
        setFlowStep(2);
        const category = updatedFlowData.category || "";
        botMessage = `Bạn muốn xem sản phẩm ${category} thuộc danh mục nào?`;
        botOptions = categories;
      } else if (flowStep === 2) {
        updatedFlowData.category = value;
        setFlowData(updatedFlowData);
        const messageToSend = `${updatedFlowData.category} ${updatedFlowData.petType}`;
        handleSendMessage(messageToSend);
        return;
      }
    } else if (
      currentFlow === "price_filter_min" ||
      currentFlow === "price_filter_max"
    ) {
      if (flowStep === 1) {
        updatedFlowData.petType = value;
        setFlowData(updatedFlowData);
        setFlowStep(2);
        botMessage = `Bạn muốn tìm sản phẩm ${
          currentFlow === "price_filter_min" ? "giá rẻ" : "giá cao"
        } thuộc danh mục nào?`;
        botOptions = categories;
      } else if (flowStep === 2) {
        updatedFlowData.category = value;
        setFlowData(updatedFlowData);
        const messageToSend = `${updatedFlowData.category} ${
          updatedFlowData.petType
        } ${currentFlow === "price_filter_min" ? "giá rẻ" : "giá cao"}`;
        handleSendMessage(messageToSend);
        return;
      }
    } else if (currentFlow === "best_sellers") {
      updatedFlowData.petType = value;
      setFlowData(updatedFlowData);
      const messageToSend = `bán chạy ${updatedFlowData.petType}`;
      handleSendMessage(messageToSend);
      return;
    }

    setChatHistory((prev) => [...prev, { sender: "bot", text: botMessage, options: botOptions }]);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async (overrideMessage = null) => {
    const userMessageText = overrideMessage || message.trim();
    if (userMessageText === "" && !overrideMessage) return;

    if (!overrideMessage) {
      const userMessage = { sender: "user", text: userMessageText };
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage("");
    }

    setIsLoading(true);

    try {
      const token = Cookies.get("accessToken");
      console.log("Sending request with userId:", userId);

      const response = await fetch("http://localhost:8080/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessageText, userId }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.response) {
        const formattedResponse = formatBotResponse(data.response);
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: formattedResponse },
        ]);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Lỗi khi kết nối đến máy chủ AI." },
      ]);
    } finally {
      setIsLoading(false);
      setCurrentFlow(null);
      setFlowStep(0);
      setFlowData({});
    }
  };

  const formatBotResponse = (response) => {
    try {
      const jsonData = JSON.parse(response);
      if (jsonData.status === "success" && jsonData.response) {
        return jsonData.response.replace(/\*/g, "<br />");
      }
    } catch (e) {
      console.error("Lỗi parse JSON:", e);
    }
    return response.replace(/\*/g, "<br />");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading && isAuthenticated) {
      if (currentFlow === "find_product" && flowStep === 1) {
        handleFlowStep(message.trim());
      } else {
        handleSendMessage();
      }
    }
  };

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "vi-VN";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Lỗi ghi âm:", event.error);
        setIsRecording(false);
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", text: "Lỗi khi ghi âm. Vui lòng thử lại." },
        ]);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]); // Thêm isLoading vào dependency để cuộn khi trạng thái loading thay đổi

  const toggleRecording = () => {
    if (!isAuthenticated) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Vui lòng đăng nhập để sử dụng tính năng ghi âm!",
        },
      ]);
      return;
    }

    if (!recognitionRef.current) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Trình duyệt không hỗ trợ ghi âm." },
      ]);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  // Component để render các nút tùy chọn
  const RenderOptions = ({ options }) => {
    return (
      <div className="flex flex-wrap justify-start gap-2 mt-2">
        {options.map((option) => (
          <button
            key={option.value}
            className="bg-[#ffd966] text-gray-800 px-4 py-2 rounded-full hover:bg-[#fbb321] transition-all duration-200 shadow-sm chat-button text-sm font-medium"
            onClick={() => window.handleOptionClick(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed right-4 bottom-[100px] z-50">
      <button
        className={`bg-[#fbb321] text-white p-4 rounded-full shadow-lg hover:bg-[#e6a01e] transition-all duration-300 ${
          isOpen ? "hidden" : ""
        }`}
        onClick={toggleChat}
      >
        <GiSittingDog size={24} />
      </button>
      {isOpen && (
        <div
          className={`bg-white shadow-lg rounded-xl flex flex-col border border-gray-200 transition-all duration-300 ${
            isMaximized
              ? "w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh]"
              : "w-[24rem] h-[32rem] max-w-[24rem] max-h-[32rem]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#e3e2e0] p-3 rounded-t-xl sticky top-0 z-50">
            <div className="flex items-center">
              <img
                src={Logo}
                alt="PetCare Logo"
                className="w-20 h-auto rounded-full mr-2"
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="text-black hover:text-gray-900 transition-colors duration-200"
                onClick={toggleMaximize}
              >
                {isMaximized ? (
                  <FaCompress size={16} />
                ) : (
                  <FaExpand size={16} />
                )}
              </button>
              <button
                className="text-black hover:text-gray-900 transition-colors duration-200"
                onClick={toggleChat}
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Nội dung chat */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-white flex flex-col"
          >
            {chatHistory.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-center italic text-sm">
                Bắt đầu trò chuyện ngay!
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  {msg.sender === "bot" && (
                    <img
                      src="https://i.pinimg.com/736x/95/f2/58/95f258ff702f171637cdbfe40e0632c5.jpg"
                      alt="PetCare Bot"
                      className="w-6 h-6 rounded-full mr-2 self-start"
                    />
                  )}
                  <div className="flex flex-col">
                    <div
                      className={`p-3 rounded-xl max-w-[80%] shadow-sm ${
                        msg.sender === "user"
                          ? "bg-[#fbb321] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                    {msg.options && <RenderOptions options={msg.options} />}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <img
                  src="https://i.pinimg.com/736x/95/f2/58/95f258ff702f171637cdbfe40e0632c5.jpg"
                  alt="PetCare Bot"
                  className="w-6 h-6 rounded-full mr-2 self-start"
                />
                <div className="flex items-center p-3 rounded-xl bg-gray-100 text-gray-600 shadow-sm">
                  <span className="typing-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex items-center space-x-2 bg-white rounded-b-xl">
            
            <div className="relative flex-1">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="border border-gray-300 rounded-full p-2 w-full focus:ring-1 focus:ring-[#fbb321] focus:border-[#fbb321] outline-none transition-all duration-200 bg-white text-gray-800 placeholder-gray-400 pr-10"
                disabled={!isAuthenticated}
              />
              <button
                onClick={toggleRecording}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                  isRecording
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-600"
                } hover:bg-opacity-80 transition-all duration-200`}
                disabled={!isAuthenticated}
              >
                {isRecording ? (
                  <FaStop size={14} />
                ) : (
                  <FaMicrophone size={14} />
                )}
              </button>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="bg-[#fbb321] text-white p-2 rounded-full hover:bg-[#e6a01e] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isAuthenticated}
            >
              <FaPaperPlane size={18} />
            </button>
          </div>

          {/* Inline CSS cho product-card và hiệu ứng */}
          <style>{`
            .product-list {
              display: grid;
              grid-template-columns: ${
                isMaximized
                  ? "repeat(auto-fit, minmax(200px, 1fr)) !important"
                  : "1fr !important"
              };
              gap: 1rem !important;
              padding: 1rem !important;
              width: 100%;
            }
            .product-card {
              background: white;
              border-radius: 0.5rem;
              overflow: hidden;
              position: relative;
              transition: transform 0.3s, box-shadow 0.3s;
              max-width: ${isMaximized ? "300px" : "100%"};
              margin: 0 auto;
            }
            .product-card:hover {
              transform: scale(1.02);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .product-card img {
              width: 100%;
              height: ${
                isMaximized
                  ? "200px !important"
                  : "150px !important"
              };
              object-fit: cover;
            }
            .product-card .p-4 {
              padding: ${
                isMaximized
                  ? "1rem !important"
                  : "0.75rem !important"
              };
            }
            .product-card h3 {
              font-size: ${
                isMaximized
                  ? "1rem !important"
                  : "0.9rem !important"
              };
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 0.25rem;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .product-card p {
              font-size: ${
                isMaximized
                  ? "0.85rem !important"
                  : "0.75rem !important"
              };
              color: #6b7280;
              margin-bottom: 0.25rem;
            }
            .product-card button {
              width: 100%;
              background: #e5e7eb;
              color: #1f2937;
              padding: ${isMaximized ? "0.75rem" : "0.5rem"};
              border-radius: 0.25rem;
              font-size: ${isMaximized ? "0.85rem" : "0.75rem"};
              transition: background 0.2s;
            }
            .product-card button:hover {
              background: #d1d5db;
            }

            .chat-button {
              transition: all 0.2s ease;
              cursor: pointer;
              margin: 4px 0;
            }
            .chat-button:hover {
              transform: scale(1.05);
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .chat-button:active {
              transform: scale(0.95);
            }

            .typing-dots {
              display: inline-flex;
              align-items: center;
            }
            .typing-dots span {
              display: inline-block;
              width: 6px;
              height: 6px;
              margin: 0 2px;
              background-color: #6b7280;
              border-radius: 50%;
              animation: typing 1.4s infinite ease-in-out;
            }
            .typing-dots span:nth-child(2) {
              animation-delay: 0.2s;
            }
            .typing-dots span:nth-child(3) {
              animation-delay: 0.4s;
            }
            @keyframes typing {
              0%, 20% {
                transform: translateY(0);
                opacity: 1;
              }
              50% {
                transform: translateY(-4px);
                opacity: 0.5;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }

            /* Đảm bảo container chính luôn chiếm toàn bộ chiều cao */
            .chat-container {
              display: flex;
              flex-direction: column;
              height: 100%;
            }

            /* Đảm bảo nội dung chat mở rộng linh hoạt */
            .chat-content {
              flex: 1 1 auto;
              overflow-y: auto;
              display: flex;
              flex-direction: column;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default ChatBot;