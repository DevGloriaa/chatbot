import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Home.css";

function Home() {
    return (
        <div className="home-container">
            <div className="hero">
                <h1 className="hero-title">Welcome to Kos 🤖</h1>
                <p className="hero-subtitle">
                    Your personal chatbot built with React. Start chatting now!
                </p>
                <Link to="/chat" className="hero-button">
                    Start Chatting
                </Link>
            </div>
        </div>
    );
}

export default Home;
