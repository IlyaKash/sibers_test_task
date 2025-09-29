import React from 'react';
import UserSearch from '../UserSearch/UserSearch';

/*
Modal wrapper for UserSearch.
Props:
  users: list of {id, name, avatar?}
  onSelect(user)
  onClose()
*/

/* Creates a modal window that contains a user search component providing a convenient interface for selecting a user */
export default function UserSearchModal({ users, onSelect, onClose }) {
  const handleSelect = (u) => {
    onSelect(u);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Select user</h3>
        {/* Passes a list of users from props */}
        <UserSearch users={users} onSelect={handleSelect} />
        <div style={{ marginTop: '12px', textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
