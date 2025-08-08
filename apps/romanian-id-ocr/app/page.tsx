"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Download,
  Eye,
  FileText,
  Lock,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { FileUpload } from "@/components/file-upload";
import { ocrService } from "@/lib/ocr";
import type { ExtractedData, UploadedFile } from "@/lib/types";

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize OCR service on component mount
    ocrService.initialize().catch(console.error);
  }, []);

  // Helper: concurrency-limited queue
  async function processWithConcurrency<T>(
    items: T[],
    worker: (item: T) => Promise<void>,
    concurrency = 2,
  ) {
    let index = 0;
    const results: Promise<void>[] = [];
    async function next() {
      if (index >= items.length) return;
      const i = index++;
      await worker(items[i]);
      await next();
    }
    for (let i = 0; i < Math.min(concurrency, items.length); i++) {
      results.push(next());
    }
    await Promise.all(results);
  }

  const handleFilesChange = useCallback(async (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    const pendingFiles = newFiles.filter((file) => file.status === "pending");
    if (pendingFiles.length === 0) return;
    setIsProcessing(true);
    let currentFiles = newFiles;

    await processWithConcurrency(
      pendingFiles,
      async (file) => {
        // Skip PDFs for OCR, mark as error and show toast
        if (file.file.type === "application/pdf") {
          currentFiles = currentFiles.map((f) =>
            f.id === file.id
              ? { ...f, status: "error" as const, progress: 0 }
              : f,
          );
          setFiles([...currentFiles]);
          const errorResult = {
            id: Math.random().toString(36).substring(2, 15),
            fileName: file.file.name,
            name: "",
            cnp: "",
            address: "",
            dateOfBirth: "",
            placeOfIssue: "",
            status: "error" as const,
            confidence: 0,
            errors: [
              "PDF files are not supported for OCR. Please upload a JPG or PNG image.",
            ],
          };
          setExtractedData((prev) => [...prev, errorResult]);
          toast.error(errorResult.errors[0], {
            description: errorResult.errors[0],
          });
          return;
        }
        try {
          // Update file status to processing
          currentFiles = currentFiles.map((f) =>
            f.id === file.id ? { ...f, status: "processing" as const } : f,
          );
          setFiles([...currentFiles]);

          // Process with OCR
          const result = await ocrService.processImage(
            file.file,
            (progress) => {
              const progressFiles = currentFiles.map((f) =>
                f.id === file.id ? { ...f, progress } : f,
              );
              setFiles([...progressFiles]);
              currentFiles = progressFiles;
            },
          );

          // Update file status based on OCR result
          const finalStatus = result.status === "error" ? "error" : "completed";
          currentFiles = currentFiles.map((f) =>
            f.id === file.id
              ? { ...f, status: finalStatus as const, progress: 100 }
              : f,
          );
          setFiles([...currentFiles]);

          // Always add to extracted data (even if error, for user to see what failed)
          setExtractedData((prev) => [...prev, result]);

          // Show toast if error
          if (result.status === "error") {
            toast.error(result.errors?.[0] || "OCR failed", {
              description: result.errors?.[0] || "OCR failed",
            });
          }
        } catch (error) {
          console.error("Unexpected OCR processing error:", error);
          currentFiles = currentFiles.map((f) =>
            f.id === file.id ? { ...f, status: "error" as const } : f,
          );
          setFiles([...currentFiles]);
          const errorResult = {
            id: Math.random().toString(36).substring(2, 15),
            fileName: file.file.name,
            name: "",
            cnp: "",
            address: "",
            dateOfBirth: "",
            placeOfIssue: "",
            status: "error" as const,
            confidence: 0,
            errors: [
              `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
            ],
          };
          setExtractedData((prev) => [...prev, errorResult]);
          toast.error(errorResult.errors[0], {
            description: errorResult.errors[0],
          });
        }
      },
      2,
    ); // concurrency limit 2

    setIsProcessing(false);
  }, []);

  // Retry handler for a single file (FR003)
  const handleRetry = useCallback(
    async (id: string) => {
      const fileToRetry = files.find((f) => f.id === id);
      if (!fileToRetry) return;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "pending", progress: 0 } : f,
        ),
      );
      // Remove previous extractedData for this file
      setExtractedData((prev) =>
        prev.filter((d) => d.fileName !== fileToRetry.file.name),
      );
      // Re-run processing for this file only
      await handleFilesChange(
        files.map((f) =>
          f.id === id ? { ...f, status: "pending", progress: 0 } : f,
        ),
      );
    },
    [files, handleFilesChange],
  );

  const handleDataChange = (newData: ExtractedData[]) => {
    setExtractedData(newData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="border-b bg-white border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Romanian ID OCR
                </h1>
                <p className="text-sm font-semibold text-gray-800">
                  AI-powered document processing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isProcessing && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 rounded-full">
                  <Zap className="h-4 w-4 text-yellow-600 animate-pulse" />
                  <span className="text-sm font-medium text-yellow-800">
                    Processing...
                  </span>
                </div>
              )}
              <Badge
                variant="outline"
                className="gap-1 bg-white border-gray-400 text-gray-900 font-semibold"
              >
                <Eye className="h-3 w-3" />
                Privacy Mode
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="w-[75vw] mx-auto space-y-8">
          {/* Status Cards + Upload Button Row */}
          <div className="grid md:grid-cols-4 gap-4 items-stretch">
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl text-gray-900">
                      {files.length}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Documents Uploaded
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl text-gray-900">
                      {extractedData.length}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Records Extracted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-2xl text-gray-900">100%</p>
                    <p className="text-sm font-semibold text-gray-900">
                      Privacy Protected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Button as 4th column */}
            <div className="flex items-center justify-center h-full">
              <FileUpload
                onFilesChange={handleFilesChange}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            data={extractedData}
            onDataChange={handleDataChange}
            onRetry={handleRetry}
          />

          {/* Footer */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-gray-700" />
              <p className="text-sm font-semibold text-gray-900">
                All processing happens locally in your browser. No data is sent
                to external servers.
              </p>
            </div>
            <Separator className="max-w-xs mx-auto" />
          </div>
        </div>
      </main>
    </div>
  );
}
