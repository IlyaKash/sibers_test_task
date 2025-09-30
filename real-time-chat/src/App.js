import './App.css';
import React, {useEffect, useState, useRef} from 'react';
import io from 'socket.io-client';
import { fetchUsers } from './api/api';
import ChannelList from './components/ChannelList/ChannelList';
import ChatWindow from './components/ChatWindow/ChatWindow';
import CreateChannelModal from './components/CreateChannelModal/CreateChannelModal';
import UserSearchModal from './components/UserSearchModal/UserSearchModal';
import UserList from './components/UserList/UserList';


const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function App() {
  
  const [socket, setSocket]=useState(null);//object of socket connection
  const [user, setUser]=useState(null);//current logged user
  const [users, setUsers]=useState([]);//list of all users
  const [channels, setChannels]=useState([]);//list of all available channels
  const [activeChannel, setActiveChannel]=useState(null);//ID of the current active channel
  const [members, setMembers]=useState([]);//members of the active channel
  const [messages, setMessages]=useState([]);//messages of the active channel
  const [showCreate, setShowCreate]=useState(false);//flags for displaying modal windows
  const [showUserModal, setShowUserModal] = useState(false);
  

  const socketRef=useRef(null);//socket reference for access from handlers
  const activeChannelRef = useRef(null);//activeChannel reference

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  // When mounting the component it downloads the list of users from the server and saves it in the users state
  useEffect(() =>{
    fetchUsers().then(setUsers).catch(err => console.error(err));
  }, []);

  /* A connection to the server is created, 
     a reference to the socket in socketRef and the state are saved,
     and event handlers are configured */
  useEffect(() => {
    const s= io(SOCKET_URL, {transports: ['websocket', 'polling']});
    socketRef.current=s;
    setSocket(s);


    //socket event handlers
    s.on('connect', () => {
      console.log('connected to socket', s.id);
    });

    // Receives an updated list of channels from the server
    s.on('channels_list', (list)=>{
      setChannels(list);
    });

    // Gets a list of members of the current channel
    s.on('member_list', (list)=>{
      setMembers(list);
    });

    // Gets a message history when enterign a channel
    s.on('channel_history', (history)=>{
      setMessages(history || []);
    });

    // Adds a new messsage to the end of the list
    s.on('new_message', (msg) =>{
      setMessages(prev => [...prev, msg]);
    });

    // Handles the exclusion of a user from a channel
    s.on('kicked', ({channelId}) => {
      // Use ref instead of state
      if (activeChannelRef.current === channelId){
        setActiveChannel(null);
        setMessages([]);
        setMembers([]);
        alert('You have been kicked from the channel.');
      }
    });

    // Handles socket disconection
    s.on('disconnect', ()=>{
      console.log('socket disconnected');
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Registres a user on the server
  const handleSelectUser = (u) => {
    setUser(u);
    if (socketRef.current){
      socketRef.current.emit('register', u);
    }
  };
  
  // Creates a new channel and hides the modal window
  const handleCreateChannel = (channelId, name) =>{
    if (!socketRef.current) return;
    socketRef.current.emit('create_channel', {channelId, name});
    setShowCreate(false);
  };

  // Entrance to the channel
  const handleJoinChannel = (channelId) => {
    if (!socketRef.current) return;
    if (activeChannel && activeChannel !== channelId) {
      socketRef.current.emit('leave_channel', {channelId: activeChannel});
    }
    socketRef.current.emit('join_channel', {channelId});
    setActiveChannel(channelId);
  };

  // Exit from the channel
  const handleLeaveChannel = (channelId) =>{
    if (!socketRef.current) return;
    socketRef.current.emit('leave_channel', {channelId});
    if (activeChannel === channelId){
      // Clearing the states
      setActiveChannel(null);
      setMessages([]);
      setMembers([]);
    }
  };

  // Clears the states on exit
  const handleLogOut = () => {
    setActiveChannel(null);
    setMembers([]);
    setMessages([]);
    setUser(null);
    setChannels([]);
  }

  // Sends a message to the active channel
  const handleSendMessage = (text) =>{
    if (!socketRef.current || !activeChannel) return;
    socketRef.current.emit('send_message', {channelId: activeChannel, text});
  };

  // Kick a user from the channel (owner only)
  const handleKickUser = (userId) =>{
    if (!socketRef.current || !activeChannel) return;
    socketRef.current.emit('kick_user', {channelId: activeChannel, userId});
  };



  return (
     <div className="App">
      <header className="header">
        <h1>Real-Time Chat</h1>
        <div className="header-right">
          {/* A login button that when clicked opens the modal window for selecting a user */}
          {!user ? (
            <button onClick={() => setShowUserModal(true)}>Login</button>
          ) : (
            <>
              {/* Displays the user and the logout button */}
              <div className="current-user">Logged as <b>{user.name}</b></div>
              <button onClick={handleLogOut}>Logout</button>
            </>
          )}
          {/* The button opens a modal window for creating a channel */}
          <button onClick={() => setShowCreate(true)} disabled={!user}>Create channel</button>
        </div>
      </header>

      <main className="main">
        <aside className="sidebar">
          {/* The list of channels */}
          <ChannelList
            channels={channels}
            activeChannel={activeChannel}
            onJoin={handleJoinChannel}
            onLeave={handleLeaveChannel}
          />
        </aside>

        <section className="content">
          {/* The chat window */}
          <ChatWindow
            user={user}
            members={members}
            messages={messages}
            onSend={handleSendMessage}
            onKick={handleKickUser}
            activeChannel={activeChannel ? channels.find(c => c.id === activeChannel)?.name : null}
          />
        </section>
        <aside className='sidebar'>
          {/* The list of users with the ability for the owner to exclude them */}
          <UserList 
            members={members}
            users={users}
            currentUser={user}
            ownerId={channels.find(c => c.id === activeChannel)?.ownerId}
            onKick={handleKickUser}
          />
        </aside>
      </main>

      {/* Modal windows */}
      {showCreate && <CreateChannelModal onClose={() => setShowCreate(false)} onCreate={handleCreateChannel} />}
      {showUserModal && ( <UserSearchModal users={users} onSelect={handleSelectUser} onClose={() => setShowUserModal(false)}  />)}

      <footer className="footer">
        <small>Simple real-time-chat for sibers</small>
      </footer>
    </div>
  );
}

export default App;
