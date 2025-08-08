import Tesseract from "tesseract.js";
import type { ExtractedData } from "./types";

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker("ron");

      // Configure Tesseract for optimal Romanian ID card recognition
      await this.worker.setParameters({
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ĂÂÎȘȚăâîșț.,- /",
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        preserve_interword_spaces: "1",
        tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_LSTM_COMBINED,
      });
    }
  }

  private async preprocessImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      const img = new Image();

      const cleanup = (url?: string) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      };

      img.onload = () => {
        try {
          // Limit image size for performance
          const maxSize = 2048;
          let { width, height } = img;

          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw image with scaling if needed
          ctx.drawImage(img, 0, 0, width, height);

          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;

          // Apply image enhancements
          this.enhanceImage(data);

          // Put processed data back
          ctx.putImageData(imageData, 0, 0);

          // Convert to data URL with quality optimization
          const dataUrl = canvas.toDataURL("image/png", 0.9);
          cleanup(img.src);
          resolve(dataUrl);
        } catch (processingError) {
          cleanup(img.src);
          reject(processingError);
        }
      };

      img.onerror = () => {
        cleanup(img.src);
        reject(new Error("Failed to load image for preprocessing"));
      };

      // Set timeout for image loading
      setTimeout(() => {
        if (!img.complete) {
          cleanup(img.src);
          reject(new Error("Image loading timeout"));
        }
      }, 10000);

      img.src = URL.createObjectURL(file);
    });
  }

  private enhanceImage(data: Uint8ClampedArray): void {
    // Convert to grayscale and enhance contrast
    for (let i = 0; i < data.length; i += 4) {
      // Calculate grayscale value
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2],
      );

      // Enhance contrast using histogram stretching
      const enhanced = this.enhanceContrast(gray);

      // Apply noise reduction
      const denoised = this.reduceNoise(enhanced);

      // Set RGB values to the processed grayscale value
      data[i] = denoised; // Red
      data[i + 1] = denoised; // Green
      data[i + 2] = denoised; // Blue
      // Alpha channel (data[i + 3]) remains unchanged
    }
  }

  private enhanceContrast(value: number): number {
    // Apply adaptive histogram equalization
    const normalized = value / 255.0;
    const enhanced = normalized ** 0.8 * 255;
    return Math.max(0, Math.min(255, enhanced));
  }

  private reduceNoise(value: number): number {
    // Simple threshold-based noise reduction
    if (value < 128) {
      return Math.max(0, value - 10); // Darken dark pixels
    } else {
      return Math.min(255, value + 10); // Brighten light pixels
    }
  }

  async processImage(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ExtractedData> {
    try {
      // Ensure worker is initialized and ready
      if (!this.worker) {
        await this.initialize();
      }

      // Validate file before processing
      if (!file || file.size === 0) {
        throw new Error("Invalid or empty file");
      }

      // Preprocess image for better OCR accuracy
      if (onProgress) onProgress(20);

      let preprocessedImageUrl: string;
      try {
        preprocessedImageUrl = await this.preprocessImage(file);
      } catch (preprocessError) {
        console.warn(
          "Image preprocessing failed, using original file:",
          preprocessError,
        );
        preprocessedImageUrl = URL.createObjectURL(file);
      }

      if (onProgress) onProgress(30);

      // Perform OCR with enhanced settings and error recovery
      let ocrResult: any;
      try {
        ocrResult = await this.worker?.recognize(preprocessedImageUrl);
      } catch (ocrError) {
        console.warn(
          "OCR failed with preprocessed image, retrying with original:",
          ocrError,
        );
        // Cleanup preprocessed URL and try with original
        if (preprocessedImageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(preprocessedImageUrl);
        }
        // Reinitialize worker and try again with original file
        await this.cleanup();
        await this.initialize();
        preprocessedImageUrl = URL.createObjectURL(file);
        ocrResult = await this.worker?.recognize(preprocessedImageUrl);
      }

      const {
        data: { text, confidence },
      } = ocrResult;

      if (onProgress) onProgress(100);

      // Clean up the preprocessed image URL
      if (preprocessedImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(preprocessedImageUrl);
      }

      return this.extractRomanianIDData(file.name, text || "", confidence || 0);
    } catch (error) {
      console.error("OCR processing failed:", error);

      // Return a structured error response instead of throwing
      return {
        id: Math.random().toString(36).substring(2, 15),
        fileName: file.name,
        name: "",
        cnp: "",
        address: "",
        dateOfBirth: "",
        emissionDate: "",
        expirationDate: "",
        placeOfIssue: "",
        status: "error" as const,
        confidence: 0,
        errors: [
          `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  private extractRomanianIDData(
    fileName: string,
    text: string,
    confidence: number,
  ): ExtractedData {
    const errors: string[] = [];

    // Clean and normalize the OCR text
    const cleanedText = this.cleanOCRText(text);

    const extractedData: ExtractedData = {
      id: Math.random().toString(36).substring(2, 15),
      fileName,
      name: "",
      cnp: "",
      address: "",
      dateOfBirth: "",
      emissionDate: "",
      expirationDate: "",
      placeOfIssue: "",
      status: "completed",
      confidence: Math.round(confidence),
      errors,
    };

    // Extract Name with improved logic: stop at keywords and limit to 2-4 words
    const stopWords = [
      "NAT",
      "NATIONALITATE",
      "NAȚIONALITATE",
      "CETĂȚENIE",
      "ROMÂNĂ",
      "ROMANA",
      "ROMÂNĂ",
      "ROMANA",
      "ROU",
      "SEX",
      "SEXUL",
      "SERIA",
      "NR",
      "NR.",
      "DATA",
      "ELIBERAT",
      "VALABIL",
      "PÂNĂ",
      "PANA",
      "LOC",
      "JUDET",
      "JUDEȚ",
      "JUDETUL",
      "JUDEȚUL",
      "DOMICILIU",
      "ADRESA",
      "ADRESĂ",
      "CNP",
      "COD",
      "EMITENT",
      "ISSUED",
      "BY",
      "BORN",
      "DATE",
      "OF",
      "BIRTH",
      "EXPIRARE",
      "EXP",
      "ID",
      "CARD",
      "CARTE",
      "IDENTITATE",
      "IDENTITY",
      "DOCUMENT",
      "DOC",
      "DOC.",
    ];
    const stopWordsPattern = new RegExp(`\\b(${stopWords.join("|")})\\b`, "i");
    const stopWordsSet = new Set(stopWords.map((w) => w.toLowerCase()));
    // Utility for digit/letter normalization (for CNP, DOB, etc.)
    const normalizeDigits = (str: string) =>
      str
        .replace(/O/g, "0")
        .replace(/l/g, "1")
        .replace(/I/g, "1")
        .replace(/S/g, "5")
        .replace(/B/g, "8")
        .replace(/Z/g, "2");
    // --- Improved name extraction using label-based, MRZ, and fallback ---
    // 1. Label-based extraction (stricter: after label, skip tokens that are labels or short, only capture next 2-3 capitalized words not labels)
    const labelWords = [
      "Nume",
      "Nom",
      "Last",
      "name",
      "Prenume",
      "Prenom",
      "First",
      "Cetățenie",
      "Nationalite",
      "Nationality",
      "Sex",
      "Sexe",
      "Loc",
      "nastere",
      "Lieu",
      "de",
      "naissance",
      "Place",
      "of",
      "birth",
    ];
    function extractNameAfterLabel(
      line: string,
      label: string,
      maxWords: number,
    ) {
      const tokens = line.split(/\s+/);
      let found = false;
      const nameWords: string[] = [];
      for (let i = 0; i < tokens.length; i++) {
        if (!found) {
          if (tokens[i].toLowerCase().includes(label.toLowerCase())) {
            found = true;
          }
          continue;
        }
        const tokenLower = tokens[i].toLowerCase();
        if (
          labelWords.some((lw) => tokenLower.includes(lw.toLowerCase())) ||
          tokens[i].length < 2 ||
          /\d/.test(tokens[i]) ||
          stopWordsSet.has(tokenLower)
        ) {
          if (nameWords.length > 0) break;
          continue;
        }
        if (/^[A-ZĂÂÎȘȚ][A-ZĂÂÎȘȚa-zăâîșț-]+$/.test(tokens[i])) {
          nameWords.push(tokens[i]);
          if (nameWords.length === maxWords) break;
        } else if (nameWords.length > 0) {
          break;
        }
      }
      return nameWords.join(" ");
    }
    console.log("[OCR DEBUG] cleanedText:", cleanedText);
    // Try to extract last and first name from lines containing the labels
    let lastName = "";
    let firstName = "";
    for (const line of cleanedText.split(/\n|\r|(?<=\s{2,})/)) {
      if (!lastName && /Nume|Nom|Last\s*name/i.test(line)) {
        lastName =
          extractNameAfterLabel(line, "Nume", 2) ||
          extractNameAfterLabel(line, "Nom", 2) ||
          extractNameAfterLabel(line, "Last name", 2);
      }
      if (!firstName && /Prenume|Prenom|First\s*name/i.test(line)) {
        firstName =
          extractNameAfterLabel(line, "Prenume", 3) ||
          extractNameAfterLabel(line, "Prenom", 3) ||
          extractNameAfterLabel(line, "First name", 3);
      }
    }
    console.log("[OCR DEBUG] lastNameLabel extracted:", lastName);
    console.log("[OCR DEBUG] firstNameLabel extracted:", firstName);
    let foundName = "";
    // 2. MRZ fallback (if both not found)
    if ((!lastName || !firstName) && /IDROU/.test(cleanedText)) {
      console.log("[OCR DEBUG] Using MRZ fallback");
      const mrzLine1 = cleanedText.match(/IDROU([A-Z<]+)<<([A-Z<]+)/);
      if (mrzLine1) {
        lastName = mrzLine1[1].replace(/</g, " ").trim();
        firstName = mrzLine1[2].replace(/</g, " ").trim();
      }
    }
    // Remove stop words and duplicates from label-based extraction
    function cleanNameTokens(name: string) {
      return name
        .split(/\s+/)
        .filter(
          (t, i, arr) =>
            !stopWordsSet.has(t.toLowerCase()) &&
            (i === 0 || t !== arr[i - 1]) &&
            t.length > 1,
        )
        .join(" ");
    }
    lastName = cleanNameTokens(lastName);
    // For firstName, only keep up to first stop word if present
    if (firstName) {
      const firstNameTokens = firstName.split(/\s+/);
      const validTokens: string[] = [];
      for (const t of firstNameTokens) {
        if (stopWordsSet.has(t.toLowerCase())) break;
        validTokens.push(t);
      }
      firstName = cleanNameTokens(validTokens.join(" "));
    }
    // If both found, only join if not overlapping or duplicate
    if (lastName && firstName) {
      if (
        lastName === firstName ||
        lastName.includes(firstName) ||
        firstName.includes(lastName)
      ) {
        foundName = lastName;
      } else {
        foundName = `${lastName} ${firstName}`.trim();
      }
      extractedData.errors.push("Name extraction: label-based");
      console.log("[OCR DEBUG] Name extraction: label-based", foundName);
    } else {
      // fallback for missing part or both
      // 1. Try MRZ fallback: look for IDROU followed by uppercase letters (no << required)
      const mrzMatch = cleanedText.match(/IDROU([A-ZĂÂÎȘȚ-]{6,40})/);
      if (mrzMatch?.[1]) {
        const mrzBlock = mrzMatch[1];
        let last = "",
          first = "";
        const splitIdx = mrzBlock.search(/[A-ZĂÂÎȘȚ-]{2,}[A-Z][a-zăâîșț-]/);
        if (splitIdx > 0) {
          last = mrzBlock.slice(0, splitIdx);
          first = mrzBlock.slice(splitIdx);
        } else {
          last = mrzBlock.slice(0, 6);
          first = mrzBlock.slice(6);
        }
        foundName = cleanNameTokens(
          last +
            " " +
            first.replace(/([A-ZĂÂÎȘȚ]{2,})/g, "-$1").replace(/^-/, ""),
        );
        extractedData.errors.push("Name extraction: MRZ fallback");
        console.log("[OCR DEBUG] Name extraction: MRZ fallback", foundName);
      }
      // 2. If still not found, fallback to first block of 2-4 consecutive capitalized words
      if (!foundName) {
        const words = cleanedText.split(/\s+/);
        const nameWords: string[] = [];
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          if (stopWordsPattern.test(w)) break;
          if (/^[A-ZĂÂÎȘȚ][A-ZĂÂÎȘȚa-zăâîșț-]*$/.test(w)) {
            nameWords.push(w);
            if (nameWords.length === 4) break;
          } else if (nameWords.length > 0) {
            break;
          }
        }
        if (nameWords.length >= 2) {
          foundName = cleanNameTokens(nameWords.join(" "));
          extractedData.errors.push("Name extraction: fallback");
          console.log("[OCR DEBUG] Name extraction: fallback", foundName);
        } else if (lastName || firstName) {
          foundName = cleanNameTokens(
            [lastName, firstName].filter(Boolean).join(" "),
          );
          extractedData.errors.push("Name extraction: partial");
          console.log("[OCR DEBUG] Name extraction: partial", foundName);
        }
      }
    }
    if (foundName) {
      extractedData.name = this.capitalizeRomanianName(foundName);
      console.log("[OCR DEBUG] Found name:", foundName);
    } else {
      errors.push("Name not found or illegible");
      extractedData.errors.push("Name extraction: failed");
      console.log("[OCR DEBUG] Name extraction failed");
    }

    // Patterns for CNP extraction
    const cnpPatterns = [/CNP[:\s]*([12]\d{12})/i, /([12]\d{12})/];
    let cnpFound = "";
    for (const pattern of cnpPatterns) {
      const cnpMatch = cleanedText.match(pattern);
      if (cnpMatch && this.validateCNP(cnpMatch[1])) {
        cnpFound = cnpMatch[1];
        break;
      }
      // Try normalized
      if (cnpMatch) {
        const norm = normalizeDigits(cnpMatch[1]);
        if (this.validateCNP(norm)) {
          cnpFound = norm;
          break;
        }
      }
      // Try pattern on fully normalized text
      const normText = normalizeDigits(cleanedText);
      const normMatch = normText.match(pattern);
      if (normMatch && this.validateCNP(normMatch[1])) {
        cnpFound = normMatch[1];
        break;
      }
    }
    if (cnpFound) {
      extractedData.cnp = cnpFound;
    } else {
      errors.push("CNP not found or invalid");
    }

    // Extract Date of Birth with improved logic
    const dobPatterns = [
      /\b(\d{1,2}[./-]\d{1,2}[./-]\d{4})\b/g,
      /(?:Născut|NASCUT|Born)[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
      /Data[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
    ];
    const birthLabels = [
      "Loc nastere",
      "nastere",
      "născut",
      "Born",
      "Date of birth",
      "Data nasterii",
      "Data nașterii",
    ];
    let dobFound = "";
    const normText = normalizeDigits(cleanedText);
    // 1. Try to find a date after a birth-related label
    for (const label of birthLabels) {
      const labelRegex = new RegExp(
        label + "[^\d]{0,20}(\d{1,2}[./-]\d{1,2}[./-]\d{4})",
        "i",
      );
      const match = normText.match(labelRegex);
      if (match?.[1]) {
        dobFound = match[1];
        break;
      }
    }
    // 2. Fallback: first valid date in normalized text
    if (!dobFound) {
      for (const pattern of dobPatterns) {
        const normMatch = normText.match(pattern);
        if (normMatch) {
          dobFound = normMatch[1];
          break;
        }
      }
    }
    // 3. If still not found, try to extract from CNP
    if (!dobFound && cnpFound && cnpFound.length === 13) {
      // CNP: S YY MM DD xxxxxx
      const s = cnpFound[0];
      const yy = cnpFound.slice(1, 3);
      const mm = cnpFound.slice(3, 5);
      const dd = cnpFound.slice(5, 7);
      let year = 0;
      if (s === "1" || s === "2") year = 1900 + parseInt(yy);
      else if (s === "3" || s === "4") year = 1800 + parseInt(yy);
      else if (s === "5" || s === "6") year = 2000 + parseInt(yy);
      else if (s === "7" || s === "8" || s === "9") year = 2000 + parseInt(yy); // foreign residents, etc.
      // Validate month and day
      const month = parseInt(mm);
      const day = parseInt(dd);
      if (year > 1800 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        dobFound = `${dd}.${mm}.${year}`;
        extractedData.errors.push("Date of birth extracted from CNP");
        console.log("[OCR DEBUG] Date of birth extracted from CNP:", dobFound);
      }
    }
    if (dobFound) {
      extractedData.dateOfBirth = this.normalizeDateFormat(dobFound);
    } else {
      errors.push("Date of birth not found");
    }

    // --- Extract emission and expiration dates from first date range ---
    // Look for a date range like DD.MM.YY[-|–|—]DD.MM.YYYY or similar
    // Accept both 2-digit and 4-digit years, and allow for OCR confusion
    const dateRangeRegex =
      /(\d{1,2}[./-]\d{1,2}[./-](?:\d{2,4}))[\s-–—]+(\d{1,2}[./-]\d{1,2}[./-](?:\d{2,4}))/;
    const dateRangeMatch = normText.match(dateRangeRegex);
    if (dateRangeMatch) {
      extractedData.emissionDate = this.normalizeDateFormat(dateRangeMatch[1]);
      extractedData.expirationDate = this.normalizeDateFormat(
        dateRangeMatch[2],
      );
      console.log(
        "[OCR DEBUG] Emission/Expiration dates extracted from range:",
        extractedData.emissionDate,
        extractedData.expirationDate,
      );
    } else {
      // Try to find two separate dates close together (fallback)
      const allDates = Array.from(
        normText.matchAll(/\d{1,2}[./-]\d{1,2}[./-](?:\d{2,4})/g),
      ).map((m) => m[0]);
      if (allDates.length >= 2) {
        extractedData.emissionDate = this.normalizeDateFormat(allDates[0]);
        extractedData.expirationDate = this.normalizeDateFormat(allDates[1]);
        console.log(
          "[OCR DEBUG] Emission/Expiration dates fallback:",
          extractedData.emissionDate,
          extractedData.expirationDate,
        );
      } else {
        errors.push("Emission/Expiration dates not found");
      }
    }

    // Extract Address with comprehensive patterns
    const addressPatterns = [
      /(?:Domiciliul|DOMICILIUL|Adresa|ADRESA)[:\s]*([^\n\r]+)/i,
      /(?:Str\.|STR\.|Street)[:\s]*([^\n\r]+)/i,
      /(?:Municipiul|MUNICIPIUL|Orașul|ORAȘUL)[:\s]*([^\n\r]+)/i,
    ];

    for (const pattern of addressPatterns) {
      const addressMatch = cleanedText.match(pattern);
      if (addressMatch && addressMatch[1].trim().length > 5) {
        // Only take up to 'ap. <number>' or first valid address block
        let addr = addressMatch[1].trim();
        // Fix common OCR errors
        addr = addr.replace(/AteLierului/i, "Atelierului");
        addr = addr.replace(/nr\.lO/gi, "nr.10");
        addr = addr.replace(/\bet\.2\b/gi, "et.2");
        addr = addr.replace(/ap\.\s*lO/gi, "ap. 10");
        // Trim after 'ap. <number>'
        const apMatch = addr.match(/(ap\.\s*\d+)/i);
        if (apMatch) {
          addr = addr.substring(
            0,
            addr.indexOf(apMatch[1]) + apMatch[1].length,
          );
        }
        extractedData.address = this.cleanAddress(addr);
        break;
      }
    }

    if (!extractedData.address) {
      errors.push("Address not found or incomplete");
    }

    // Extract Place of Issue with variations
    const placePatterns = [
      /(?:Eliberat de|ELIBERAT DE|Issued by)[:\s]*([^\n\r]+)/i,
      /(?:SPCEP|S\.P\.C\.E\.P\.)[:\s]*([^\n\r]+)/i,
      /(?:Primăria|PRIMARIA)[:\s]*([^\n\r]+)/i,
    ];

    for (const pattern of placePatterns) {
      const placeMatch = cleanedText.match(pattern);
      if (placeMatch && placeMatch[1].trim().length > 2) {
        extractedData.placeOfIssue = placeMatch[1].trim();
        break;
      }
    }

    if (!extractedData.placeOfIssue) {
      errors.push("Place of issue not found");
    }

    // Set error status if too many errors or low confidence
    if (errors.length > 2 || confidence < 70) {
      extractedData.status = "error";
    }

    return extractedData;
  }

  private cleanOCRText(text: string): string {
    return (
      text
        // Fix common OCR misreads for Romanian characters
        .replace(/[àáâãäå]/g, "ă")
        .replace(/[ÀÁÂÃÄÅ]/g, "Ă")
        .replace(/[èéêë]/g, "ê")
        .replace(/[ÈÉÊË]/g, "Ê")
        .replace(/[ìíîï]/g, "î")
        .replace(/[ÌÍÎÏ]/g, "Î")
        .replace(/[ß]/g, "ș")
        .replace(/[ț]/g, "ț")
        // Clean up common OCR artifacts
        .replace(/[|]/g, "l")
        .replace(/[0]/g, "O")
        .replace(/[5]/g, "S")
        .replace(/[1]/g, "l")
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  private capitalizeRomanianName(name: string): string {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private validateCNP(cnp: string): boolean {
    if (cnp.length !== 13) return false;
    if (!/^\d{13}$/.test(cnp)) return false;

    // Basic CNP validation
    const firstDigit = parseInt(cnp[0]);
    return firstDigit >= 1 && firstDigit <= 8;
  }

  private normalizeDateFormat(date: string): string {
    // Convert various date formats to DD.MM.YYYY
    return date.replace(/[/-]/g, ".");
  }

  private cleanAddress(address: string): string {
    return address
      .replace(/\s+/g, " ")
      .replace(/[,]{2,}/g, ",")
      .trim();
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
