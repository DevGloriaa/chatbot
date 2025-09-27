import React from "react";
import ThemeToggle from "./ThemeToggle";

function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kos 🤖
            </h1>

            <div className="flex items-center">
                <ThemeToggle />
            </div>
        </header>
    );
}

export default Header;
