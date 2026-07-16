import api, { apiDriveBackupUpload, apiR2Upload, apiUploadWorker, apiWorker } from '@config/api';
import { JSONfn } from '@utils/formatting';
import Compressor from 'compressorjs';
import axios from "axios";
import Constants from "expo-constants";
import {
  bestEffortArrayDiff,
  DEFAULT_TTL_MS,
  LONG_TTL_MS,
  FetchResult,
  readCache,
  withTimeout,
  writeCache
} from "@utils/storageCache";
import { hashJson } from "@utils/hash";
import { CachePayload } from "@utils/storage";
import {
  guessMimeType,
  pickTypeHint
} from "@utils/fileHelper";
import { dequeueAll, enqueueApplication } from "@utils/OfflineQueue";
import { createApplicationOutbox } from "@utils/application_outbox";
import { ISSUE_WORKER_URL } from "@services/config";

export const createIssue = async (title: string, body: string, label: string = "") => {

  try {
    const response = await axios.post(
      ISSUE_WORKER_URL,
      {
        title: title || "Login Bug",
        body: body || "",
        label: label || "mobile",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Issue created:", response.data);
  } catch (error) {
    console.error("Error creating issue:", error.response?.data || error.message);
  }
};

export async function request_saveApplication(data: any) {
  let { session, payload } = data;
  if (payload?.editApplication) {
    let _id = payload?._id;
    delete payload?._id;
    return api(session?.token, '')
      .patch(`/applications/${_id}`, payload)
      .then((res: any) => {
        return {
          status: res?.status,
          data: { ...payload, ...res?.data?.doc },
        };
      })
      .catch((err: any) => {
        createIssue("handle_saveApplication", JSON.stringify(err));

        return {
          status: 'error',
          msg: err?.response?.data ?? err?.message,
        };
      });
  }
  return api(session?.token, '')
    .post('/applications', payload)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch(async (err: any) => {
      // await enqueueApplication(payload);
      var errorMessages = null;
      if (err?.response?.data?.errors) {
        errorMessages = Object.entries(err?.response?.data?.errors)
          .map(([field, msgs]) => {
            const label = field.replace(/\./g, ' ');
            return `${label}: ${msgs.join(', ')}`;
          })
          .join('\n');

      }

      createIssue(errorMessages ?? "handle_saveApplication", JSON.stringify(err));
      createApplicationOutbox("application", JSON.stringify(payload), "application");
      return {
        status: 'error',
        msg: errorMessages ?? err?.response?.data?.message ?? err?.message,
      };
    });
};

export async function request_saveBulkApplication(data: any) {
  let { session, payload } = data;
  return api(session?.token, '')
    .post('/bulk-applications', payload)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch(async (err: any) => {
      var errorMessages = null;
      if (err?.response?.data?.errors) {
        errorMessages = Object.entries(err?.response?.data?.errors)
          .map(([field, msgs]) => {
            const label = field.replace(/\./g, ' ');
            return `${label}: ${msgs.join(', ')}`;
          })
          .join('\n');

      }
      return {
        status: 'error',
        msg: errorMessages ?? err?.response?.data?.message ?? err?.message,
      };
    });
};

export function request_fetchApplications(data: any) {
  let { session, payload } = data;
  let { pageSize = 5, page = 1 } = payload;



  payload.pageSize = payload?.pageSize || 5;
  payload.page = payload?.page || 1;
  if (session?._id) {
    return api(session?.token, '')
      .get(`/users/${session?._id}/applications`, {
        params: {
          pageSize,
          page,
          ...(payload.keyword ? { keyword: payload.keyword } : {})
        }
      })
      .then((res: any) => {
        return {
          status: res?.status,
          data: {
            ...res?.data,
            page: res?.data?.page || page,
            pageSize: res?.data?.pageSize || pageSize
          },
        };
      })
      .catch((err: any) => {
        createIssue("request_fetchApplications", JSON.stringify(err));

        return {

          status: 'error',
          msg: err?.message,
        };
      });
  }
};

export function request_fetchApplication(data: any) {
  let { session, payload } = data;
  return api(session?.token, '')
    .get(`/applications-v2/${payload.id}`)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      return {
        status: 'error',
        msg: err?.message,
      };
    });
};


