"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
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
  Edit3,
  FileSpreadsheet,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import type { ExtractedData } from "@/lib/types";
import { ErrorTooltip } from "./error-tooltip";

interface DataTableProps {
  data: ExtractedData[];
  onDataChange: (data: ExtractedData[]) => void;
  onRetry?: (id: string) => void;
}

export function DataTable({ data, onDataChange, onRetry }: DataTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<ExtractedData | null>(null);

  const startEdit = (item: ExtractedData) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const saveEdit = () => {
    if (!editData || !editingId) return;

    const updatedData = data.map((item) =>
      item.id === editingId ? editData : item,
    );
    onDataChange(updatedData);
    setEditingId(null);
    setEditData(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const updateEditField = (field: keyof ExtractedData, value: string) => {
    if (!editData) return;
    setEditData({
      ...editData,
      [field]: value,
    });
  };

  const exportToExcel = () => {
    if (data.length === 0) return;

    const exportData = data.map((item, index) => ({
      "#": index + 1,
      "File Name": item.fileName,
      Name: item.name,
      CNP: item.cnp,
      "Date of Birth": item.dateOfBirth,
      Address: item.address,
      "Place of Issue": item.placeOfIssue,
      "Confidence %": item.confidence,
      Status: item.status,
      Errors: item.errors.join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Romanian ID Data");

    // Auto-size columns
    const colWidths = [
      { wch: 5 }, // #
      { wch: 20 }, // File Name
      { wch: 25 }, // Name
      { wch: 15 }, // CNP
      { wch: 12 }, // Date of Birth
      { wch: 40 }, // Address
      { wch: 20 }, // Place of Issue
      { wch: 10 }, // Confidence
      { wch: 10 }, // Status
      { wch: 30 }, // Errors
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "romanian-id-data.xlsx");
  };

  if (data.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Data Extracted Yet
            </h3>
            <p className="text-gray-700 font-medium max-w-md mx-auto">
              Upload some Romanian ID images to get started. The extracted data
              will appear here for editing and export.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Extracted Data</CardTitle>
              <p className="text-sm text-gray-600">
                {data.length} document{data.length !== 1 ? "s" : ""} processed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="gap-1 bg-green-100 text-green-900 font-semibold"
            >
              <CheckCircle className="h-3 w-3" />
              {data.filter((d) => d.errors.length === 0).length} complete
            </Badge>
            <Button onClick={exportToExcel} className="gap-2" size="lg">
              <Download className="h-4 w-4" />
              Download Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12 px-3 font-bold text-gray-900 text-left align-middle">
                  #
                </TableHead>
                <TableHead className="font-bold text-gray-900">File</TableHead>
                <TableHead className="font-bold text-gray-900">Name</TableHead>
                <TableHead className="font-bold text-gray-900">CNP</TableHead>
                <TableHead className="font-bold text-gray-900">
                  Date of Birth
                </TableHead>
                <TableHead className="font-bold text-gray-900">
                  Emission Date
                </TableHead>
                <TableHead className="font-bold text-gray-900">
                  Expiration Date
                </TableHead>
                <TableHead className="font-bold text-gray-900">
                  Address
                </TableHead>
                <TableHead className="font-bold text-gray-900">
                  Place of Issue
                </TableHead>
                <TableHead className="font-bold text-gray-900">
                  Status
                </TableHead>
                <TableHead className="font-bold text-gray-900">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => {
                const isEditing = editingId === item.id;
                const currentData = isEditing ? editData! : item;

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50/50 border-b border-gray-100"
                  >
                    <TableCell className="w-12 px-3 font-bold text-gray-900 text-left align-middle">
                      {index + 1}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div
                        className="truncate font-medium text-gray-800 text-sm"
                        title={item.fileName}
                      >
                        {item.fileName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={currentData.name}
                          onChange={(e) =>
                            updateEditField("name", e.target.value)
                          }
                          className="w-full font-semibold text-gray-900 capitalize"
                        />
                      ) : (
                        <div
                          className={
                            item.errors.includes("Name not found")
                              ? "text-red-600 font-semibold capitalize"
                              : "text-gray-900 font-semibold text-sm capitalize"
                          }
                        >
                          {item.name || "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={currentData.cnp}
                          onChange={(e) =>
                            updateEditField("cnp", e.target.value)
                          }
                          className="w-full font-mono font-bold text-gray-900"
                          maxLength={13}
                        />
                      ) : (
                        <div
                          className={
                            item.errors.includes("CNP not found")
                              ? "text-red-600 font-mono font-bold"
                              : "text-gray-900 font-mono font-bold text-sm tracking-wider"
                          }
                        >
                          {item.cnp || "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={currentData.dateOfBirth}
                          onChange={(e) =>
                            updateEditField("dateOfBirth", e.target.value)
                          }
                          className="w-full font-mono font-semibold text-gray-900"
                          placeholder="DD.MM.YYYY"
                        />
                      ) : (
                        <div
                          className={
                            item.errors.includes("Date of birth not found")
                              ? "text-red-600 font-mono font-semibold"
                              : "text-gray-900 font-mono font-semibold text-sm"
                          }
                        >
                          {item.dateOfBirth || "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={currentData.emissionDate}
                          onChange={(e) =>
                            updateEditField("emissionDate", e.target.value)
                          }
                          className="w-full font-mono font-semibold text-gray-900"
                          placeholder="DD.MM.YYYY"
                        />
                      ) : (
                        <div className="text-gray-900 font-mono font-semibold text-sm">
                          {item.emissionDate || "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={currentData.expirationDate}
                          onChange={(e) =>
                            updateEditField("expirationDate", e.target.value)
                          }
                          className="w-full font-mono font-semibold text-gray-900"
                          placeholder="DD.MM.YYYY"
                        />
                      ) : (
                        <div className="text-gray-900 font-mono font-semibold text-sm">
                          {item.expirationDate || "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {isEditing ? (
                        <Input
                          value={currentData.address}
                          onChange={(e) =>
                            updateEditField("address", e.target.value)
                          }
                          className="w-full font-medium text-gray-900"
                        />
                      ) : (
                        <div
                          className={`truncate ${
                            item.errors.includes("Address not found")
                              ? "text-red-600 font-medium"
                              : "text-gray-900 font-medium text-sm leading-relaxed"
                          }`}
                          title={item.address}
                        >
                          {item.address || "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={currentData.placeOfIssue}
                          onChange={(e) =>
                            updateEditField("placeOfIssue", e.target.value)
                          }
                          className="w-full font-medium text-gray-900"
                        />
                      ) : (
                        <div
                          className={
                            item.errors.includes("Place of issue not found")
                              ? "text-red-600 font-medium"
                              : "text-gray-900 font-medium text-sm"
                          }
                        >
                          {item.placeOfIssue || "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.status === "completed" &&
                          item.errors.length === 0 && (
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-green-100 text-green-900 font-semibold"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </Badge>
                          )}
                        {item.status === "completed" &&
                          item.errors.length > 0 && (
                            <Badge
                              variant="outline"
                              className="gap-1 bg-yellow-50 border-yellow-300 text-yellow-900 font-semibold"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Partial
                            </Badge>
                          )}
                        {item.status === "error" && (
                          <Badge
                            variant="destructive"
                            className="gap-1 bg-red-100 text-red-900 font-semibold"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </Badge>
                        )}
                        {item.errors.length > 0 && (
                          <ErrorTooltip errors={item.errors} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            className="h-8 w-8 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
