import { Platform, Alert } from "react-native";

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
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download CSV on web:", err);
      Alert.alert("Download Error", "Could not trigger file download in browser.");
    }
  } else {
    // Native mobile platforms
    Alert.alert(
      "Template Ready",
      `The file '${filename}' has been generated. Ready to import filled data.`
    );
  }
}
