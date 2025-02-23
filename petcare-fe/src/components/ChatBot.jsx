import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import { FaRobot } from 'react-icons/fa';

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
    };

    const handleSendMessage = async () => {
        if (message.trim() === '') return;

        const userMessage = { sender: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            if (data.response) {
                const formattedResponse = formatBotResponse(data.response);
                simulateTypingEffect(formattedResponse);
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            setChatHistory(prev => [...prev, { sender: 'bot', text: 'Lỗi khi kết nối đến máy chủ AI.' }]);
            setIsLoading(false);
        }
    };

    const formatBotResponse = (response) => {
        try {
            const jsonData = JSON.parse(response);
            if (jsonData.status === "success" && jsonData.response) {
                let formattedText = jsonData.response
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br />');

                return formattedText;
            }
        } catch (e) {
            console.error('Lỗi parse JSON:', e);
        }
        return response.replace(/\n/g, '<br />');
    };

    const simulateTypingEffect = (fullText) => {
        let index = 0;
        const typingSpeed = 30;
        const botMessage = { sender: 'bot', text: '' };
        setChatHistory(prev => [...prev, botMessage]);

        const typingInterval = setInterval(() => {
            if (index < fullText.length) {
                botMessage.text += fullText[index];
                setChatHistory(prev => [...prev.slice(0, -1), botMessage]);
                index++;
            } else {
                clearInterval(typingInterval);
                setIsLoading(false);
            }
        }, typingSpeed);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className="fixed right-6 bottom-6 z-50">
            <button
                className={`bg-[#FBB321] text-white p-4 rounded-full shadow-xl hover:bg-amber-700 transition-all duration-300 ${isOpen ? 'hidden' : ''}`}
                onClick={toggleChat}
            >
                <FaRobot size={28} />
            </button>
            {isOpen && (
                <div className="bg-white shadow-2xl rounded-xl p-5 mt-3 w-[28rem] flex flex-col border border-gray-300">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-center">Chat với AI</h2>
                        <button className="text-gray-600 hover:text-gray-800" onClick={toggleChat}>
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto max-h-[23rem] border rounded-lg p-3 space-y-4 bg-gray-50">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.sender === 'bot' && (
                                    <div className="flex items-center space-x-2">
                                        <img src="https://media.istockphoto.com/id/1413286466/vector/chat-bot-icon-robot-virtual-assistant-bot-vector-illustration.jpg?s=612x612&w=0&k=20&c=ZSG3eqGPDJgIgFUIuVxID64uVUF3eqM3LrrDWtaKses=" alt="Chat AI" className="w-10 h-10 rounded-full" />
                                        <span className="font-semibold text-gray-700">Chat AI</span>
                                    </div>
                                )}
                                <div className={`p-3 rounded-lg w-fit max-w-xs ${msg.sender === 'user' ? 'bg-[#FBB321] text-white' : 'bg-gray-300 text-black'}`} dangerouslySetInnerHTML={{ __html: msg.text }} />
                            </div>
                        ))}
                        {isLoading && <div className="text-gray-500 text-sm animate-pulse">⏳ AI đang phản hồi...</div>}
                    </div>
                    <div className="mt-3 flex space-x-2">
                        <input type="text" value={message} onChange={handleInputChange} placeholder="Nhập tin nhắn..." className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none" />
                        <button onClick={handleSendMessage} className="bg-[#FBB321] text-white rounded-lg p-3 shadow-md hover:bg-amber-400 transition-all duration-300" disabled={isLoading}>
                            {isLoading ? '...' : 'Gửi'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBot;
