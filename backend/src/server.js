import "dotenv/config";
import app from "./app.js";
import { prisma } from "./db/prisma.js";

const PORT = Number(process.env.PORT) || 4000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
