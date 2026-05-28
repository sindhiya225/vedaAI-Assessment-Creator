import mongoose from "mongoose";
import { config } from "./config.js";

export let mongoReady = false;

export async function connectMongo() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 2500 });
    mongoReady = true;
    console.log("MongoDB connected");
  } catch (error) {
    mongoReady = false;
    console.warn("MongoDB unavailable, using in-memory persistence");
  }
}
