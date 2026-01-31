import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import { FileEntry } from "@/types";

interface ClipboardItem {
  files: FileEntry[];
  sourcePath: string;
  operation: "copy" | "cut";
}

interface FileState {
  path: string;
  history: string[];
  historyIndex: number;
  files: FileEntry[];
  isLoading: boolean;
  error: string | null;

  // Selection
  selectedFiles: Set<string>;

  // Clipboard
  clipboard: ClipboardItem | null;

  // Search
  searchQuery: string;

  // Bookmarks (persisted)
  bookmarks: string[];

  // Actions
  setPath: (path: string) => void;
  navigateTo: (path: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  navigateUp: () => void;
  loadFiles: (deviceSerial: string | null) => Promise<void>;

  // Selection actions
  selectFile: (name: string, multi?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelection: (name: string) => void;
  selectRange: (fromName: string, toName: string) => void;

  // Clipboard actions
  copyToClipboard: () => void;
  cutToClipboard: () => void;
  clearClipboard: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;

  // Bookmark actions
  addBookmark: (path: string) => void;
  removeBookmark: (path: string) => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      path: "/sdcard/",
      history: ["/sdcard/"],
      historyIndex: 0,
      files: [],
      isLoading: false,
      error: null,

      // Selection
      selectedFiles: new Set<string>(),

      // Clipboard
      clipboard: null,

      // Search
      searchQuery: "",

      // Bookmarks
      bookmarks: ["/sdcard/", "/sdcard/Download/", "/sdcard/DCIM/", "/sdcard/Pictures/"],

      setPath: (path) => set({ path }),

      navigateTo: (newPath) => {
        const { path, history, historyIndex } = get();
        if (newPath === path) return;

        const nextHistory = history.slice(0, historyIndex + 1);
        nextHistory.push(newPath);

        set({
          path: newPath,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
          selectedFiles: new Set(), // Clear selection on navigate
          searchQuery: "", // Clear search on navigate
        });
      },

      navigateBack: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const prevIndex = historyIndex - 1;
          set({
            historyIndex: prevIndex,
            path: history[prevIndex],
            selectedFiles: new Set(),
            searchQuery: "",
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
            selectedFiles: new Set(),
            searchQuery: "",
          });
        }
      },

      navigateUp: () => {
        const { path } = get();
        if (path === "/" || path === "") return;

        const cleanPath = path.endsWith("/") ? path.slice(0, -1) : path;
        const parts = cleanPath.split("/");
        parts.pop();
        const newPath = parts.join("/") + "/";
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

          entries.sort((a, b) => {
            if (a.is_dir === b.is_dir) return a.name.localeCompare(b.name);
            return a.is_dir ? -1 : 1;
          });

          set({ files: entries, selectedFiles: new Set() });
        } catch (err) {
          set({ error: String(err), files: [] });
        } finally {
          set({ isLoading: false });
        }
      },

      // Selection actions
      selectFile: (name, multi = false) => {
        const { selectedFiles } = get();
        if (multi) {
          const newSelection = new Set(selectedFiles);
          if (newSelection.has(name)) {
            newSelection.delete(name);
          } else {
            newSelection.add(name);
          }
          set({ selectedFiles: newSelection });
        } else {
          set({ selectedFiles: new Set([name]) });
        }
      },

      toggleSelection: (name) => {
        const { selectedFiles } = get();
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(name)) {
          newSelection.delete(name);
        } else {
          newSelection.add(name);
        }
        set({ selectedFiles: newSelection });
      },

      selectAll: () => {
        const { files } = get();
        const allNames = files.filter((f) => f.name !== "..").map((f) => f.name);
        set({ selectedFiles: new Set(allNames) });
      },

      clearSelection: () => {
        set({ selectedFiles: new Set() });
      },

      selectRange: (fromName, toName) => {
        const { files, selectedFiles } = get();
        const visibleFiles = files.filter((f) => f.name !== "..");
        const fromIndex = visibleFiles.findIndex((f) => f.name === fromName);
        const toIndex = visibleFiles.findIndex((f) => f.name === toName);

        if (fromIndex === -1 || toIndex === -1) return;

        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);

        const newSelection = new Set(selectedFiles);
        for (let i = start; i <= end; i++) {
          newSelection.add(visibleFiles[i].name);
        }
        set({ selectedFiles: newSelection });
      },

      // Clipboard actions
      copyToClipboard: () => {
        const { files, selectedFiles, path } = get();
        const selectedEntries = files.filter((f) => selectedFiles.has(f.name));
        if (selectedEntries.length === 0) return;

        set({
          clipboard: {
            files: selectedEntries,
            sourcePath: path,
            operation: "copy",
          },
        });
      },

      cutToClipboard: () => {
        const { files, selectedFiles, path } = get();
        const selectedEntries = files.filter((f) => selectedFiles.has(f.name));
        if (selectedEntries.length === 0) return;

        set({
          clipboard: {
            files: selectedEntries,
            sourcePath: path,
            operation: "cut",
          },
        });
      },

      clearClipboard: () => {
        set({ clipboard: null });
      },

      // Search actions
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Bookmark actions
      addBookmark: (path) => {
        const { bookmarks } = get();
        if (!bookmarks.includes(path)) {
          set({ bookmarks: [...bookmarks, path] });
        }
      },

      removeBookmark: (path) => {
        const { bookmarks } = get();
        set({ bookmarks: bookmarks.filter((b) => b !== path) });
      },
    }),
    {
      name: "greenbot-file-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bookmarks: state.bookmarks,
      }),
    },
  ),
);
