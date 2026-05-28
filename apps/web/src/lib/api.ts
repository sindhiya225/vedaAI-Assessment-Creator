import type { Assignment, CreateAssignmentInput } from "@vedaai/shared";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

export async function apiListAssignments(): Promise<Assignment[]> {
  const response = await fetch(`${API_URL}/assignments`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to fetch assignments");
  return response.json();
}

export async function apiGetAssignment(id: string): Promise<Assignment> {
  const response = await fetch(`${API_URL}/assignments/${id}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to fetch assignment");
  return response.json();
}

export async function apiCreateAssignment(input: CreateAssignmentInput, file?: File | null): Promise<Assignment> {
  const form = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    form.append(key, key === "plans" ? JSON.stringify(value) : String(value ?? ""));
  });
  if (file) form.append("file", file);

  const response = await fetch(`${API_URL}/assignments`, { method: "POST", body: form });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Validation failed" }));
    throw new Error(payload.message ?? "Unable to create assignment");
  }
  return response.json();
}

export async function apiDeleteAssignment(id: string) {
  const response = await fetch(`${API_URL}/assignments/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Unable to delete assignment");
}

export async function apiRegenerate(id: string): Promise<Assignment> {
  const response = await fetch(`${API_URL}/assignments/${id}/regenerate`, { method: "POST" });
  if (!response.ok) throw new Error("Unable to regenerate assignment");
  return response.json();
}
