import React from "react";

export default function Message({ sender, text }) {
    return (
        <div
            className={`p-2 rounded-lg max-w-[75%] ${
                sender === "user"
                    ? "bg-blue-600 self-end text-right"
                    : "bg-gray-700 self-start"
            }`}
        >
            {text}
        </div>
    );
}
