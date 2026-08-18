import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isMemoryServer = false;

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sunrays_crm';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB`);
  } catch (error) {
    console.warn(`[Database] Could not connect to local MongoDB (${(error as Error).message}). Falling back to In-Memory MongoDB.`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      isMemoryServer = true;
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at ${memoryUri}`);
    } catch (memError) {
      console.error('[Database] Failed to connect to In-Memory MongoDB:', memError);
      throw memError;
    }
  }
};

export const isUsingMemoryDatabase = (): boolean => isMemoryServer;
