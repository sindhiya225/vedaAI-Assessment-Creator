import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? process.env.API_PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/vedaai",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  openAiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};
