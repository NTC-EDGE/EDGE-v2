import { Platform, Alert } from "react-native";
import { SpreadsheetTemplateConfig } from "./spreadsheetTemplates";
import { generateXlsxBytes, isXlsxBinary, extractCsvFromXlsxBytes } from "./xlsxHelper";

export function downloadTemplateFile(config: SpreadsheetTemplateConfig): void {
  const xlsxFilename = config.filename.endsWith(".xlsx")
    ? config.filename
    : config.filename.replace(/\.csv$/i, ".xlsx");

  if (Platform.OS === "web" && typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const xlsxBytes = generateXlsxBytes(config);
      const bufferCopy = new ArrayBuffer(xlsxBytes.byteLength);
      new Uint8Array(bufferCopy).set(xlsxBytes);
      const blob = new Blob([bufferCopy], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", xlsxFilename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore revocation error
        }
      }, 60_000);
    } catch (err) {
      console.error("Failed to download Excel template on web:", err);
      Alert.alert("Download Error", "Could not trigger file download in browser.");
    }
  } else {
    Alert.alert(
      "Template Ready",
      `The Excel template '${xlsxFilename}' has been generated with native dropdown validations.`
    );
  }
}

export function downloadCsvFile(filename: string, csvContent: string): void {
  if (Platform.OS === "web" && typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore revocation error
        }
      }, 60_000);
    } catch (err) {
      console.error("Failed to download CSV on web:", err);
      Alert.alert("Download Error", "Could not trigger file download in browser.");
    }
  } else {
    Alert.alert(
      "Template Ready",
      `The file '${filename}' has been generated. Ready to import filled data.`
    );
  }
}

export async function readPickedSpreadsheetText(asset: {
  file?: File;
  uri?: string;
  name?: string;
}): Promise<string> {
  if (Platform.OS === "web" && asset.file && typeof asset.file.arrayBuffer === "function") {
    const arrayBuffer = await asset.file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    if (isXlsxBinary(bytes)) {
      return extractCsvFromXlsxBytes(bytes);
    }
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder("utf-8").decode(bytes);
    }
    return await asset.file.text();
  }

  if (asset.uri) {
    const response = await fetch(asset.uri);
    if (typeof response.arrayBuffer === "function") {
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      if (isXlsxBinary(bytes)) {
        return extractCsvFromXlsxBytes(bytes);
      }
      if (typeof TextDecoder !== "undefined") {
        return new TextDecoder("utf-8").decode(bytes);
      }
    }
    return await response.text();
  }

  return "";
}
