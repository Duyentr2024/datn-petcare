// src/components/ChatBot.jsx
import React, { useState } from 'react';
import { FaComments } from 'react-icons/fa';

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState(''); 

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value); 
    };

    const handleSendMessage = () => {
        console.log(message);
        setMessage(''); 
    };

    return (
        <div className="fixed right-0 m-4" style={{ bottom: '150px' }}>
            <button 
                className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
                onClick={toggleChat}
            >
                <FaComments size={24} />
            </button>
            {isOpen && (
                <div className="bg-white shadow-lg rounded-lg p-4 mt-2 w-80">
                    <h2 className="text-lg font-bold">Chat với AI</h2>
                    <div className="mt-2">
                        <input 
                            type="text" 
                            value={message} 
                            onChange={handleInputChange} 
                            placeholder="Nhập tin nhắn của bạn..." 
                            className="border rounded p-2 w-full"
                        />
                        <button 
                            onClick={handleSendMessage} 
                            className="bg-blue-500 text-white rounded p-2 mt-2 w-full"
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBot;