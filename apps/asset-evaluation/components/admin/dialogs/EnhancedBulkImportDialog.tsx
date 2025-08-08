"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ParsedQuestion {
  property_type_id: number;
  category_id: number;
  category_name_ro: string;
  category_name_en?: string;
  question_id: number;
  question_ro: string;
  question_en?: string;
  question_weight: number;
  answer_id: number;
  answer_ro: string;
  answer_en?: string;
  answer_weight: number;
  rowIndex: number;
  errors: string[];
}

interface ValidationResult {
  valid: ParsedQuestion[];
  invalid: ParsedQuestion[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    uniqueQuestions: number;
    categories: Set<string>;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTypeId?: number | null;
  propertyTypeName?: string;
  onSuccess: () => void;
}

export default function EnhancedBulkImportDialog({
  open,
  onOpenChange,
  propertyTypeId,
  propertyTypeName,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [templateFormat, setTemplateFormat] = useState<"excel" | "markdown">(
    "excel",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = selectedFile.name
      .toLowerCase()
      .substring(selectedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV file");
      return;
    }

    setFile(selectedFile);
    await parseAndValidateFile(selectedFile);
  };

  const parseAndValidateFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        toast.error("File must contain at least a header row and one data row");
        return;
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);

      // Validate headers
      const requiredHeaders = [
        "property_type_id",
        "category_id",
        "category_name_ro",
        "category_name_en",
        "question_id",
        "question_ro",
        "question_en",
        "question_weight",
        "answer_id",
        "answer_ro",
        "answer_en",
        "answer_weight",
      ];

      const missingHeaders = requiredHeaders.filter(
        (header) =>
          !headers.some(
            (h) =>
              h &&
              h.toLowerCase().replace(/[_\s]/g, "") ===
                header.toLowerCase().replace(/[_\s]/g, ""),
          ),
      );

      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(", ")}`);
        return;
      }

      // Parse and validate rows
      const validationResult = await validateRows(dataRows, headers);
      setValidationResult(validationResult);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse file. Please check the format.");
    }
  };

  const validateRows = async (
    rows: any[],
    headers: string[],
  ): Promise<ValidationResult> => {
    const valid: ParsedQuestion[] = [];
    const invalid: ParsedQuestion[] = [];
    const categories = new Set<string>();

    rows.forEach((row, index) => {
      if (!row || row.length === 0 || row.every((cell: any) => !cell)) {
        return; // Skip empty rows
      }

      const parsedRow: ParsedQuestion = {
        property_type_id: parseInt(row[0]) || propertyTypeId || 0,
        category_id: parseInt(row[1]) || 0,
        category_name_ro: row[2]?.toString().trim() || "",
        category_name_en: row[3]?.toString().trim() || "",
        question_id: parseInt(row[4]) || 0,
        question_ro: row[5]?.toString().trim() || "",
        question_en: row[6]?.toString().trim() || "",
        question_weight: parseInt(row[7]) || 0,
        answer_id: parseInt(row[8]) || 0,
        answer_ro: row[9]?.toString().trim() || "",
        answer_en: row[10]?.toString().trim() || "",
        answer_weight: parseInt(row[11]) || 0,
        rowIndex: index + 2,
        errors: [],
      };

      // Validation
      if (!parsedRow.property_type_id) {
        parsedRow.errors.push("Property type ID is required");
      }
      if (!parsedRow.category_name_ro) {
        parsedRow.errors.push("Category name (Romanian) is required");
      }
      if (!parsedRow.question_ro) {
        parsedRow.errors.push("Question text (Romanian) is required");
      }
      if (!parsedRow.answer_ro) {
        parsedRow.errors.push("Answer text (Romanian) is required");
      }
      if (parsedRow.question_weight < 1 || parsedRow.question_weight > 10) {
        parsedRow.errors.push("Question weight must be between 1-10");
      }
      if (parsedRow.answer_weight < 1 || parsedRow.answer_weight > 10) {
        parsedRow.errors.push("Answer weight must be between 1-10");
      }

      if (parsedRow.errors.length === 0) {
        valid.push(parsedRow);
        if (parsedRow.category_name_ro) {
          categories.add(parsedRow.category_name_ro);
        }
      } else {
        invalid.push(parsedRow);
      }
    });

    const uniqueQuestions = new Set(valid.map((row) => row.question_ro)).size;

    return {
      valid,
      invalid,
      summary: {
        totalRows: rows.length,
        validRows: valid.length,
        invalidRows: invalid.length,
        uniqueQuestions,
        categories,
      },
    };
  };

  const handleImportConfirm = () => {
    setShowConfirmDialog(true);
  };

  const handleImport = async () => {
    if (!validationResult || validationResult.valid.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setImporting(true);
    setShowConfirmDialog(false);

    try {
      const response = await fetch("/api/questions/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: validationResult.valid,
          replaceExisting: replaceMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import questions");
      }

      const result = await response.json();

      toast.success(
        `Import completed! ${replaceMode ? "Replaced" : "Added"}: ${result.results.categoriesCreated} categories, ${result.results.questionsCreated} questions, ${result.results.answersCreated} answers`,
      );

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error importing questions:", error);
      toast.error("Failed to import questions. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async (format: "excel" | "markdown" = "excel") => {
    try {
      const params = new URLSearchParams({
        type: "template",
        format,
        ...(propertyTypeId && { propertyTypeId: propertyTypeId.toString() }),
      });

      const response = await fetch(`/api/admin/questions/template?${params}`);

      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const extension = format === "excel" ? "xlsx" : "md";
      const filename = `questions-template-${propertyTypeName ? propertyTypeName.toLowerCase().replace(/\s+/g, "-") : "all"}.${extension}`;
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `Template downloaded successfully (${format.toUpperCase()})`,
      );
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    setDragActive(false);
    setReplaceMode(false);
    setShowConfirmDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:max-w-7xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Bulk Import Questions
              {propertyTypeName && (
                <Badge variant="outline">{propertyTypeName}</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Import questions from Excel template. Download a template first,
              fill it out, then upload it back.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Download Template */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Step 1: Download Template
              </h3>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Template
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => downloadTemplate("excel")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel Format (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => downloadTemplate("markdown")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Markdown Format (.md)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-sm text-muted-foreground">
                  Contains existing data with IDs for updates, or empty template
                  for new data
                </p>
              </div>
            </div>

            {/* Step 2: Upload File */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Step 2: Upload Completed Template
              </h3>
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Drop your file here
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <Badge variant="secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button variant="ghost" onClick={() => setFile(null)}>
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Import Options */}
            {validationResult && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Step 3: Import Options
                </h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="replace-mode"
                    checked={replaceMode}
                    onCheckedChange={(checked) =>
                      setReplaceMode(checked as boolean)
                    }
                  />
                  <label htmlFor="replace-mode" className="text-sm font-medium">
                    Replace existing data (instead of appending)
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {replaceMode
                    ? "⚠️ This will delete all existing questions for this property type before importing"
                    : "New data will be added alongside existing questions"}
                </p>
              </div>
            )}

            {/* Validation Results */}
            {validationResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Import Preview</h3>
                  <Button variant="ghost" onClick={() => setFile(null)}>
                    Upload Different File
                  </Button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Rows</p>
                    <p className="text-2xl font-bold">
                      {validationResult.summary.totalRows}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Valid Rows
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {validationResult.summary.validRows}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Invalid Rows
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {validationResult.summary.invalidRows}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Unique Questions
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {validationResult.summary.uniqueQuestions}
                    </p>
                  </div>
                </div>

                {/* Categories Preview */}
                {validationResult.summary.categories.size > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Categories to be processed:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(validationResult.summary.categories).map(
                        (category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Validation Errors Alert */}
                {validationResult.invalid.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validationResult.invalid.length} rows have validation
                      errors and will be skipped. Please review and fix the
                      errors below.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Preview Tables */}
                <Accordion type="single" collapsible className="w-full">
                  {validationResult.valid.length > 0 && (
                    <AccordionItem value="valid">
                      <AccordionTrigger>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>
                            Valid Data ({validationResult.valid.length} rows)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="max-h-64 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Question (RO)</TableHead>
                                <TableHead>Q.Weight</TableHead>
                                <TableHead>Answer (RO)</TableHead>
                                <TableHead>A.Weight</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validationResult.valid
                                .slice(0, 10)
                                .map((row, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{row.rowIndex}</TableCell>
                                    <TableCell>
                                      {row.category_name_ro}
                                    </TableCell>
                                    <TableCell className="max-w-48 truncate">
                                      {row.question_ro}
                                    </TableCell>
                                    <TableCell>{row.question_weight}</TableCell>
                                    <TableCell className="max-w-32 truncate">
                                      {row.answer_ro}
                                    </TableCell>
                                    <TableCell>{row.answer_weight}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                          {validationResult.valid.length > 10 && (
                            <p className="text-sm text-muted-foreground mt-2 text-center">
                              Showing first 10 rows of{" "}
                              {validationResult.valid.length} valid rows
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {validationResult.invalid.length > 0 && (
                    <AccordionItem value="invalid">
                      <AccordionTrigger>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span>
                            Invalid Data ({validationResult.invalid.length}{" "}
                            rows)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="max-h-64 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Question (RO)</TableHead>
                                <TableHead>Errors</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validationResult.invalid.map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.rowIndex}</TableCell>
                                  <TableCell>{row.category_name_ro}</TableCell>
                                  <TableCell className="max-w-48 truncate">
                                    {row.question_ro}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {row.errors.map((error, errorIndex) => (
                                        <Badge
                                          key={errorIndex}
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          {error}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {validationResult && validationResult.valid.length > 0 && (
              <Button onClick={handleImportConfirm} disabled={importing}>
                Import {validationResult.valid.length} Valid Rows
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Import</DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <p>
                  Are you sure you want to {replaceMode ? "replace" : "import"}{" "}
                  the questions data?
                </p>
                {replaceMode && (
                  <p className="text-red-600 font-medium">
                    ⚠️ This will permanently delete all existing questions for
                    this property type!
                  </p>
                )}
                <div className="mt-4 p-3 bg-muted rounded">
                  <p className="text-sm">
                    <strong>Summary:</strong>
                    <br />• {validationResult?.summary.validRows} valid rows
                    will be processed
                    <br />• {validationResult?.summary.uniqueQuestions} unique
                    questions
                    <br />• {validationResult?.summary.categories.size}{" "}
                    categories
                    <br />• Mode:{" "}
                    {replaceMode
                      ? "Replace existing data"
                      : "Append to existing data"}
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing}
              variant={replaceMode ? "destructive" : "default"}
            >
              {importing
                ? "Importing..."
                : `Confirm ${replaceMode ? "Replace" : "Import"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
