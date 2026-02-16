import express from "express";
import cors from "cors";
import { env } from "./common/config/index.js";
import { connectDb } from "./common/services/db.service.js";
import { errorMiddleware } from "./common/middlewares/index.js";
import { appRouter } from "./router/index.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/api", appRouter);
app.use(errorMiddleware);

async function start(): Promise<void> {
  await connectDb();
  app.listen(env.PORT);
}

start().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
