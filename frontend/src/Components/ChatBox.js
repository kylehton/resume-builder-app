import React, { useState } from 'react';
import './ChatBox.css';

const ChatBox = ({ onResumeUpload, onDownloadClick }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim()) {
      setMessages(messages => [
        ...messages,
        { role: "user", content: input }
      ]);
    }

    try {
      // Send the message to the server for processing
      const response = await fetch('https://resume-builder-backend-mu.vercel.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      setMessages(messages => [
        ...messages,
        { role: "assistant", content: data.response } // Assistant message
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
          <div
            className={`message ${msg.role}`} // use msg.role for styling
            key={index}
          >
            {msg.content} {/* Correctly rendering the content */}
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
        <button className='finished-btn' onClick={onDownloadClick}>Finished</button>
      </div>
    </div>
  );
};

export default ChatBox;
