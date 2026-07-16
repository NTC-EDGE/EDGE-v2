function stableStringify(obj: any): string {
    if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(",")}]`;
    return `{${Object?.keys(obj).sort().map(k => JSON.stringify(k)+":"+stableStringify(obj[k])).join(",")}}`;
}

export function hashJson(obj: any): string {
    const s = stableStringify(obj);
    let h = 0x811c9dc5; // FNV-1a 32-bit
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = (h >>> 0) * 0x01000193; // unsigned
    }
    return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}
