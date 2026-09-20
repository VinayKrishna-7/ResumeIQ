const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('⚡ No MONGODB_URI provided in environment. Initializing MongoMemoryServer...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`✅ In-Memory MongoDB running at: ${mongoUri}`);
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If external URI failed in dev, try in-memory fallback
    if (!mongoServer && process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Attempting fallback to in-memory MongoDB...');
        mongoServer = await MongoMemoryServer.create();
        const fallbackUri = mongoServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback in-memory MongoDB connected: ${fallbackUri}`);
        return;
      } catch (fallbackErr) {
        console.error(`❌ Fallback MongoDB failed: ${fallbackErr.message}`);
      }
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
