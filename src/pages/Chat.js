import React, { useState, useEffect } from "react";
import "../styles/chatbot.css";
import ThemeToggle from "../components/ThemeToggle";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);


    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.className = savedTheme;
    }, []);

  
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

            setMessages([
                {
                    text: `Hi ${parsedUser.displayName}, what can I do for you today? 🤖`,
                    sender: "bot",
                },
            ]);
        } else {
            setMessages([
                { text: "Hello! I’m Kos 🤖. Please log in to continue.", sender: "bot" },
            ]);
        }
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnbG8ub2Jpb3JhaEBnbWFpbC5jb20iLCJpYXQiOjE3NTkwMTMzOTUsImV4cCI6MTc1OTA5OTc5NX0.DdGCr6RjenEzOQ2mKtnU1nAA_g7oOYO0niWVDZWljdE",
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error("API request failed");

            const data = await response.json();

            if (Array.isArray(data.tasks)) {
                if (data.tasks.length === 0) {
                    setMessages((prev) => [
                        ...prev,
                        { text: "You don’t have any tasks for today 🎉", sender: "bot" },
                    ]);
                } else {
                    const taskList = data.tasks
                        .map(
                            (task, i) =>
                                `${i + 1}. ${task.title}${
                                    task.dueDate ? ` (📅 ${task.dueDate})` : ""
                                }`
                        )
                        .join("\n");

                    setMessages((prev) => [
                        ...prev,
                        { text: `Here are your tasks for today:\n${taskList}`, sender: "bot" },
                    ]);
                }
            } else {
                setMessages((prev) => [...prev, { text: data.message, sender: "bot" }]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { text: "⚠️ Sorry, I couldn’t respond. Please try again.", sender: "bot" },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2 className="chat-title">Kos 🤖</h2>
                <ThemeToggle />
            </div>

            <div className="messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.sender === "user" ? "user" : "bot"}`}
                    >
                        {msg.text.split("\n").map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                ))}
                {isLoading && <div className="message bot typing">Kos is typing...</div>}
            </div>

            {user && (
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
            )}
        </div>
    );
}

export default Chat;
