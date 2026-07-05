let io;

function initSocket(ioInstance) {
  io = ioInstance;

  io.on('connection', (socket) => {

        

    console.log('✅ socket: ' + socket);
    console.log('✅ New client connected: ' + socket.id);

    const userId = socket.handshake.query.authorization_id;
    console.log(`✅ New client connected: ${socket.id}, user ID: ${userId}`);

    // ✅ Join global notification room
    socket.on("join_room", (roomName) => {
      socket.join(roomName);
      console.log(`🟢 ${socket.id} joined room: ${roomName}`);
    });

    // Optional: Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected: " + socket.id);
    });

  });
}


function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
