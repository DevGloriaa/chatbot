import React from "react";
import Header from "./components/Header";
import Chat from "./components/Chat";

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
            <Header />
            <Chat />
        </div>
    );
}

export default App;
