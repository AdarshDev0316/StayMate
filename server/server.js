require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./src/config/socket');
const connectDB = require('./src/config/db');
const seedDummyData = require('./src/seedDummy');

const PORT = process.env.PORT || 5000;

console.log("URI from env:", process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + "..." : "undefined");
// Connect to MongoDB then start server
connectDB().then(async () => {
  // Run dummy seed data insertion (skips if they already exist)
  await seedDummyData();

  const server = http.createServer(app);
  
  // Initialize Socket.io
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`\n🚀 StayMate Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 URL: http://localhost:${PORT}\n`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
}).catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
