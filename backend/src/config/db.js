const mongoose = require('mongoose');

let memoryServerInstance = null;

const startMemoryServer = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create({
      binary: {
        version: '7.0.14',
      }
    });
    return memoryServerInstance.getUri();
  } catch (err) {
    console.warn('⚠️  [MongoDB] In-memory server startup notice:', err.message);
    return null;
  }
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Check if the URI is a placeholder or missing
    const isPlaceholder = !mongoUri || 
      mongoUri.includes('demoUser:demoPass') || 
      mongoUri.includes('YOUR_MONGODB_ATLAS_URI') || 
      mongoUri.includes('<db_password>') ||
      mongoUri.includes('<password>');

    if (!isPlaceholder && mongoUri) {
      try {
        console.log('📡 [MongoDB] Attempting connection to MongoDB Atlas...');
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 6000,
          connectTimeoutMS: 6000,
        });
        console.log(`🚀 [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
        return conn;
      } catch (atlasErr) {
        console.warn(`⚠️ [MongoDB Atlas] Connection failed (${atlasErr.message}). Initiating in-memory fallback...`);
      }
    } else {
      console.log('🔄 [MongoDB] No Atlas URI provided or placeholder detected. Starting in-memory instance...');
    }

    // Fallback: Start in-memory MongoDB instance (seamless for hackathon demo & deployment)
    if (!memoryServerInstance) {
      const memUri = await startMemoryServer();
      if (memUri) {
        const conn = await mongoose.connect(memUri);
        console.log(`✅ [MongoDB] In-memory database cluster connected: ${conn.connection.host}`);
        return conn;
      }
    } else {
      const memUri = memoryServerInstance.getUri();
      const conn = await mongoose.connect(memUri);
      return conn;
    }

    return null;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Fatal Error]: ${error.message}`);
    return null;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
    }
  } catch (e) {
    console.warn('Error during DB disconnect:', e.message);
  }
};

module.exports = { connectDB, disconnectDB };

