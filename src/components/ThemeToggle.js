import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

function ThemeToggle() {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        document.documentElement.className = theme;
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleTheme}
            className="toggle-btn"
        >
            {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
    );
}

export default ThemeToggle;
