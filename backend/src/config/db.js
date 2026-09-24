const mongoose = require('mongoose');

let memoryServerInstance = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    // Check if the URI is the default placeholder or invalid
    const isPlaceholder = !mongoUri || mongoUri.includes('demoUser:demoPass') || mongoUri.includes('YOUR_MONGODB_ATLAS_URI');

    if (isPlaceholder || process.env.NODE_ENV === 'test') {
      console.warn('⚠️  [MongoDB] Real MongoDB Atlas credentials not detected in MONGO_URI.');
      console.log('🔄  [MongoDB] Starting MongoDB Atlas-compatible in-memory cluster for development and testing...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        mongoUri = memoryServerInstance.getUri();
        console.log('✅  [MongoDB] Atlas-compatible instance started successfully.');
        console.log('ℹ️   [MongoDB] To connect to your live MongoDB Atlas cloud cluster, update MONGO_URI in backend/.env');
      } catch (memErr) {
        console.warn('⚠️  Could not start in-memory server, attempting configured MONGO_URI:', memErr.message);
      }
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🚀 [MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Atlas Error]: ${error.message}`);
    // If connection to Atlas failed, try falling back to memory server so app doesn't exit during development
    if (!memoryServerInstance && process.env.NODE_ENV !== 'production') {
      console.log('🔄  [MongoDB] Falling back to development in-memory engine...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const fallbackUri = memoryServerInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅  [MongoDB] Fallback engine connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error('❌  [MongoDB Fallback Failed]:', fallbackError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
