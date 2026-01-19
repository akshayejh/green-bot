import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseAdbError(error: unknown): string {
  if (!error) return "Unknown error";
  const errStr = typeof error === 'string' ? error : error instanceof Error ? error.message : String(error);

  // Common patterns
  if (errStr.includes("SecurityException")) {
    const match = errStr.match(/SecurityException:\s*(.*?)(?:\n|$)/);
    if (match && match[1]) return match[1].trim();
    return "Security Exception: Permission denied";
  }

  // "Error: ..."
  if (errStr.startsWith("Error:")) {
    const clean = errStr.substring(6).trim();
    return clean.split('\n')[0].substring(0, 100);
  }

  // "Failure [CODE] message" use regex to get message or header
  // Failure [DELETE_FAILED_INTERNAL_ERROR]
  if (errStr.includes("Failure [")) {
    const match = errStr.match(/Failure\s*\[(.*?)\]/);
    if (match) return `Failed: ${match[1]}`;
  }

  // Generic multiline: take first line, max length
  const firstLine = errStr.split('\n')[0].trim();
  if (firstLine.length > 100) {
    return firstLine.substring(0, 97) + "...";
  }
  return firstLine;
}