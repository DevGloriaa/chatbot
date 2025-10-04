import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Home() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        displayName: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const endpoint = isLogin
                ? "http://localhost:8000/auth/login"
                : "http://localhost:8000/auth/register";

            const body = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                    email: formData.email,
                    displayName: formData.displayName,
                    password: formData.password,
                };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            let data = {};
            const text = await response.text();
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    throw new Error("Server did not return valid JSON");
                }
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || "Authentication failed");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.email);

            setSuccess(isLogin ? "Login successful! ✅" : "Registration successful! ✅");

            setTimeout(() => {
                navigate("/chat");
            }, 1000);
        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    };

    return (
        <div className="home-container">
            <div className="hero">
                <h1 className="hero-title">Welcome to Kos 🤖</h1>
                <p className="hero-subtitle">
                    Your personal chatbot and assistant. Register or login to continue!
                </p>
            </div>

            <div className="auth-section">
                <h2>{isLogin ? "Login" : "Register"}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {!isLogin && (
                        <input
                            type="text"
                            name="displayName"
                            placeholder="Display Name"
                            value={formData.displayName}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button type="submit">
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <p>
                    <div className="toggle">
                        {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
                        <span onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? "Register here" : "Login here"}
                        </span>
                    </div>
                </p>
            </div>
        </div>
    );
}

export default Home;
