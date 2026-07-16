export type CachePayload<T> = {
    savedAt: number;
    ttlMs: number;
    data: T;
    etag?: string | null;
    lastModified?: string | null;
    hash?: string | null;
};

const mem = new Map<string, string>();

export const storage = {
    async get(key: string) {
        try { if (typeof localStorage !== "undefined") return localStorage.getItem(key); } catch {}
        return mem.get(key) ?? null;
    },
    async set(key: string, val: string) {
        try { if (typeof localStorage !== "undefined") return localStorage.setItem(key, val); } catch {}
        mem.set(key, val);
    },
    async remove(key: string) {
        try { if (typeof localStorage !== "undefined") return localStorage.removeItem(key); } catch {}
        mem.delete(key);
    },
};
