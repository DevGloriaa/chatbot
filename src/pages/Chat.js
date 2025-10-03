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

    const fetchTasks = async () => {
        try {
            const email = user?.email;
            const token = user?.token;

            const res = await fetch(`http://localhost:8000/api/tasks?email=${email}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch tasks");
            const data = await res.json();

            if (!data.tasks || data.tasks.length === 0) {
                return "✅ You don't have any tasks for today.";
            }

            return "Here are your tasks for today:\n- " + data.tasks.join("\n- ");
        } catch (err) {
            console.error(err);
            return "⚠️ Sorry, I couldn’t fetch your tasks right now.";
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
                return await fetchTasks();
            }

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
