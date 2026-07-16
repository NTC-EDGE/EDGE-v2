import axios from "axios";

import {Platform} from "react-native";
import {DeviceType, deviceType} from "expo-device";
export const isTablet = () => deviceType == DeviceType.TABLET ;
export const getInitial = (value: any) => {
    return (value)?.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
}
export const getDisplayName = (user: any) => {
    if (!user) return '';

    const { userType, applicant, firstName, lastName } = user;

    // Company user
    if (userType === 'Company') {
        return (applicant?.companyName || `${firstName} ${lastName}`).trim();
    }

    // Individual user
    if (applicant?.applicantName && applicant.applicantName.trim() !== '') {
        return applicant.applicantName.trim();
    }

    return `${firstName} ${lastName}`.trim();
};
export const getColorFromName = (value: string) => {
    const firstChar = String(value).charAt(0);
    const lowerCaseValue = String(firstChar).toLowerCase();
    const colors = ['#DC4833', '#D4883A', '#91B798', '#42495B', '#ADB6D7', '#6281C3', '#7AC4D3', '#AFDF8D', '#F19133', '#4362B5', '#599CB4', '#71D789']
    const colorFromLetters: any = {
        a: colors[0],
        b: colors[1],
        c: colors[2],
        d: colors[3],
        e: colors[4],
        f: colors[5],
        g: colors[6],
        h: colors[7],
        i: colors[8],
        j: colors[9],
        k: colors[10],
        l: colors[11],
        m: colors[0],
        n: colors[1],
        o: colors[2],
        p: colors[3],
        q: colors[4],
        r: colors[5],
        s: colors[6],
        t: colors[7],
        u: colors[8],
        v: colors[9],
        w: colors[10],
        x: colors[11],
        y: colors[0],
        z: colors[1],
    }
    return colorFromLetters[lowerCaseValue] || colors[3];
}

export const isMobile = (
    (Platform?.OS === "ios" || Platform?.OS === "android"))
export function guessMimeType(fileName: string, fallback = "application/octet-stream") {
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    const map: Record<string, string> = {
        pdf: "application/pdf",
        txt: "text/plain",
        csv: "text/csv",
        json: "application/json",
        xml: "application/xml",
        zip: "application/zip",
        gz: "application/gzip",
        rar: "application/vnd.rar",
        "7z": "application/x-7z-compressed",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        svg: "image/svg+xml",
        mp3: "audio/mpeg",
        wav: "audio/wav",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
    };
    return map[ext] || fallback;
}

// Convert File -> Base64 (binary-safe)
export async function fileToBase64BinarySafe(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buf);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    // btoa expects binary string; this avoids data: prefix issues
    return btoa(binary);
}

// Safe filename (keep extension)
export function makeSafeTimestampedName(original: string) {
    const dot = original.lastIndexOf(".");
    const base = (dot >= 0 ? original.slice(0, dot) : original).replace(/\s+/g, "_").replace(/[^A-Za-z0-9._-]/g, "");
    const ext = dot >= 0 ? original.slice(dot + 1) : "";
    const stamp = Date.now();
    return `${stamp}-${base}${ext ? "." + ext : ""}`;
}
export function pickTypeHint(mime: string): "" | "photo" | "video" | "audio" {
    if (!mime) return "";
    if (mime.startsWith("image/")) return "photo";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    return "";
}

export function guessUploadMimeType(name: string): string {
    const n = name.toLowerCase();
    if (n.endsWith(".png")) return "image/png";
    if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
    if (n.endsWith(".webp")) return "image/webp";
    if (n.endsWith(".gif")) return "image/gif";
    if (n.endsWith(".pdf")) return "application/pdf";
    if (n.endsWith(".mp4")) return "video/mp4";
    if (n.endsWith(".mp3")) return "audio/mpeg";
    return "application/octet-stream";
}
export async function uploadToGithubContents(ownerRepo: string, pathInRepo: string, base64: string, token: string , message: string) {
    const url = `https://api.github.com/repos/${ownerRepo}/contents/${encodeURIComponent(pathInRepo).replace(/%2F/g, "/")}`;
    // simple retry for 403/429
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const res = await axios.put(
                url,
                { message, content: base64 },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github+json",
                    },
                }
            );
            return res.data?.content?.download_url as string | undefined;
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 403 || status === 429) {
                const retryAfter = Number(e?.response?.headers?.["retry-after"] || 1);
                await new Promise(r => setTimeout(r, (retryAfter || (attempt + 1)) * 1000));
                continue;
            }
            throw e;
        }
    }
    throw new Error("GitHub upload failed after retries.");
}
