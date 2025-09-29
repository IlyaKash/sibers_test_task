import React, { useState, useRef, useEffect } from 'react';

/*
Chat window:
Props:
  user: current user object or null
  members: array of userIds in current channel
  messages: array of message objects {id, sender, text, ts}
  onSend(text)
  onKick(userId)
  activeChannel: channel name string to display
*/

/* 
  This component is the main chat window where messages are displayed and communication takes place
  Displays a real-time communication interface: shows messages, channel participants, and provides a form for sending new messages.
*/
export default function ChatWindow({ user, members, messages, onSend, activeChannel }) {
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    // Every time you update messages, automatically scroll the chat window down to show the most recent messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return; // Dont send empty messages
    onSend(text.trim()); // Call the send func
    setText(''); // Cleare the input
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{activeChannel ? `Channel: ${activeChannel}` : 'No active channel'}</h2>
        <div className="members">
          <strong>Members:</strong>
          {members.length === 0 ? <span> — </span> : members.map(mid => (
            <span key={mid} className="member-pill">{mid}</span>
          ))}
        </div>
      </div>

      <div className="messages" ref={scrollRef}>
        {/* Each message contains:
            Sender's name
            Timestamp in human-readable format
            Message text 
        */}
        {messages.map(m => (
          <div className="message" key={m.id}>
            <div className="message-header">
              <span className="sender">{m.sender?.name || m.sender?.id}</span>
              <span className="ts">{new Date(m.ts).toLocaleString()}</span>
            </div>
            <div className="message-text">{m.text}</div>
          </div>
        ))}
      </div>

      {/* You can only write messages after authorization and channel selection */}
      <form className="composer" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={user ? 'Write a message...' : 'Choose a user first'}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={!user || !activeChannel}
        />
        <button type="submit" disabled={!user || !activeChannel}>Send</button>
      </form>
    </div>
  );
}
