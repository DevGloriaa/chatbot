import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/chatbot.css";
import ThemeToggle from "../components/ThemeToggle";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [user, setUser] = useState(null);
    const [currentTopic, setCurrentTopic] = useState("general");
    const messagesEndRef = useRef(null);


    const TASK_API = "https://taskmanagerapi-1-142z.onrender.com/api";
    const OPTIMUS_API = "http://localhost:8000/api";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
                { text: `Hi ${storedDisplayName}, what can I do for you today? 🤖`, sender: "bot" },
            ]);
        } else {
            setMessages([{ text: "Hello! I’m Kos 🤖. Please log in to continue.", sender: "bot" }]);
        }
    }, []);

    const isTaskQuery = (message) => {
        const lowered = message.toLowerCase();
        const taskKeywords = ["task", "tasks", "todo", "to-do", "remind", "pending", "things to do"];
        const todayKeywords = ["today", "tonight", "this evening", "this morning"];
        return taskKeywords.some((kw) => lowered.includes(kw)) && todayKeywords.some((kw) => lowered.includes(kw));
    };

    const fetchTasksForToday = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${TASK_API}/tasks/today`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);

            const data = await res.json();
            if (!data || !Array.isArray(data) || data.length === 0) {
                return "✅ You don’t have any tasks for today.";
            }

            return "📋 **Here are your tasks for today:**\n\n" +
                data.map((t, i) => `${i + 1}. ${t.title}`).join("\n");
        } catch (err) {
            console.error("fetchTasksForToday error:", err);
            return "⚠️ Sorry, I couldn’t fetch your tasks right now.";
        }
    };

    const getBotReply = async (userMessage) => {
        try {
            const token = localStorage.getItem("token");

            if (isTaskQuery(userMessage)) {
                return await fetchTasksForToday();
            }

            const res = await fetch(`${OPTIMUS_API}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: userMessage, email: user?.email }),
            });

            if (!res.ok) throw new Error("AI API request failed");

            const data = await res.json();
            return data.text || "⚠️ Sorry, I couldn’t respond.";
        } catch (err) {
            console.error("getBotReply error:", err);
            return "⚠️ Sorry, I couldn’t respond. Please try again.";
        }
    };

    const typeBotMessage = async (fullText) => {
        setMessages((prev) => [...prev, { text: null, sender: "bot", typing: true }]);
        for (let i = 0; i < fullText.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 15));
            setMessages((prev) => {
                const updated = [...prev];
                const typingIndex = updated.findIndex((m) => m.typing);
                if (typingIndex !== -1) {
                    updated[typingIndex] = {
                        text: fullText.slice(0, i + 1),
                        sender: "bot",
                        typing: true,
                    };
                }
                return updated;
            });
        }
        setMessages((prev) => {
            const updated = [...prev];
            const typingIndex = updated.findIndex((m) => m.typing);
            if (typingIndex !== -1) {
                updated[typingIndex] = { text: fullText, sender: "bot" };
            }
            return updated;
        });
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);

        try {
            const botReply = await getBotReply(userMessage);
            await typeBotMessage(botReply);

            const token = localStorage.getItem("token");
            await fetch(`${OPTIMUS_API}/memory/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userMessage,
                    botResponse: botReply,
                    topic: currentTopic,
                    email: user?.email,
                }),
            });
        } catch (err) {
            console.error("handleSend error:", err);
            setMessages((prev) => [
                ...prev,
                { text: "⚠️ Sorry, I couldn’t process your request.", sender: "bot" },
            ]);
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
                        className={`message-bubble ${
                            msg.sender === "user"
                                ? "user-bubble"
                                : msg.typing
                                    ? "typing-bubble"
                                    : "bot-bubble"
                        }`}
                    >
                        {msg.typing ? (
                            <>
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
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
