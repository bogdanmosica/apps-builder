"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { UploadedFile } from "@/lib/types";
import {
  cn,
  generateId,
  validateFileSize,
  validateFileType,
} from "@/lib/utils";

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function FileUpload({
  onFilesChange,
  maxFiles = 20,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      // Only handle accepted files for upload button
      if (files.length + acceptedFiles.length > maxFiles) {
        return;
      }
      const newFiles: UploadedFile[] = acceptedFiles
        .filter((file) => validateFileType(file) && validateFileSize(file, 10))
        .map((file) => ({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          status: "pending" as const,
          progress: 0,
        }));
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    },
    [files, maxFiles, onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
    disabled,
  });

  // ...existing code...

  return (
    <Card className="bg-white border border-gray-200 shadow-lg flex items-center justify-center min-h-[180px]">
      <CardContent className="flex items-center justify-center w-full">
        <div
          {...getRootProps({
            className: cn(
              "group flex items-center justify-center cursor-pointer select-none border-2 border-dashed border-gray-300 rounded-lg p-4 w-fit bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
              disabled && "opacity-60 cursor-not-allowed",
              isDragActive && "border-blue-600 bg-blue-50/50",
            ),
          })}
          aria-disabled={disabled}
        >
          <input {...getInputProps()} aria-label="Upload files" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Upload className="h-6 w-6" />
            <span className="sr-only">Upload</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
