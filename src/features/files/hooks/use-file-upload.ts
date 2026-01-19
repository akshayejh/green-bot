import { useFileStore } from "@/store/file-store";
import { useDeviceStore } from "@/store/device-store";
import { useProcessStore } from "@/store/process-store";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useCallback } from "react";

export function useFileUpload() {
  const { path, loadFiles } = useFileStore();
  const selectedSerial = useDeviceStore((state) => state.selectedSerial);
  const { addTask, updateTask } = useProcessStore();

  const uploadFiles = useCallback(
    async (files: string[]) => {
      if (!selectedSerial) return;

      for (const localPath of files) {
        // Extract filename from path
        const fileName = localPath.split(/[/\\]/).pop() || "unknown";

        const taskId = Date.now().toString() + Math.random().toString();
        addTask({
          id: taskId,
          type: "upload",
          name: fileName,
          progress: 0,
        });

        const remotePath = path.endsWith("/") ? path + fileName : path + "/" + fileName;

        invoke("upload_file", {
          device: selectedSerial,
          localPath: localPath,
          remotePath: remotePath,
        })
          .then(() => {
            updateTask(taskId, { status: "completed", progress: 100 });
            toast.success(`Uploaded ${fileName}`);
            loadFiles(selectedSerial);
          })
          .catch((err) => {
            console.error("Upload failed", err);
            updateTask(taskId, { status: "error", error: String(err) });
            toast.error(`Failed to upload ${fileName}`);
          });
      }
    },
    [selectedSerial, path, addTask, updateTask, loadFiles],
  );

  return { uploadFiles };
}
