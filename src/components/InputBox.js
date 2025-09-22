import React, { useState } from "react";

export default function InputBox({ onSend }) {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input);
        setInput("");
    };

    return (
        <div className="flex">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 rounded-l-lg bg-gray-700 text-white outline-none"
                placeholder="Type a message..."
            />
            <button
                onClick={handleSend}
                className="bg-blue-600 px-4 py-2 rounded-r-lg"
            >
                Send
            </button>
        </div>
    );
}
