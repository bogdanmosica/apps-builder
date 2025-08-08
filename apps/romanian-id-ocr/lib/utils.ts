export { cn } from "@workspace/ui/lib/utils";

export function validateFileType(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
