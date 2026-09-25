const mongoose = require('mongoose');

let memoryServerInstance = null;
const isCloudEnv = Boolean(process.env.RENDER || process.env.NODE_ENV === 'production' || process.env.VERCEL);

const startMemoryServer = async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    // Specify 7.0.14 to ensure compatibility with modern Linux distros like Debian 12 on Render
    memoryServerInstance = await MongoMemoryServer.create({
      binary: {
        version: '7.0.14',
      }
    });
    return memoryServerInstance.getUri();
  } catch (err) {
    console.warn('⚠️  Could not start in-memory server:', err.message);
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

    if (isPlaceholder) {
      if (isCloudEnv) {
        console.error('════════════════════════════════════════════════════════════════');
        console.error('❌ [MongoDB Atlas Configuration Error on Render]');
        console.error('MONGO_URI is missing or contains "<db_password>".');
        console.error('👉 Fix in Render: Environment -> Set MONGO_URI with your REAL password.');
        console.error('════════════════════════════════════════════════════════════════');
      } else {
        console.warn('⚠️  [MongoDB] Real MongoDB Atlas credentials not detected in MONGO_URI.');
        console.log('🔄  [MongoDB] Starting MongoDB in-memory cluster for development...');
        const memUri = await startMemoryServer();
        if (memUri) {
          mongoUri = memUri;
          console.log('✅  [MongoDB] In-memory instance started.');
        }
      }
    }

    if (!mongoUri || (isPlaceholder && isCloudEnv)) {
      console.warn('⚠️ [MongoDB Atlas] Waiting for valid MONGO_URI in Render environment. Retrying in 10 seconds...');
      setTimeout(() => connectDB(), 10000);
      return null;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });

    console.log(`🚀 [MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('════════════════════════════════════════════════════════════════');
    console.error(`❌ [MongoDB Atlas Connection Failed]: ${error.message}`);
    
    if (error.message && error.message.includes('bad auth')) {
      console.error('🔑 AUTHENTICATION FAILED: The database username or password in MONGO_URI is incorrect.');
      console.error('   1. Open MongoDB Atlas -> Database Access.');
      console.error('   2. Edit user "madhaviprathi36_db_user" and reset the password (e.g., CivicPulsePass123).');
      console.error('   3. Update MONGO_URI in Render Dashboard -> Environment with the new password.');
    } else {
      console.error('💡 Checklist to fix this on MongoDB Atlas & Render:');
      console.error('   1. Atlas Network Access: Ensure 0.0.0.0/0 (Allow Anywhere) is added.');
      console.error('   2. Atlas Database User: Ensure user exists and has ReadWrite permissions.');
    }
    console.error('════════════════════════════════════════════════════════════════');
    
    // Only attempt local in-memory fallback on local machine, not on Render
    if (!isCloudEnv && !memoryServerInstance) {
      console.log('🔄  [MongoDB] Falling back to development in-memory engine...');
      const fallbackUri = await startMemoryServer();
      if (fallbackUri) {
        try {
          const conn = await mongoose.connect(fallbackUri);
          console.log(`✅  [MongoDB] Fallback engine connected: ${conn.connection.host}`);
          return conn;
        } catch (fallbackError) {
          console.error('❌  [MongoDB Fallback Failed]:', fallbackError.message);
        }
      }
    } else {
      // In cloud / production, schedule a retry so container stays up and accessible
      console.log('🔄 [MongoDB] Reconnection attempt in 10 seconds...');
      setTimeout(() => connectDB(), 10000);
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
