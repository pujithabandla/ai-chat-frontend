import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://ai-chat-backend-r8jz.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: "user1",
            message: input,
          }),
        }
      );

      const data = await response.json();

      const botMessage = {
        role: "assistant",
        content: data.response || "No response",
      };

      // Add bot response
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error connecting to server",
        },
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="header">AI Chat</div>

        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-row ${msg.role}`}>
              <div className="avatar">
                {msg.role === "user" ? "🧑" : "🤖"}
              </div>

              <div className={`message ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row assistant">
              <div className="avatar">🤖</div>
              <div className="typing">Typing...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-box">
          <input
            type="text"
            value={input}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;