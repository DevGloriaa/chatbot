import React from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    return (
        <header className="flex justify-between items-center px-8 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Left side - Logo/Title */}
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center">
                Kos <span className="ml-2 text-3xl">🤖</span>
            </h1>

            <ThemeToggle />
        </header>
    );
}
