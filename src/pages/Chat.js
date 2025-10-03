import React, { useState, useEffect } from "react";
import "../styles/chatbot.css";
import ThemeToggle from "../components/ThemeToggle";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [currentTopic, setCurrentTopic] = useState("general");
    const [tasks, setTasks] = useState([]);

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
                    text: `Hi ${parsedUser.email}, what can I do for you today? 🤖`,
                    sender: "bot",
                },
            ]);

            // fetch user tasks from Optimus using email + token
            fetch(`http://localhost:8000/api/tasks?email=${parsedUser.email}`, {
                headers: {
                    Authorization: `Bearer ${parsedUser.token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.tasks) setTasks(data.tasks);
                })
                .catch((err) => console.error(err));
        } else {
            setMessages([
                { text: "Hello! I’m Kos 🤖. Please log in to continue.", sender: "bot" },
            ]);
        }
    }, []);

    const fetchRelevantMemories = async (keyword) => {
        try {
            const res = await fetch(`http://localhost:8000/api/memory/search/${keyword}`);
            if (!res.ok) throw new Error("Memory fetch failed");
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const getBotReply = async (userMessage) => {
        try {
            const res = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    email: user?.email,
                }),
            });

            if (!res.ok) throw new Error("AI API request failed");
            const data = await res.json();
            return data.text || "Sorry, I couldn't respond.";
        } catch (err) {
            console.error(err);
            return "⚠️ Sorry, I couldn’t respond. Please try again.";
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");
        setIsLoading(true);

        try {
            setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);

            const relevantMemories = await fetchRelevantMemories(userMessage);
            const botReply = await getBotReply(userMessage);

            setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);

            await fetch("http://localhost:8000/api/memory/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userMessage,
                    botResponse: botReply,
                    topic: currentTopic,
                    email: user?.email,
                }),
            });
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { text: "⚠️ Sorry, I couldn’t process your request.", sender: "bot" },
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

            {tasks.length > 0 && (
                <div className="tasks-section">
                    <h4>Your tasks:</h4>
                    <ul>
                        {tasks.map((t, i) => (
                            <li key={i}>{t}</li>
                        ))}
                    </ul>
                </div>
            )}

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
