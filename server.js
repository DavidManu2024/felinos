const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins
app.use(cors());

// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {

  socket.on('disconnect', () => {

    users = users.filter( u => u.refid != socket.id);
    io.emit('dropped', users);

  });

  socket.on('user', ( user ) => {

    const isConnected = users.find( u => u.id == user.id );
    if( isConnected ) return;

    user.refid = socket.id;
    user.chats = [];
    users.push( user );
    io.emit('user', users); 

  });

  socket.on('message', msg => {

    for (let i = 0; i < users.length; i++) {
      if( users[i].id == msg.to ){
          users[i].chats.push( msg );
          io.emit('message', users[i]);
        break;
      }
    }

  });
});

const PORT = process.env.PORT || 6768;

// Start the server
server.listen(PORT, () => {
 // console.log(`Server running on port ${PORT}`);
});
