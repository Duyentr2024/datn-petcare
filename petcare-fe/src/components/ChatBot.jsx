import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaRobot, FaMicrophone, FaStop } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [isFirstOpen, setIsFirstOpen] = useState(true); // Thêm state để kiểm tra lần đầu mở
    const chatContainerRef = useRef(null);
    const recognitionRef = useRef(null);

    // Kiểm tra trạng thái đăng nhập và giải mã token khi component mount
    useEffect(() => {
        const token = Cookies.get('accessToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                console.log('Decoded Token:', decodedToken);
                const storedUserName = decodedToken.fullName || decodedToken.sub || 'Khách hàng';
                const storedUserId = decodedToken.userId;
                if (!storedUserId) {
                    throw new Error('Không tìm thấy userId trong token');
                }
                setIsAuthenticated(true);
                setUserName(storedUserName);
                setUserId(storedUserId.toString());
            } catch (error) {
                console.error('Lỗi giải mã token:', error);
                setIsAuthenticated(false);
                setUserName('');
                setUserId('');
            }
        }
    }, []);

    const toggleChat = () => {
        if (!isAuthenticated) {
            setChatHistory([{ sender: 'bot', text: 'Vui lòng đăng nhập để sử dụng chatbot!' }]);
            setIsOpen(true);
            return;
        }

        // Chỉ thêm tin nhắn chào khi lần đầu mở chatbot
        if (!isOpen && isFirstOpen) {
            setChatHistory([
                { sender: 'bot', text: `Xin chào ${userName}! Tôi là trợ lý AI. Bạn cần tôi tư vấn gì hôm nay?` }
            ]);
            setIsFirstOpen(false); // Đánh dấu đã mở lần đầu
        }

        setIsOpen(!isOpen); // Chỉ toggle trạng thái mở/đóng, không reset chatHistory
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSendMessage = async () => {
        if (message.trim() === '' || !isAuthenticated) return;

        const userMessage = { sender: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const token = Cookies.get('accessToken');
            console.log('Sending request with userId:', userId);
            const response = await fetch('http://localhost:8080/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ message, userId })
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (data.response) {
                const formattedResponse = formatBotResponse(data.response);
                setChatHistory(prev => [...prev, { sender: 'bot', text: formattedResponse }]);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            setChatHistory(prev => [...prev, { sender: 'bot', text: 'Lỗi khi kết nối đến máy chủ AI.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatBotResponse = (response) => {
        try {
            const jsonData = JSON.parse(response);
            if (jsonData.status === "success" && jsonData.response) {
                return jsonData.response.replace(/\*/g, '<br />');
            }
        } catch (e) {
            console.error('Lỗi parse JSON:', e);
        }
        return response.replace(/\*/g, '<br />');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading && isAuthenticated) {
            handleSendMessage();
        }
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'vi-VN';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setMessage(transcript);
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Lỗi ghi âm:', event.error);
                setIsRecording(false);
                setChatHistory(prev => [...prev, { sender: 'bot', text: 'Lỗi khi ghi âm. Vui lòng thử lại.' }]);
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
    }, [chatHistory]);

    const toggleRecording = () => {
        if (!isAuthenticated) {
            setChatHistory(prev => [...prev, { sender: 'bot', text: 'Vui lòng đăng nhập để sử dụng tính năng ghi âm!' }]);
            return;
        }

        if (!recognitionRef.current) {
            setChatHistory(prev => [...prev, { sender: 'bot', text: 'Trình duyệt không hỗ trợ ghi âm.' }]);
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    return (
        <div className="fixed right-6 bottom-[150px] z-50">
            <button
                className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-full shadow-lg hover:from-amber-500 hover:to-amber-700 transition-all duration-300 ${isOpen ? 'hidden' : ''}`}
                onClick={toggleChat}
            >
                <FaRobot size={28} />
            </button>
            {isOpen && (
                <div className="bg-white shadow-2xl rounded-2xl p-6 mt-3 w-[40rem] max-h-[80vh] flex flex-col border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Chat với AI</h2>
                        <button
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            onClick={toggleChat}
                        >
                            <FaTimes size={22} />
                        </button>
                    </div>
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto overflow-x-hidden max-h-[60vh] border border-gray-100 rounded-xl p-4 bg-gray-50 shadow-inner"
                        style={{ maxWidth: '100%' }}
                    >
                        {chatHistory.length === 0 ? (
                            <div className="text-gray-500 text-center italic">Chưa có tin nhắn nào. Bắt đầu trò chuyện ngay!</div>
                        ) : (
                            chatHistory.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                                >
                                    {msg.sender === 'bot' && (
                                        <img
                                            src="https://media.istockphoto.com/id/1413286466/vector/chat-bot-icon-robot-virtual-assistant-bot-vector-illustration.jpg?s=612x612&w=0&k=20&c=ZSG3eqGPDJgIgFUIuVxID64uVUF3eqM3LrrDWtaKses="
                                            alt="Chat AI"
                                            className="w-8 h-8 rounded-full mr-2 self-start"
                                        />
                                    )}
                                    <div
                                        className={`p-4 rounded-xl max-w-[90%] shadow-md transition-all duration-200 hover:shadow-lg ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: msg.text }}
                                    />
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="p-4 rounded-xl bg-gray-200 text-gray-600 shadow-md animate-pulse">
                                    Đang xử lý...
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex space-x-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={message}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập tin nhắn hoặc nói..."
                                className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400 pr-10"
                                disabled={!isAuthenticated}
                            />
                            <button
                                onClick={toggleRecording}
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                                    isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                                } hover:bg-opacity-80 transition-all duration-200`}
                                disabled={!isAuthenticated}
                            >
                                {isRecording ? <FaStop size={18} /> : <FaMicrophone size={18} />}
                            </button>
                        </div>
                        <button
                            onClick={handleSendMessage}
                            className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl p-3 font-semibold shadow-md hover:from-amber-500 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || !isAuthenticated}
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBot;