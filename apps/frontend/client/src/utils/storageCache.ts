
import { hashJson } from "./hash";
import {CachePayload, storage} from "@utils/storage";

// import { api } from "./api";

export const CACHE_KEY = "regions:v2";
export const DEFAULT_TTL_MS = 1000 * 60 * 60; // 1h
export const LONG_TTL_MS = 1000 * 60 * 60 * 24; // 24h

export type FetchResult<T> = {
    status: number | "cached" | "error";
    data?: T;
    source?: "network" | "network-validated" | "cache";
    wasUpdated?: boolean;       // true if network returned new content vs cache
    isSameAsCache?: boolean;    // true if network says "not modified" OR same hash
    stale?: boolean;            // cache past TTL
    diffSummary?: { added: number; removed: number }; // best-effort array diff
    msg?: string;
};

export function withTimeout<T>(p: Promise<T>, ms: number) {
    return new Promise<T>((resolve, reject) => {
        const id = setTimeout(() => reject(new Error("Request timeout")), ms);
        p.then(v => { clearTimeout(id); resolve(v); },
            e => { clearTimeout(id); reject(e); });
    });
}

export function bestEffortArrayDiff(now: any, prev: any) {
    if (!Array.isArray(now) || !Array.isArray(prev)) return undefined;
    // If objects have 'id', use that; else fall back to JSON hash per item
    const key = (x: any) => x && (x.id ?? hashJson(x));
    const sNow = new Set(now.map(key));
    const sPrev = new Set(prev.map(key));
    let added = 0, removed = 0;
    for (const k of sNow) if (!sPrev.has(k)) added++;
    for (const k of sPrev) if (!sNow.has(k)) removed++;
    return { added, removed };
}

export async function readCache<T>(key: string = CACHE_KEY): Promise<CachePayload<T> | null> {
    const raw = await storage.get(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as CachePayload<T>; } catch { return null; }
}

export async function writeCache<T>(payload: CachePayload<T>, key: string = CACHE_KEY) {
    await storage.set(key, JSON.stringify(payload));
}
