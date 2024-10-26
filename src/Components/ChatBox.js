import React, { useState } from 'react';
import './ChatBox.css';

const ChatBox = ({onResumeUpload}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim()) {
      setMessages(messages => [
        ...messages, 
        { role: "user", content: input }
      ]);
    }

    try{
    // Send the message to the server for processing and usage in API calls
    //uses the standard localhost endpoint for now, will most likely have a custom one
    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();

    setMessages(messages => [
      ...messages, 
      { role: "assistant", content: data.response } //assistant as in API
    ]);

    } catch (error) {
      console.error('Error generating a response:', error);
    }

    setInput(""); // Clear the input field after usage

  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevents adding a new line
      handleSend(); // Call the send function
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileURL = URL.createObjectURL(file);
      onResumeUpload(fileURL); // Pass the file URL to the parent component
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div className="chatbox-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div className={`message ${msg.role}`} key={index}>
          {msg.content} {/* Rendering just the content of each message */}
        </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="file"
          id="file-upload"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange} // Handle file change
        />
        <label htmlFor="file-upload" className="attach-btn">📎</label>
        <input
          type="text"
          placeholder="What are your suggestions for my resume?"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress} // Add the key press handler
        />
        <button className="send-btn" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;