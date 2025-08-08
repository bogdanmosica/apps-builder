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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
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
  Download,
  FileText,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ParsedQuestion {
  property_type_id?: number;
  category_id?: number;
  category_name_ro?: string;
  category_name_en?: string;
  question_id?: number;
  question_ro: string;
  question_en: string;
  question_weight: number;
  answer_id?: number;
  answer_ro: string;
  answer_en: string;
  answer_weight: number;
  rowIndex: number;
  errors: string[];
  // Legacy format support
  property_type?: string;
  category_name?: string;
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
  propertyTypeId?: number;
  propertyTypeName?: string;
  onSuccess: () => void;
}

export default function BulkImportDialog({
  open,
  onOpenChange,
  propertyTypeId,
  propertyTypeName,
  onSuccess,
}: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    if (!uploadedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV file");
      return;
    }

    setFile(uploadedFile);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const result = validateData(jsonData as any[][]);
      setValidationResult(result);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Error parsing file. Please check the format.");
    }
  };

  const validateData = (data: any[][]): ValidationResult => {
    const headers = data[0];
    const rows = data.slice(1);

    // Detect format type based on headers
    const hasIdColumns = headers.some((h: string) => h?.includes("_id"));
    const isIdBasedFormat = hasIdColumns;

    const valid: ParsedQuestion[] = [];
    const invalid: ParsedQuestion[] = [];
    const categories = new Set<string>();

    rows.forEach((row, index) => {
      let parsedRow: ParsedQuestion;

      if (isIdBasedFormat) {
        // New ID-based format
        parsedRow = {
          property_type_id: parseInt(row[0]) || undefined,
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

        // Validation for ID-based format
        if (!parsedRow.property_type_id)
          parsedRow.errors.push("Property type ID is required");
        if (!parsedRow.category_name_ro)
          parsedRow.errors.push("Romanian category name is required");
        if (!parsedRow.question_ro)
          parsedRow.errors.push("Romanian question is required");
        if (!parsedRow.answer_ro)
          parsedRow.errors.push("Romanian answer is required");

        if (parsedRow.category_name_ro) {
          categories.add(parsedRow.category_name_ro);
        }
      } else {
        // Legacy string-based format
        parsedRow = {
          property_type: row[0]?.toString().trim() || "",
          category_name: row[1]?.toString().trim() || "",
          question_ro: row[2]?.toString().trim() || "",
          question_en: row[3]?.toString().trim() || "",
          question_weight: parseInt(row[4]) || 0,
          answer_ro: row[5]?.toString().trim() || "",
          answer_en: row[6]?.toString().trim() || "",
          answer_weight: parseInt(row[7]) || 0,
          rowIndex: index + 2,
          errors: [],
        };

        // Validation for legacy format
        if (!parsedRow.property_type)
          parsedRow.errors.push("Property type is required");
        if (!parsedRow.category_name)
          parsedRow.errors.push("Category name is required");
        if (!parsedRow.question_ro)
          parsedRow.errors.push("Romanian question is required");
        if (!parsedRow.answer_ro)
          parsedRow.errors.push("Romanian answer is required");

        if (parsedRow.category_name) {
          categories.add(parsedRow.category_name);
        }
      }

      // Common validation with better error messages
      if (parsedRow.question_weight < 1 || parsedRow.question_weight > 10) {
        if (parsedRow.question_weight === 0) {
          parsedRow.errors.push(
            "Question weight is required (1-10). If missing from template, please download a fresh template.",
          );
        } else {
          parsedRow.errors.push("Question weight must be between 1-10");
        }
      }
      if (parsedRow.answer_weight < 1 || parsedRow.answer_weight > 10) {
        if (parsedRow.answer_weight === 0) {
          parsedRow.errors.push(
            "Answer weight is required (1-10). If missing from template, please download a fresh template.",
          );
        } else {
          parsedRow.errors.push("Answer weight must be between 1-10");
        }
      }

      if (parsedRow.errors.length === 0) {
        valid.push(parsedRow);
      } else {
        invalid.push(parsedRow);
      }
    });

    const uniqueQuestions = new Set(valid.map((row) => `${row.question_ro}`))
      .size;

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

  const handleImport = async () => {
    if (!validationResult || validationResult.valid.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setImporting(true);

    try {
      // Convert to ID-based format for the new endpoint
      const questionsForImport = [];

      for (const question of validationResult.valid) {
        if (question.property_type_id !== undefined) {
          // Already ID-based format - pass through directly
          questionsForImport.push({
            property_type_id: question.property_type_id,
            category_id: question.category_id || 0,
            category_name_ro: question.category_name_ro,
            category_name_en: question.category_name_en,
            question_id: question.question_id || 0,
            question_ro: question.question_ro,
            question_en: question.question_en || question.question_ro,
            question_weight: question.question_weight,
            answer_id: question.answer_id || 0,
            answer_ro: question.answer_ro,
            answer_en: question.answer_en || question.answer_ro,
            answer_weight: question.answer_weight,
          });
        } else {
          // Legacy format - convert to ID-based
          questionsForImport.push({
            property_type_id: propertyTypeId || 1, // Use selected property type or default
            category_id: 0, // Always 0 for new categories in legacy format
            category_name_ro: question.category_name || "",
            category_name_en: question.category_name || "",
            question_id: 0, // Always 0 for new questions in legacy format
            question_ro: question.question_ro,
            question_en: question.question_en || question.question_ro,
            question_weight: question.question_weight,
            answer_id: 0, // Always 0 for new answers in legacy format
            answer_ro: question.answer_ro,
            answer_en: question.answer_en || question.answer_ro,
            answer_weight: question.answer_weight,
          });
        }
      }

      const response = await fetch("/api/questions/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: questionsForImport,
          replaceExisting: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import questions");
      }

      const result = await response.json();

      toast.success(
        `ID-based import completed! Created: ${result.results.categoriesCreated} categories, ${result.results.questionsCreated} questions, ${result.results.answersCreated} answers`,
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

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    setDragActive(false);
    onOpenChange(false);
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(
        `/api/admin/questions/template?propertyTypeId=${propertyTypeId}`,
      );
      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `questions-template-${(propertyTypeName || "all").toLowerCase().replace(/\s+/g, "-")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Bulk Import Questions
            {propertyTypeName ? ` - ${propertyTypeName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file with questions and answers
            {propertyTypeName ? ` for ${propertyTypeName} properties` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Need a template?</p>
                <p className="text-sm text-muted-foreground">
                  Download the Excel template with pre-filled headers and
                  example data
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          {!file && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Drop your Excel file here
              </p>
              <p className="text-muted-foreground mb-4">
                or click to browse (supports .xlsx, .xls, .csv)
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
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
                    Questions
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {validationResult.summary.uniqueQuestions}
                  </p>
                </div>
              </div>

              {/* Categories */}
              {validationResult.summary.categories.size > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Categories to be created/updated:
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

              {/* Validation Errors */}
              {validationResult.invalid.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationResult.invalid.length} rows have validation
                    errors and will be skipped. Please review and fix the errors
                    below.
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
                              <TableHead>Question (EN)</TableHead>
                              <TableHead>Answer (RO)</TableHead>
                              <TableHead>Answer (EN)</TableHead>
                              <TableHead>Q.Weight</TableHead>
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
                                    {row.category_name_ro || row.category_name}
                                  </TableCell>
                                  <TableCell className="max-w-32 truncate">
                                    {row.question_ro}
                                  </TableCell>
                                  <TableCell className="max-w-32 truncate">
                                    {row.question_en}
                                  </TableCell>
                                  <TableCell className="max-w-32 truncate">
                                    {row.answer_ro}
                                  </TableCell>
                                  <TableCell className="max-w-32 truncate">
                                    {row.answer_en}
                                  </TableCell>
                                  <TableCell>{row.question_weight}</TableCell>
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
                          Invalid Data ({validationResult.invalid.length} rows)
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
                              <TableHead>Question (EN)</TableHead>
                              <TableHead>Errors</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {validationResult.invalid.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.rowIndex}</TableCell>
                                <TableCell>
                                  {row.category_name_ro || row.category_name}
                                </TableCell>
                                <TableCell className="max-w-32 truncate">
                                  {row.question_ro}
                                </TableCell>
                                <TableCell className="max-w-32 truncate">
                                  {row.question_en}
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
            <Button onClick={handleImport} disabled={importing}>
              {importing
                ? "Importing..."
                : `Import ${validationResult.valid.length} Valid Rows`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
