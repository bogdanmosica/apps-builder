# Romanian ID OCR Tool

A privacy-focused web application for extracting text data from Romanian identity documents using OCR (Optical Character Recognition). All processing happens locally in your browser - no data is sent to servers.

## 🔒 Privacy First

- **Client-side processing**: All OCR happens in your browser using Tesseract.js
- **No data storage**: Images and extracted data are never stored on servers
- **GDPR compliant**: Explicit consent required before processing
- **No tracking**: No analytics, cookies, or tracking technologies

## ✨ Features

- **Drag & drop file upload** - Support for JPG, PNG, and PDF files
- **Mobile-friendly** - Upload from camera or gallery on mobile devices
- **Batch processing** - Process up to 20 documents simultaneously
- **Romanian OCR** - Optimized for Romanian identity documents with diacritic support
- **Editable results** - Manually edit extracted data in a table format
- **Excel export** - Download extracted data as .xlsx files
- **Error handling** - Clear feedback on missing or uncertain data
- **Progress tracking** - Real-time processing status for each document

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd romanian-id-ocr
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Tesseract.js** - JavaScript OCR library
- **React Dropzone** - File upload with drag & drop
- **SheetJS (XLSX)** - Excel file generation
- **Lucide React** - Beautiful icons
- **Workspace UI** - Shared component library

## 📋 Supported Data Fields

The OCR extracts the following fields from Romanian ID cards:

- **Name** (Nume)
- **CNP** (13-digit personal numeric code)
- **Date of Birth** (DD.MM.YYYY format)
- **Address** (Domiciliul/Adresa)
- **Place of Issue** (Eliberat de)

## 🔧 Configuration

### File Limits

- **Max file size**: 10MB per file
- **Max files**: 20 files per session
- **Supported formats**: JPG, PNG, PDF

### OCR Settings

The OCR is configured for:
- Romanian language support (`ron+eng`)
- Diacritic characters (ș, ț, ă, î)
- Slightly rotated or noisy images

## 📱 Usage

1. **Accept Privacy Terms**: Review and accept the GDPR-compliant privacy notice
2. **Upload Documents**: Drag & drop or click to select Romanian ID images
3. **Processing**: Watch real-time progress as OCR extracts text
4. **Edit Data**: Manually correct any extraction errors in the table
5. **Export**: Download the final data as an Excel file

## 🔐 Security & Privacy

- All processing happens client-side using WebAssembly
- No server-side storage or processing
- HTTPS encryption for all traffic
- Security headers implemented
- No persistent data storage

## 🚀 Deployment

The app is configured for static deployment and can be deployed to:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- Any static hosting provider

Build for production:
```bash
pnpm build
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions about privacy or data processing, contact: privacy@example.com
