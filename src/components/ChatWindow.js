import React, { useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import { getBotResponse } from "../utils/botResponses";

export default function ChatWindow() {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hi! I'm Kos. How can I help you today?" }
    ]);


    const handleSend = (text) => {
        if (!text.trim()) return;

        const newMessage = { sender: "user", text };
        setMessages([...messages, newMessage]);

        setTimeout(() => {
            const botReply = getBotResponse(text);
            setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
        }, 600);
    };

    return (
        <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col h-[80vh]">
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {messages.map((msg, i) => (
                    <Message key={i} sender={msg.sender} text={msg.text} />
                ))}
            </div>
            <InputBox onSend={handleSend} />
        </div>
    );
}
