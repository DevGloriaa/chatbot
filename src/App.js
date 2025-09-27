import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.js";
import Chat from "./pages/Chat.js";

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<Chat />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