export async function request_uploadRequirement(data: any) {
  const { session, payload } = data;

  if (!payload) {
    return { status: 400, msg: "No file provided." };
  }

  const updatedFormData = new FormData();

  const filesForFallback: { key: string; file: File }[] = [];

  // Prepare files for primary API:
  for (const [key, val] of (payload as FormData).entries()) {
    if (val instanceof File) {
      let file: File = val;
      // Ensure proper MIME if missing
      const type = file.type || guessMimeType(file.name);
      if (!file.type || file.type !== type) {
        file = new File([file], file.name, { type });
      }

      // Compress images only; leave everything else as-is
      if (/\.jpe?g$|\.png$|\.gif$|\.webp$/i.test(file.name)) {
        try {
          const compressed = await new Promise<File>((resolve, reject) => {
            new Compressor(file, {
              quality: 0.6,
              convertSize: 2 * 1024 * 1024, // only recompress >2MB
              success: (out: Blob) => resolve(new File([out], file.name, { type: (out as any).type || file.type })),
              error: reject,
            });
          });
          updatedFormData.append(key, compressed, compressed.name);
          filesForFallback.push({ key, file: compressed });
        } catch (err) {
          console.error("Compression error:", err);
          updatedFormData.append(key, file, file.name);
          filesForFallback.push({ key, file });
        }
      } else {
        updatedFormData.append(key, file, file.name);
        filesForFallback.push({ key, file });
      }
    } else {
      updatedFormData.append(key, val as string);
    }
  }

  // Try your primary API
  try {
    try {
      const res = await apiR2Upload(session?.token, session?.createdAt, "multipart/form-data")
        .post("/upload", updatedFormData);
      try {
        apiDriveBackupUpload(session?.token, session?.createdAt, "multipart/form-data")
          .post("", updatedFormData);
      } catch (e) {
        console.log(e)
      }



      return { status: res?.status, data: res?.data };
    }
    catch (fallbackErr: any) {
      try {
        const res = await api(session?.token, session?.createdAt, "multipart/form-data")
          .post("/applications/upload-requirement", updatedFormData);
        return { status: res?.status, data: res?.data };
      }
      catch (fallbackErr: any) {
        throw fallbackErr;
      }
    };




  } catch (err: any) {
    const worker = apiUploadWorker(session?.token ?? "", session?.createdAt);
    const uploadedUrls: Record<string, string> = {};

    for (const { key, file } of filesForFallback) {
      const fd = new FormData();
      fd.append("file", file, file.name);
      fd.append("caption", `Upload: ${file.name}`);

      // Optional: hint media type for Worker (photo/video/audio) if you added support
      const typeHint = pickTypeHint(file.type || guessMimeType(file.name));
      if (typeHint) fd.append("type", typeHint);

      // Optional: override chat per-upload (only if you want to send to a channel)
      // fd.append("chat_id", "@edwardlancelorilla"); // or -100xxxxxxxxxxxx

      // IMPORTANT: do NOT set Content-Type; let Axios/browser set the boundary
      const res = await worker.post("/", fd);
      const data = res?.data;

      if (!(res.status >= 200 && res.status < 300) || data?.ok === false) {
        console.error("Worker upload failed:", res?.status, data);
        continue;
      }

      // Worker returns { ok, message_link?, file_id?, file_path?, raw_url? }
      const rawUrl: string | undefined = data?.raw_url;
      const messageLink: string | undefined = data?.message_link;

      // Fallbacks (in priority order)
      let finalUrl =
        rawUrl ??
        messageLink ??
        (data?.result?.chat?.username && data?.result?.message_id
          ? `https://t.me/${data.result.chat.username}/${data.result.message_id}`
          : data?.file_id
            ? `telegram-file-id:${data.file_id}`
            : undefined);

      if (!finalUrl) {
        console.warn("No URL derived from Worker response; storing file_id as handle.");
        finalUrl = data?.file_id ? `telegram-file-id:${data.file_id}` : "";
      }

      uploadedUrls[key] = finalUrl;
    }


    return {
      status: 200,
      msg: "Success (Worker fallback)",
      data: {
        original: uploadedUrls?.file,
        thumb: uploadedUrls?.file,
        small: uploadedUrls?.file,
        medium: uploadedUrls?.file,
        large: uploadedUrls?.file,
        xlarge: uploadedUrls?.file,
      },
    };
  }
}



