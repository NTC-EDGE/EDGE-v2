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

