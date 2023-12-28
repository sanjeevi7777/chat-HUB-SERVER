const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.255.161:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

 
  socket.on("join_room", (data, callback) => {
    const room = io.sockets.adapter.rooms.get(data);

    if (room && room.size > 0) {
      // Room exists and has at least one client
      socket.join(data);
      console.log(`User with ID: ${socket.id} joined room: ${data}`);
      if (callback) {
        callback("RoomExists");
      }
    } else {
      // Room does not exist or is empty; send a message to the client
      console.log(`Room ${data} does not exist or is empty`);
      if (callback) {
        callback("RoomNotFound");
      }
    }
  });

  socket.on("create_room", (data) => {
    socket.join(data);
    console.log(data);
    console.log('New Room Created');
  });
  socket.on("user_joined_send", (data) => {
    console.log(data);
    socket.to(data.room).emit("user", data);
  });
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sanjeevi:Dhon!777@cluster0.vuwajra.mongodb.net/chat_users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define a Mongoose schema for user data
// Define a Mongoose schema for user data
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true }, // Set email as unique
  username: String,
});

const User = mongoose.model('User', userSchema);

app.use(express.json());

// Route to handle storing user data
// Route to handle storing user data
app.post('/storeUserData', async (req, res) => {
  try {
    const { email, username } = req.body;

    // Create a new user document
    const newUser = new User({ email, username });

    // Save the user data to the database
    await newUser.save();

    res.status(201).json({ message: 'User data stored successfully!' });
  } catch (error) {
    if (error.code === 11000 && error.keyValue && error.keyValue.email) {
      // Handle the duplicate key error (email already exists)
      console.error('Error storing user data - Duplicate email:', error);
      res.status(201).json({ error: 'Email already exists' });
    } else {
      console.error('Error storing user data:', error);
      res.status(500).json({ error: 'Failed to store user data' });
    }
  }
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
