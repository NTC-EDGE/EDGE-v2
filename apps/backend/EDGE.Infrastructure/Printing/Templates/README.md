# PDF Form Templates Directory

Place official NTC PDF template files in this folder (e.g., `ntc-1-19.pdf`, `ntc-1-11.pdf`, `ntc-1-09.pdf`).

## Usage Options

The printing engine (`EDGE.Infrastructure/Printing`) supports **two** rendering strategies:

### Option 1: Template Filling (`IPdfFormFillerService`)
- Uses `PdfSharp` to load a fillable AcroForm PDF or overlay text at exact $(X, Y)$ coordinates onto the official NTC `.pdf` template.
- When an official `.pdf` file exists in `EDGE.Infrastructure/Printing/Templates/`, `IPdfFormFillerService` can populate form fields or overlay coordinates onto the document.

### Option 2: Code-Driven Generation (`IFormPrintingService` via QuestPDF)
- Generates vector PDFs entirely from C# code.
- Handles dynamic multi-page expansion automatically when applications have large arrays of equipment/stations.
