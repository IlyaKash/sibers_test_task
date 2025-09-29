import React from "react";

/*
UserList component
Props:
  members: array of userIds
  users: full list of users data
  currentUser: current authorized user
  ownerId: id of the channel owner
  onKick(userId): callback function to exclude a user
*/
export default function UserList({ members, users, currentUser, ownerId, onKick }) {
  const getUser = (id) => users.find(u => u.id === id);

  return (
    <div className="user-list">
      <h3>Members</h3>
      {members.length === 0 && <div>No users yet</div>}
      {/* List of members */}
      <ul>
        {/* Iterates through the array of member IDs */}
        {members.map(uid => {
          const u = getUser(uid) || { id: uid, name: uid };
          return (
            <li key={u.id}>
              <div className="user-row">
                <span className="user-name">{u.name}</span>
                <div className="user-actions">
                  {/* Show Kick button only if current user is owner and not kicking himself */}
                  {currentUser?.id === ownerId && u.id !== currentUser.id && (
                    <button onClick={() => onKick(u.id)}>Kick</button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
