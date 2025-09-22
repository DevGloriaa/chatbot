import React, { useState } from "react";
import "../styles/chatbot.css";

function Chat() {
    const [messages, setMessages] = useState([
        { text: "Hello! I’m Kos 🤖. How can I help you today?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (input.trim() === "") return;

        setMessages((prev) => [...prev, { text: input, sender: "user" }]);
        const userMessage = input;
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error("API request failed");

            const data = await response.json();
            setMessages((prev) => [...prev, { text: data.message, sender: "bot" }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { text: "Sorry, I couldn’t respond. 😢", sender: "bot" },
            ]);
        } finally {
            setIsLoading(false);
        }
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
                {isLoading && <div className="message bot">Kos is typing...</div>}
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
