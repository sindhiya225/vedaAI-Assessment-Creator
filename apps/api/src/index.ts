import http from "node:http";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { connectMongo } from "./db.js";
import { router } from "./routes.js";
import { setupQueue } from "./queue.js";
import { attachRealtime } from "./realtime.js";

const app = express();
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: "2mb" }));
app.use(router);

const server = http.createServer(app);
attachRealtime(server);

await connectMongo();
await setupQueue();

server.listen(config.port, () => {
  console.log(`VedaAI API ready on http://localhost:${config.port}`);
});
