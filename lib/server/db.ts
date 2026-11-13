import "server-only";
import { MongoClient, type Db } from "mongodb";

// One client per server process. In dev the module reloads on every edit, so the client is
// kept on globalThis to avoid opening a new connection pool each time.
const g = globalThis as typeof globalThis & { __mongo?: Promise<MongoClient> };

export const dbConfigured = () => !!process.env.MONGODB_URI;

/** The app database, or null when MONGODB_URI is not set (the site then falls back to lib/content.ts). */
export async function getDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (!g.__mongo) {
    g.__mongo = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 })
      .connect()
      .then(async (client) => {
        await ensureIndexes(client.db(process.env.MONGODB_DB || "portfolio"));
        return client;
      })
      .catch((err) => {
        g.__mongo = undefined; // retry on the next call
        throw err;
      });
  }
  const client = await g.__mongo;
  return client.db(process.env.MONGODB_DB || "portfolio");
}

async function ensureIndexes(db: Db) {
  const events = db.collection("events");
  await Promise.all([
    events.createIndex({ t: -1 }),
    events.createIndex({ sid: 1, t: 1 }),
    events.createIndex({ type: 1, t: -1 }),
    // Raw events are kept for about 13 months.
    events.createIndex({ t: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 400, name: "ttl_t" }),
  ]);
}
