import { create } from "zustand";

export interface ProcessTask {
  id: string;
  type: "upload" | "download";
  name: string;
  progress?: number; // 0-100, undefined if indeterminate
  status: "pending" | "running" | "completed" | "error";
  error?: string;
  timestamp: number;
}

interface ProcessState {
  tasks: ProcessTask[];

  addTask: (task: Omit<ProcessTask, "status" | "timestamp">) => string;
  updateTask: (id: string, updates: Partial<ProcessTask>) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
}

export const useProcessStore = create<ProcessState>((set) => ({
  tasks: [],

  addTask: (task) => {
    const id = task.id || Math.random().toString(36).substring(7);
    set((state) => ({
      tasks: [
        {
          ...task,
          id,
          status: "running", // Start as running by default for now
          timestamp: Date.now(),
        },
        ...state.tasks,
      ],
    }));
    return id;
  },

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status === "running" || t.status === "pending"),
    })),
}));
