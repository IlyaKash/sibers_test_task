import React, { useState } from 'react';
import './UserSearch.css'

/*
User search
Props:
  users: list of {id, name}
  onSelect(user)
*/

/* This component implements a simple search by name */
export default function UserSearch({ users = [], onSelect }) {
  /* 
  Accepts an array of users
  Filters it, leaving only those users whose name contains the search query
  Converts both values ​​to lowercase for case-insensitive searching
  Returns the filtered array
  */
  const [q, setQ] = useState('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="user-search">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users..." />
      <div className="search-results">
        {filtered.map(u => (
          <div key={u.id} className="search-row">
            <span>{u.name}</span>
            <button onClick={() => onSelect(u)}>Select</button>
          </div>
        ))}
        {filtered.length === 0 && <div>No users found</div>}
      </div>
    </div>
  );
}
