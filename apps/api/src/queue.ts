import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import type { Assignment } from "@vedaai/shared";
import { config } from "./config.js";
import { broadcast } from "./realtime.js";
import { getAssignment, saveAssignment } from "./repository.js";
import { generateQuestionPaper } from "./prompt.js";

let queue: Queue | null = null;
let redis: Redis | null = null;
let redisReady = false;

export async function setupQueue() {
  try {
    redis = new Redis(config.redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });
    await redis.connect();
    redisReady = true;
    const connection = redisConnectionOptions();
    queue = new Queue("assessment-generation", { connection });
    new Worker(
      "assessment-generation",
      async (job) => processGeneration(job.data.assignmentId),
      { connection }
    );
    console.log("Redis/BullMQ connected");
  } catch (error) {
    redisReady = false;
    queue = null;
    console.warn("Redis unavailable, running jobs inline");
  }
}

function redisConnectionOptions() {
  const url = new URL(config.redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    maxRetriesPerRequest: null
  };
}

export async function enqueueGeneration(assignmentId: string) {
  if (queue && redisReady) {
    const job = await queue.add("generate", { assignmentId }, { attempts: 2, backoff: { type: "exponential", delay: 1000 } });
    await redis?.set(`assignment:${assignmentId}:state`, "queued", "EX", 3600);
    return job.id;
  }
  setTimeout(() => processGeneration(assignmentId), 100);
  return `inline-${assignmentId}`;
}

async function processGeneration(assignmentId: string) {
  const assignment = await getAssignment(assignmentId);
  if (!assignment) return;

  try {
    await update(assignment, "generating", 20, "Structuring teacher inputs into an AI prompt");
    await delay(450);
    await update(assignment, "generating", 55, "Generating question sections and answer key");
    const result = await generateQuestionPaper(assignment);
    await delay(450);
    const completed: Assignment = { ...assignment, status: "completed", result, error: undefined };
    await saveAssignment(completed);
    await redis?.set(`assignment:${assignmentId}:state`, "completed", "EX", 3600);
    broadcast({ type: "job.completed", assignmentId, status: "completed", progress: 100, assignment: completed });
  } catch (error) {
    const failed: Assignment = {
      ...assignment,
      status: "failed",
      error: error instanceof Error ? error.message : "Generation failed"
    };
    await saveAssignment(failed);
    await redis?.set(`assignment:${assignmentId}:state`, "failed", "EX", 3600);
    broadcast({ type: "job.failed", assignmentId, status: "failed", progress: 100, message: failed.error, assignment: failed });
  }
}

async function update(assignment: Assignment, status: Assignment["status"], progress: number, message: string) {
  const updated = { ...assignment, status };
  await saveAssignment(updated);
  await redis?.set(`assignment:${assignment.id}:state`, status, "EX", 3600);
  broadcast({ type: "job.progress", assignmentId: assignment.id, status, progress, message, assignment: updated });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
