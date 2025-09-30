import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './CreateChannelModal.css'

/*
Simple modal to create a channel.
Props:
  onCreate(channelId, name)
  onClose()
*/

/* Provides the user with an interface for creating a new chat channel in the form of a modal window */
export default function CreateChannelModal({ onCreate, onClose }) {
  const [name, setName] = useState('');

  const submit = (e) => {
    e.preventDefault(); // Prevents page reload
    if (!name.trim()) return; // Don't create a channel with an empty name
    const id = uuidv4(); // Generates a unique ID for the channel
    onCreate(id, name.trim()); // Calls a callback with the ID and name
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Create channel</h3>
        <form onSubmit={submit}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Channel name" />
          <div className="modal-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
