import { create } from "zustand";
import type { Assignment, CreateAssignmentInput, WsEvent } from "@vedaai/shared";
import { apiCreateAssignment, apiDeleteAssignment, apiGetAssignment, apiListAssignments, apiRegenerate, WS_URL } from "./api";

type AssignmentStore = {
  assignments: Assignment[];
  current?: Assignment;
  query: string;
  socket?: WebSocket;
  setQuery: (query: string) => void;
  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (input: CreateAssignmentInput, file?: File | null) => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<void>;
  connectSocket: () => void;
};

export const useAssignments = create<AssignmentStore>((set, get) => ({
  assignments: [],
  query: "",
  setQuery: (query) => set({ query }),
  fetchAssignments: async () => set({ assignments: await apiListAssignments() }),
  fetchAssignment: async (id) => set({ current: await apiGetAssignment(id) }),
  createAssignment: async (input, file) => {
    const assignment = await apiCreateAssignment(input, file);
    set((state) => ({ assignments: upsert(state.assignments, assignment), current: assignment }));
    return assignment;
  },
  deleteAssignment: async (id) => {
    await apiDeleteAssignment(id);
    set((state) => ({ assignments: state.assignments.filter((assignment) => assignment.id !== id) }));
  },
  regenerate: async (id) => {
    const assignment = await apiRegenerate(id);
    set((state) => ({ assignments: upsert(state.assignments, assignment), current: assignment }));
  },
  connectSocket: () => {
    if (get().socket?.readyState === WebSocket.OPEN || get().socket?.readyState === WebSocket.CONNECTING) return;
    const socket = new WebSocket(WS_URL);
    socket.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data as string) as WsEvent | { type: "connected" };
        if (!("assignment" in event) || !event.assignment) return;
        const assignment = event.assignment;
        set((state) => ({
          assignments: upsert(state.assignments, assignment),
          current: state.current?.id === assignment.id ? assignment : state.current
        }));
      } catch {
        // Ignore non-JSON or non-assignment heartbeat messages.
      }
    };
    socket.onclose = () => set({ socket: undefined });
    set({ socket });
  }
}));

function upsert(assignments: Assignment[], next: Assignment) {
  const exists = assignments.some((assignment) => assignment.id === next.id);
  return exists ? assignments.map((assignment) => (assignment.id === next.id ? next : assignment)) : [next, ...assignments];
}
