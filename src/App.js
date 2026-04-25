import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState({ chat1: [] });
  const [currentChat, setCurrentChat] = useState("chat1");
  const [chatTitles, setChatTitles] = useState({ chat1: "New Chat" });
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate title from first message
  const generateTitle = (text) => {
    return text.length > 20 ? text.substring(0, 20) + "..." : text;
  };

  const startNewChat = () => {
    const newId = "chat" + (Object.keys(chats).length + 1);
    setChats((prev) => ({ ...prev, [newId]: [] }));
    setChatTitles((prev) => ({ ...prev, [newId]: "New Chat" }));
    setMessages([]);
    setCurrentChat(newId);
  };

  const switchChat = (chatId) => {
    setCurrentChat(chatId);
    setMessages(chats[chatId] || []);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };

    // Set title if first message
    if (!chatTitles[currentChat] || chatTitles[currentChat] === "New Chat") {
      setChatTitles((prev) => ({
        ...prev,
        [currentChat]: generateTitle(input),
      }));
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Add empty assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("https://ai-chat-backend-r8jz.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentChat,
          message: input,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let fullText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value || new Uint8Array());
        fullText += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: fullText,
          };
          return updated;
        });
      }

      setIsTyping(false);

      setChats((prev) => ({
        ...prev,
        [currentChat]: [
          ...(prev[currentChat] || []),
          userMessage,
          { role: "assistant", content: fullText },
        ],
      }));

    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <button className="new-chat" onClick={startNewChat}>
          + New Chat
        </button>

        <div className="chat-list">
          {Object.keys(chats).map((chatId) => (
            <div
              key={chatId}
              className={`chat-item ${chatId === currentChat ? "active" : ""}`}
              onClick={() => switchChat(chatId)}
            >
              {chatTitles[chatId]}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
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
              <div className="typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-box">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;