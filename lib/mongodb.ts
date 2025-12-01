import mongoose, { Connection, Mongoose } from 'mongoose';

/**
 * Shape of the cached connection object stored on the global object.
 * This avoids creating multiple connections in development when Next.js
 * reloads the server on file changes.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Extend the Node.js global type to include our Mongoose cache.
 *
 * We use `var` on the globalThis object (see below) instead of `let/const`
 * because Next.js modules can be evaluated multiple times in development.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Re-use an existing cached connection in development, or create a new cache
 * container in production.
 */
const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Returns an active Mongoose connection. If a connection already exists, it is
 * re-used; otherwise a new connection is established and cached.
 *
 * @throws If the MONGODB_URI environment variable is not set.
 */
export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) {
    // Re-use existing database connection.
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!cached.promise) {
    // Create a new connection promise and cache it so multiple calls share it.
    cached.promise = mongoose.connect(uri, {
      // Recommended Mongoose options can be added here if needed.
      autoIndex: process.env.NODE_ENV !== 'production',
    });
  }

  const mongooseInstance = await cached.promise;

  // Store the low-level connection object for quick access next time.
  cached.conn = mongooseInstance.connection;

  return cached.conn;
}

/**
 * Optionally expose the underlying Mongoose instance for model definitions.
 *
 * Example usage:
 * ```ts
 * import { getMongoose } from '@/lib/mongodb';
 *
 * const mongoose = getMongoose();
 * const UserSchema = new mongoose.Schema({ /* ... *\/ });
 * ```
 */
export function getMongoose(): typeof mongoose {
  return mongoose;
}
