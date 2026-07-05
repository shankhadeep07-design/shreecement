require("dotenv").config();
const app = require('./src/app');
const { Server } = require('socket.io');
const http = require('http');
const { initSocket } = require("./src/config/socket");


// Import cron jobs
require('./src/jobs/eventReminder.job');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/api/v1/socket.io'
});

initSocket(io); // ✅ pass the instance, don't create a new one inside

const PORT = process.env.PORT || 5000;



server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Or handle more gracefully
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});
