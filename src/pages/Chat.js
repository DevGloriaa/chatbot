import React, { useState } from "react";
import "../styles/chatbot.css";


function Chat() {
    const [messages, setMessages] = useState([
        { text: "Hello! I’m Kos 🤖. How can I help you today?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim() === "") return;

        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { text: "I'm still learning but I hear you 😊", sender: "bot" },
            ]);
        }, 1000);
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === "user" ? "user" : "bot"}`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>

            <div className="input-container">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} className="send-button">
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;
