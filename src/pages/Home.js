import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">Welcome to Kos 🤖</h1>
            <p className="mb-6 text-gray-300">
                Your friendly chatbot assistant. Click below to start chatting!
            </p>

            <Link
                to="/chat"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl"
            >
                Start Chatting
            </Link>
        </div>
    );
}
