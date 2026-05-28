import mongoose, { Schema } from "mongoose";
import type { Assignment } from "@vedaai/shared";

const AssignmentSchema = new Schema<Assignment>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    dueDate: { type: String, required: true },
    timeAllowedMinutes: { type: Number, required: true },
    plans: { type: Schema.Types.Mixed, required: true },
    instructions: { type: String, default: "" },
    sourceText: { type: String, default: "" },
    uploadedFileName: String,
    status: { type: String, required: true },
    assignedOn: { type: String, required: true },
    jobId: String,
    error: String,
    result: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const AssignmentModel =
  mongoose.models.Assignment || mongoose.model<Assignment>("Assignment", AssignmentSchema);
