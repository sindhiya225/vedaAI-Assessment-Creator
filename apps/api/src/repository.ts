import type { Assignment } from "@vedaai/shared";
import { mongoReady } from "./db.js";
import { AssignmentModel } from "./models.js";

const memory = new Map<string, Assignment>();

export async function listAssignments() {
  if (mongoReady) {
    const rows = await AssignmentModel.find().sort({ createdAt: -1 }).lean<Assignment[]>();
    return rows.map(clean);
  }
  return Array.from(memory.values()).sort((a, b) => b.assignedOn.localeCompare(a.assignedOn));
}

export async function getAssignment(id: string) {
  if (mongoReady) {
    const row = await AssignmentModel.findOne({ id }).lean<Assignment | null>();
    return row ? clean(row) : null;
  }
  return memory.get(id) ?? null;
}

export async function saveAssignment(assignment: Assignment) {
  if (mongoReady) {
    await AssignmentModel.updateOne({ id: assignment.id }, assignment, { upsert: true });
  } else {
    memory.set(assignment.id, assignment);
  }
  return assignment;
}

export async function deleteAssignment(id: string) {
  if (mongoReady) {
    await AssignmentModel.deleteOne({ id });
  } else {
    memory.delete(id);
  }
}

function clean(row: Assignment & { _id?: unknown; __v?: unknown }) {
  const { _id, __v, ...assignment } = row;
  return assignment as Assignment;
}
