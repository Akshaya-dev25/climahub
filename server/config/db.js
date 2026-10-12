const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServerInstance = null;

// Helper to check if a port is already open/listening
const isPortInUse = (port, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/climahub';

    // If configured to use local MongoDB (127.0.0.1 or localhost)
    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      const port = 27017;
      const inUse = await isPortInUse(port);

      if (!inUse) {
        const dataDir = path.resolve(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        console.log(`[Local MongoDB] Starting embedded server with persistent data at: ${dataDir}`);
        mongoServerInstance = await MongoMemoryServer.create({
          instance: {
            port,
            dbPath: dataDir,
            storageEngine: 'wiredTiger',
            dbName: 'climahub',
          },
        });
        console.log(`[Local MongoDB] Server active on port ${port} (database: climahub)`);
      } else {
        console.log(`[Local MongoDB] Existing MongoDB instance detected on port ${port}`);
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    process.exit(1);
  }
};

// Graceful cleanup on termination
const cleanup = async () => {
  if (mongoServerInstance) {
    try {
      await mongoServerInstance.stop();
    } catch (_) {}
  }
};

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

module.exports = connectDB;
