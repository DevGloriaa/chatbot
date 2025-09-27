import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
        >
            {darkMode ? (
                <FaSun className="text-yellow-400 w-6 h-6 transition-transform duration-500 transform rotate-180" />
            ) : (
                <FaMoon className="text-gray-700 dark:text-gray-200 w-6 h-6 transition-transform duration-500 transform rotate-180" />
            )}
        </button>
    );
}
