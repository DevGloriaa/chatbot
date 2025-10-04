import React, { useState, useEffect } from "react";
import "../styles/chatbot.css";
import ThemeToggle from "../components/ThemeToggle";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [currentTopic, setCurrentTopic] = useState("general");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.className = savedTheme;
    }, []);

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        const storedDisplayName = localStorage.getItem("displayName");

        if (storedEmail && storedDisplayName) {
            setUser({ email: storedEmail, displayName: storedDisplayName });
            setMessages([
                {
                    text: `Hi ${storedDisplayName}, what can I do for you today? 🤖`,
                    sender: "bot",
                },
            ]);
        } else {
            setMessages([
                { text: "Hello! I’m Kos 🤖. Please log in to continue.", sender: "bot" },
            ]);
        }
    }, []);

    const fetchRelevantMemories = async (keyword) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8000/api/memory/search/${keyword}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Memory fetch failed");
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const fetchTasksForToday = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const res = await fetch("http://localhost:8081/tasks/today", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch tasks");

            let data;
            try {
                data = await res.json();
            } catch {
                return "⚠️ Invalid response from Optimus backend";
            }

            if (!data || !Array.isArray(data) || data.length === 0) {
                return "✅ You don’t have any tasks for today.";
            }

            return "📋 Here are your tasks for today:\n\n" +
                data.map((t, i) => `${i + 1}. ${t.title} (Due: ${t.dueDate || "N/A"})`).join("\n");

        } catch (err) {
            console.error(err);
            return "⚠️ Sorry, I couldn’t fetch your tasks right now. Make sure you’re logged in.";
        }
    };

    const isTaskQuery = (message) => {
        const lowered = message.toLowerCase();
        const taskKeywords = [
            "task", "tasks", "todo", "to-do", "remind", "pending", "due", "things to do"
        ];
        const todayKeywords = ["today", "tonight", "this evening", "this morning"];

        return (
            taskKeywords.some((kw) => lowered.includes(kw)) &&
            todayKeywords.some((kw) => lowered.includes(kw))
        );
    };

    const getBotReply = async (userMessage) => {
        try {
            if (isTaskQuery(userMessage)) {
                return await fetchTasksForToday();
            }

            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMessage,
                    email: user?.email,
                }),
            });

            if (!res.ok) throw new Error("AI API request failed");

            let data;
            try {
                data = await res.json();
            } catch {
                return "⚠️ Invalid response from server";
            }

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

            const token = localStorage.getItem("token");
            await fetch("http://localhost:8000/api/memory/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
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
