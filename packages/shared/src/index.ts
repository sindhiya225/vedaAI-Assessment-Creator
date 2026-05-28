import { z } from "zod";

export const difficultySchema = z.enum(["Easy", "Moderate", "Hard"]);

export const questionTypeSchema = z.enum([
  "Multiple Choice Questions",
  "Short Answer Questions",
  "Long Answer Questions",
  "Case Study Questions",
  "True or False"
]);

export const questionPlanSchema = z.object({
  type: questionTypeSchema,
  count: z.number().int().min(1).max(50),
  marks: z.number().int().min(1).max(20)
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  schoolName: z.string().trim().min(2, "School name is required"),
  subject: z.string().trim().min(2, "Subject is required"),
  className: z.string().trim().min(1, "Class is required"),
  dueDate: z.string().trim().min(1, "Due date is required"),
  timeAllowedMinutes: z.number().int().min(10).max(240),
  plans: z.array(questionPlanSchema).min(1),
  instructions: z.string().trim().max(1200).optional().default(""),
  sourceText: z.string().trim().max(8000).optional().default(""),
  uploadedFileName: z.string().trim().optional()
});

export const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  difficulty: difficultySchema,
  marks: z.number().int().min(1),
  answer: z.string()
});

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  type: questionTypeSchema,
  questions: z.array(questionSchema)
});

export const questionPaperSchema = z.object({
  schoolName: z.string(),
  subject: z.string(),
  className: z.string(),
  timeAllowedMinutes: z.number(),
  maximumMarks: z.number(),
  sections: z.array(sectionSchema),
  generatedAt: z.string()
});

export const assignmentSchema = createAssignmentSchema.extend({
  id: z.string(),
  status: z.enum(["queued", "generating", "completed", "failed"]),
  assignedOn: z.string(),
  jobId: z.string().optional(),
  error: z.string().optional(),
  result: questionPaperSchema.optional()
});

export const wsEventSchema = z.object({
  type: z.enum(["assignment.created", "assignment.updated", "job.progress", "job.completed", "job.failed"]),
  assignmentId: z.string(),
  status: assignmentSchema.shape.status,
  progress: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
  assignment: assignmentSchema.optional()
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type QuestionPlan = z.infer<typeof questionPlanSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionSection = z.infer<typeof sectionSchema>;
export type QuestionPaper = z.infer<typeof questionPaperSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type WsEvent = z.infer<typeof wsEventSchema>;
