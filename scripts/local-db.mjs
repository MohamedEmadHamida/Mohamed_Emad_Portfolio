// Local MongoDB for development, no install needed: `npm run db`.
// Data is kept in .data/mongo between runs. The first run downloads the MongoDB binary (~70MB, official build).
// Point .env.local at it with MONGODB_URI=mongodb://127.0.0.1:27017
import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const dbPath = new URL("../.data/mongo", import.meta.url);
mkdirSync(dbPath, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: { port: 27017, dbPath: decodeURIComponent(dbPath.pathname.replace(/^\/([A-Za-z]:)/, "$1")), storageEngine: "wiredTiger" },
});

console.log(`Local MongoDB running at ${server.getUri()}  (Ctrl+C to stop)`);

const stop = async () => {
  await server.stop({ doCleanup: false });
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
