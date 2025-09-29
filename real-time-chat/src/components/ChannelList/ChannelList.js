import React from 'react';

/*
Channel list component
Props:
  channels: [{id, name, ownerId}, ...]
  activeChannel: id of current channel
  onJoin(channelId)
  onLeave(channelId)
*/
/* Displays a list of all available channels and allows the user to join or leave channels */
export default function ChannelList({ channels, activeChannel, onJoin, onLeave }) {
  return (
    <div className="channel-list">
      <h3>Channels</h3>
      {channels.length === 0 && <div>No channels yet</div>}
      <ul>
        {channels.map(ch => (
          <li key={ch.id} className={activeChannel === ch.id ? 'active' : ''}>
            <div className="channel-row">
              <span className="channel-name">{ch.name}</span>
              <div className="channel-actions">
                {activeChannel === ch.id ? (
                  <button onClick={() => onLeave(ch.id)}>Leave</button>
                ) : (
                  <button onClick={() => onJoin(ch.id)}>Join</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
