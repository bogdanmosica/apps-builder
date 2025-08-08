export interface ExtractedData {
  id: string;
  fileName: string;
  name: string;
  cnp: string;
  address: string;
  dateOfBirth: string;
  emissionDate: string;
  expirationDate: string;
  placeOfIssue: string;
  status: "processing" | "completed" | "error";
  confidence: number;
  errors: string[];
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
}