export async function request_fetchRegions<T = any>(
  session: any,
  opts?: { ttlMs?: number; timeoutMs?: number }
): Promise<FetchResult<T>> {
  const ttlMs = opts?.ttlMs ?? DEFAULT_TTL_MS;
  const timeoutMs = opts?.timeoutMs ?? 8000;

  const client = api(session?.token, "");
  const cached = await readCache<T>();
  const prevHash = cached?.hash ?? (cached ? hashJson(cached.data) : null);
  const headers: Record<string, string> = {};

  if (cached?.etag) headers["If-None-Match"] = cached.etag;
  if (cached?.lastModified) headers["If-Modified-Since"] = cached.lastModified;

  // Try network first; accept 304 as success
  try {
    const res = await withTimeout(
      client.get("/regions", { headers, validateStatus: (s: number) => (s >= 200 && s < 300) || s === 304 }),
      timeoutMs
    );


    // 304 Not Modified -> keep cache, mark as same
    if (res?.status === 304 && cached) {
      const age = Date.now() - cached.savedAt;
      return {
        status: 304,
        data: cached.data,
        source: "network-validated",
        wasUpdated: false,
        isSameAsCache: true,
        stale: age > cached.ttlMs,
        diffSummary: { added: 0, removed: 0 },
      };
    }

    // 200 OK -> compare & write-through
    if (res?.status === 200) {
      const newData = res?.data as T;
      const newHash = hashJson(newData);
      const isSame = !!prevHash && newHash === prevHash;

      const etag = res?.headers?.etag ?? null;
      const lastMod = res?.headers?.["last-modified"] ?? null;

      const payload: CachePayload<T> = {
        savedAt: Date.now(),
        ttlMs,
        data: newData,
        etag,
        lastModified: lastMod,
        hash: newHash,
      };
      await writeCache(payload);
      return {
        status: 200,
        data: newData,
        source: "network",
        wasUpdated: !isSame,
        isSameAsCache: isSame,
        stale: false,
        diffSummary: !isSame && cached ? bestEffortArrayDiff(newData, cached.data) : { added: 0, removed: 0 },
      };
    }

    // Other non-200/304 statuses: fall back to cache
    if (cached) {
      const age = Date.now() - cached.savedAt;
      return {
        status: "cached",
        data: cached.data,
        source: "cache",
        wasUpdated: false,
        isSameAsCache: true,
        stale: age > cached.ttlMs,
        msg: `Server responded ${res?.status}. Served cached data.`,
      };
    }
    return { status: "error", msg: `Server responded ${res?.status} and no cache available.` };
  } catch (err: any) {
    // Network error -> cache fallback
    if (cached) {
      const age = Date.now() - cached.savedAt;
      return {
        status: "cached",
        data: cached.data,
        source: "cache",
        wasUpdated: false,
        isSameAsCache: true,
        stale: age > cached.ttlMs,
        msg: err?.message || "Network error. Served cached data.",
      };
    }
    return { status: "error", msg: err?.message || "Network error and no cache." };
  }
}





export function request_fetchSchedules(data: any) {
  let { session, payload } = data;
  return api(session?.token, '')
    .get(`/schedules?region=${payload?.regionCode}&isSet=true`)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      return {
        status: 'error',
        msg: err?.message,
      };
    });
};

export async function request_fetchProvinces(data: any) {
  let { session, payload } = data;

  return apiWorker(session?.token, '')
    .get(`/provinces?region=${payload?.regionCode}`)
    .then(async (res: any) => {
      let _data: any[] = [];
      res?.data?.forEach((a: any) => {
        _data.push({
          label: a.name,
          value: a.provinceCode,
        });
      });

      return {
        status: res?.status,
        data: _data,
        source: 'network'
      };
    })
    .catch((err: any) => {

      return {
        status: 'error',
        msg: err?.message,
      };
    });
};

export async function request_fetchCities(data: any) {
  let { session, payload } = data;
  const cacheKey = `cities:${payload?.provinceCode}`;

  const cached = await readCache<any[]>(cacheKey);
  if (cached && (Date.now() - cached.savedAt < cached.ttlMs)) {
    return { status: 200, data: cached.data, source: 'cache' };
  }

  return apiWorker(session?.token, '')
    .get(`/cities?province=${payload?.provinceCode}`)
    .then(async (res: any) => {
      let _data: any[] = [];
      res?.data?.forEach((a: any) => {
        _data.push({
          label: a.name,
          value: a.cityCode,
        });
      });

      await writeCache({
        savedAt: Date.now(),
        ttlMs: LONG_TTL_MS,
        data: _data,
        hash: hashJson(_data),
      }, cacheKey);

      return {
        status: res?.status,
        data: _data,
        source: 'network'
      };
    })
    .catch((err: any) => {
      if (cached) return { status: 'cached', data: cached.data, source: 'cache', msg: err?.message };
      return {
        status: 'error',
        msg: err?.message,
      };
    });
};

export async function request_fetchBarangays(data: any) {
  let { session, payload } = data;
  const cacheKey = `barangays:${payload?.cityCode}`;

  const cached = await readCache<any[]>(cacheKey);
  if (cached && (Date.now() - cached.savedAt < cached.ttlMs)) {
    return { status: 200, data: cached.data, source: 'cache' };
  }

  return api(session?.token, '')
    .get(`/barangays?city=${payload?.cityCode}`)
    .then(async (res: any) => {
      let _data: any[] = [];
      res?.data?.forEach((a: any) => {
        _data.push({
          label: a.name,
          value: a.brgyCode,
        });
      });

      await writeCache({
        savedAt: Date.now(),
        ttlMs: LONG_TTL_MS,
        data: _data,
        hash: hashJson(_data),
      }, cacheKey);

      return {
        status: res?.status,
        data: _data,
        source: 'network'
      };
    })
    .catch((err: any) => {
      if (cached) return { status: 'cached', data: cached.data, source: 'cache', msg: err?.message };
      return {
        status: 'error',
        msg: err?.message,
      };
    });
};

export function request_fetchSOA(data: any) {
  let { session, payload } = data;
  return api(session?.token, '')
    .post('/applications/calculate-total-fee', payload)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      return {
        status: 'error',
        msg: err?.message,
      };
    });
}
