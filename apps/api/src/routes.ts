import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { createAssignmentSchema, type Assignment } from "@vedaai/shared";
import { broadcast } from "./realtime.js";
import { deleteAssignment, getAssignment, listAssignments, saveAssignment } from "./repository.js";
import { enqueueGeneration } from "./queue.js";
import { renderPdf } from "./pdf.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "vedaai-api" }));

router.get("/assignments", async (_req, res) => {
  res.json(await listAssignments());
});

router.get("/assignments/:id", async (req, res) => {
  const assignment = await getAssignment(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  return res.json(assignment);
});

router.post("/assignments", upload.single("file"), async (req, res) => {
  const body = normalizeMultipart(req.body, req.file);
  const parsed = createAssignmentSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ message: "Validation failed", issues: parsed.error.flatten() });

  const assignment: Assignment = {
    ...parsed.data,
    id: randomUUID(),
    status: "queued",
    assignedOn: new Date().toISOString()
  };
  await saveAssignment(assignment);
  const jobId = await enqueueGeneration(assignment.id);
  const saved = await saveAssignment({ ...assignment, jobId });
  broadcast({ type: "assignment.created", assignmentId: saved.id, status: saved.status, progress: 0, assignment: saved });
  return res.status(201).json(saved);
});

router.post("/assignments/:id/regenerate", async (req, res) => {
  const assignment = await getAssignment(req.params.id);
  if (!assignment) return res.status(404).json({ message: "Assignment not found" });
  const queued: Assignment = { ...assignment, status: "queued", result: undefined, error: undefined };
  await saveAssignment(queued);
  const jobId = await enqueueGeneration(assignment.id);
  const saved = await saveAssignment({ ...queued, jobId });
  broadcast({ type: "assignment.updated", assignmentId: saved.id, status: saved.status, progress: 0, assignment: saved });
  return res.json(saved);
});

router.delete("/assignments/:id", async (req, res) => {
  await deleteAssignment(req.params.id);
  return res.status(204).send();
});

router.get("/assignments/:id/pdf", async (req, res) => {
  const assignment = await getAssignment(req.params.id);
  if (!assignment?.result) return res.status(404).json({ message: "Generated paper not found" });
  const buffer = await renderPdf(assignment.result);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${assignment.title.replace(/\W+/g, "-").toLowerCase()}.pdf"`);
  return res.send(buffer);
});

function normalizeMultipart(body: Record<string, unknown>, file?: Express.Multer.File) {
  return {
    ...body,
    timeAllowedMinutes: Number(body.timeAllowedMinutes),
    plans: typeof body.plans === "string" ? JSON.parse(body.plans) : body.plans,
    sourceText: String(body.sourceText ?? ""),
    uploadedFileName: file?.originalname ?? body.uploadedFileName
  };
}
