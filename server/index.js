const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const {Server} = require('socket.io');
const usersData = require('./users.json');


/*
Creating an express instance
Enabling CORS
Enabling JSON
*/
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


//GET endpoint for getting a list of users that returns data from users.json
app.get('/api/users', (req, res) => {
    res.json(usersData);
});


//Creating a HTTP server and init Socket.io with CORS settings
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: '*'}});


//For the demonstration i used in-memory storage
//channels an object for storing channel data
const channels = {}; // channelId -> { name, ownerId, members: Set, messages: [] }
//userSockets mapping user IDs to socket IDs
const userSockets = {}; // userId -> socket.id 


//Event when a new client is connected
io.on('connection', (socket) =>{
    console.log('socket connected', socket.id);


    socket.on('register', (user) => {
        //Saving user data to a socket
        socket.user=user;
        //Writing a userID -> socketID mapping
        userSockets[user.id]=socket.id;
        console.log('registered user', user.id);
        //Sending the current channel list to a new user
        socket.emit('channels_list', Object.keys(channels).map(id => ({id, name: channels[id].name, ownerId: channels[id].ownerId})));
    });

    socket.on('create_channel', ({channelId, name})=> {
        //Verifying user authorization
        if (!socket.user) return;
        //Creating a new channel with the creator as the first member
        channels[channelId] = {name, ownerId: socket.user.id, members: new Set([socket.user.id]), messages: []};
        //Joining a channel room
        socket.join(channelId);
        //Sending an update channel list to all clients
        io.emit('channels_list', Object.keys(channels).map(id => ({id, name: channels[id].name, ownerId: channels[id].ownerId })));
        //Sending a list of members to everyone in the channel
        io.to(channelId).emit('member_list', Array.from(channels[channelId].members));
    });

    socket.on('join_channel', ({channelId}) => {
        if (!socket.user || !channels[channelId]) return;
        //Adding a user to a channel
        channels[channelId].members.add(socket.user.id);
        socket.join(channelId);
        //Updating the member list for everyone in the channel
        io.to(channelId).emit('member_list', Array.from(channels[channelId].members));
        //Sending message history to a new member
        socket.emit('channel_history', channels[channelId].messages);
    });

    socket.on('leave_channel', ({channelId}) => {
        if (!socket.user || !channels[channelId]) return;
        //Removing a user from the member list
        channels[channelId].members.delete(socket.user.id);
        socket.leave(channelId);
        //Updating the member list
        io.to(channelId).emit('member_list', Array.from(channels[channelId].members));
    });

    socket.on('send_message', ({channelId, text})=> {
        if (!socket.user || !channels[channelId]) return;
        //Creating a message object with a timestamp
        const msg = {id: Date.now(), sender: socket.user, text, ts: new Date().toISOString()};
        //Saving to channel history
        channels[channelId].messages.push(msg);
        //Broadcasting a message to all channel members
        io.to(channelId).emit('new_message', msg);
    });

    socket.on('kick_user', ({channelId, userId})=> {
        if (!socket.user || !channels[channelId]) return;
        //Checking permissions and only the owner can kick
        if (channels[channelId].ownerId !== socket.user.id) return socket.emit('error', 'only owner can kick');
        //Removing a user from the room
        channels[channelId].members.delete(userId);
        //Forcing an kicked user to leave the room
        const sid = userSockets[userId];
        if (sid) {
            const s = io.sockets.sockets.get(sid);
            if (s) {
                s.leave(channelId);
                //Notifying the kicked user
                s.emit('kicked', {channelId});
            }
        }
        //Update the list of members
        io.to(channelId).emit('member_list', Array.from(channels[channelId].members));
    });

    socket.on('disconnect', () => {
        //Clearing user records when disconnected
        if (socket.user){
            delete userSockets[socket.user.id];
        }
        console.log('disconnected', socket.id);
    });
});

//Starting the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log('Server listening on', PORT));