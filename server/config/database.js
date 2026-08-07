import mongoose from 'mongoose';

let connectionPromise;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  connectionPromise = mongoose.connect(mongoUri)
    .then(() => {
      console.log('Connected to MongoDB');
      return mongoose.connection;
    })
    .finally(() => {
      connectionPromise = undefined;
    });

  return connectionPromise;
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
