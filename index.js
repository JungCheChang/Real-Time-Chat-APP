const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages.js');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users.js');
//const formatMessage = require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botname = 'ChatApp Bot';

//Run when client connects
io.on('connection', socket =>{

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome current user
        socket.emit('message',formatMessage(botname,  'Welcome to ChatApp'));

        //Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botname, `${user.username} has joined the chat`)
            );
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    //Listen for cahtmessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    //Run when client disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        
        if(user) {
            io.to(user.room).emit('message',formatMessage(botname, `${user.username} has left the chat`));

          // Send users and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
            });
        }
        
        
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`)); 