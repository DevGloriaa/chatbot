export function getBotResponse(input) {
    const text = input.toLowerCase();

    if (text.includes("hello")) return "Hello there! 👋 I'm Kos.";
    if (text.includes("bye")) return "Goodbye! Take care 😊";
    if (text.includes("how are you")) return "I'm Kos, and I'm doing great 🚀";
    if (text.includes("your name")) return "My name is Kos — nice to meet you! 🤖";

    return "Hmm... I'm not sure I understand that yet 😅";
}
