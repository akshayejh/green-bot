import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { FileEntry } from "@/types";

interface FileState {
  path: string;
  history: string[];
  historyIndex: number;
  files: FileEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setPath: (path: string) => void;
  navigateTo: (path: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  navigateUp: () => void;
  loadFiles: (deviceSerial: string | null) => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  path: "/sdcard/",
  history: ["/sdcard/"],
  historyIndex: 0,
  files: [],
  isLoading: false,
  error: null,

  setPath: (path) => set({ path }),

  navigateTo: (newPath) => {
    const { path, history, historyIndex } = get();
    if (newPath === path) return;

    // Ensure path ends with slash if it's a directory (simple heuristic or assumed from caller)
    // Usually list_files expects a directory path.
    // Let's rely on caller to format it correctly for now, but usually directories end in /

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newPath);

    set({
      path: newPath,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
  },

  navigateBack: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({
        historyIndex: prevIndex,
        path: history[prevIndex],
      });
    }
  },

  navigateForward: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        historyIndex: nextIndex,
        path: history[nextIndex],
      });
    }
  },

  navigateUp: () => {
    const { path } = get();
    if (path === "/" || path === "") return;

    // Remove trailing slash if present to split correctly
    const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;
    const parts = cleanPath.split("/");

    // Pop last segment
    parts.pop();

    // Join back and ensure trailing slash
    const newPath = parts.join("/") + "/";

    // If we ended up empty, it means root
    const finalPath = newPath === "/" ? "/" : newPath || "/";

    get().navigateTo(finalPath);
  },

  loadFiles: async (deviceSerial) => {
    if (!deviceSerial) return;

    set({ isLoading: true, error: null });
    const { path } = get();

    try {
      const entries = await invoke<FileEntry[]>("list_files", {
        device: deviceSerial,
        path: path,
      });

      // Sort: Directories first, then alphabetical
      entries.sort((a, b) => {
        if (a.is_dir === b.is_dir) return a.name.localeCompare(b.name);
        return a.is_dir ? -1 : 1;
      });

      set({ files: entries });
    } catch (err) {
      set({ error: String(err), files: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));
