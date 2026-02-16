import { config } from "dotenv";
import { envSchema, type Env } from "./env.schema.js";

config();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const message = Object.entries(errors)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");
  throw new Error(`Invalid environment:\n${message}`);
}

export const env: Env = parsed.data;
