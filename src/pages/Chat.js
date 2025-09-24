import React, { useState, useEffect } from "react";
import "../styles/chatbot.css";

function Chat() {
    const [messages, setMessages] = useState([
        { text: "Hello! I’m Kos 🤖. How can I help you today?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/tasks/today");
                if (!response.ok) throw new Error("Failed to fetch tasks");
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            }
        };
        fetchTasks();
    }, []);

    const handleSend = async () => {
        if (input.trim() === "") return;
        setMessages((prev) => [...prev, { text: input, sender: "user" }]);
        const userMessage = input;
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJnbG8ub2Jpb3JhaEBnbWFpbC5jb20iLCJpYXQiOjE3NTg3NTE4MzQsImV4cCI6MTc1ODgzODIzNH0.0iyxOuRwQN27YPiWrS0xye1Uyez2W-z-9JRvbhLqkkw"
                },
                body: JSON.stringify({ message: userMessage }),
            });
            if (!response.ok) throw new Error("API request failed");
            const data = await response.json();
            setMessages((prev) => [...prev, { text: data.message, sender: "bot" }]);
        } catch (error) {
            setMessages((prev) => [...prev, { text: "Sorry, I couldn’t respond. 😢", sender: "bot" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === "user" ? "user" : "bot"}`}>
                        {msg.text}
                    </div>
                ))}
                {isLoading && <div className="message bot">Kos is typing...</div>}
            </div>

            <div className="tasks-container">
                <h3>Today's Tasks:</h3>
                {tasks.length === 0 ? (
                    <p>No tasks scheduled for today</p>
                ) : (
                    <div className="tasks-list">
                        {tasks.map((task) => (
                            <div key={task.id} className="task-card">
                                <h4>{task.title}</h4>
                                <p>{task.description}</p>
                                <p><strong>Priority:</strong> {task.priority}</p>
                                <p><strong>Status:</strong> {task.status}</p>
                                <p><strong>Due:</strong> {task.dueDate}</p>
                            </div>
                        ))}
                    </div>
                )}
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
                <button onClick={handleSend} className="send-button">Send</button>
            </div>
        </div>
    );
}

export default Chat;
