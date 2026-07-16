import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {store} from "@services/store";
import {
    BACKUP_WORKER_URL,
    BASE_UPLOAD_WORKER_URL,
    BASE_URL,
    BASE_WORKER_URL,
    R2_BASE_URL,
    SWAGGER_VERSION
} from "@services/config";


function getCreatedAt(config: AxiosRequestConfig<any>) {
  const state = store.getState();
  const createdAt = state?.user?.createdAt ?? "";
  if (createdAt && config) {
    config.headers['CreatedAt'] = createdAt;
    config.headers['Version'] = SWAGGER_VERSION;
  }
}

let CreatedAt: string | null = null
export const changeCreatedAt = (regionValue: string) =>  {
  if (regionValue === 'I') {
    CreatedAt = 'ntc-region1';
  } else if (regionValue === 'II') {
    CreatedAt = 'ntc-region2';
  } else if (regionValue === 'III') {
    CreatedAt = 'ntc-region3';
  } else if (regionValue === 'IV-A') {
    CreatedAt = 'ntc-region4a';
  } else if (regionValue === 'IV-B') {
    CreatedAt = 'ntc-region4b';
  } else if (regionValue === 'V') {
    CreatedAt = 'ntc-region5';
  } else if (regionValue === 'VI') {
    CreatedAt = 'ntc-region6';
  } else if (regionValue === 'VII') {
    CreatedAt = 'ntc-region7';
  } else if (regionValue === 'VIII') {
    CreatedAt = 'ntc-region8';
  } else if (regionValue === 'IX') {
    CreatedAt = 'ntc-region9';
  } else if (regionValue === 'X') {
    CreatedAt = 'ntc-region10';
  } else if (regionValue === 'XI') {
    CreatedAt = 'ntc-region11';
  } else if (regionValue === 'XII') {
    CreatedAt = 'ntc-region12';
  } else if (regionValue === 'XIII') {
    CreatedAt = 'ntc-region13';
  } else if (regionValue === 'NCR') {
    CreatedAt = 'ntc-ncr';
  } else if (regionValue === 'CAR') {
    CreatedAt = 'ntc-car';
  } else if (regionValue === 'BARMM') {
    CreatedAt = 'ntc-barmm';
  } else {
    CreatedAt = 'ntc-unknown';
  }
  return CreatedAt
}
let instance: AxiosInstance | null = null;

const createInstance = (token: string,   createdBy?: string, contentType?: string): AxiosInstance => {

  const state = store.getState();
  const createdAtStore = state?.user?.createdAt ?? "";
  const createdAt = createdBy || createdAtStore || "ntc-region10";
  return Axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-type': (contentType || 'application/json'),
      Authorization: `Bearer ${token}`,
      CreatedAt: createdAt,
        Version: SWAGGER_VERSION
    }
  });
};

const createR2Instance = (token: string,   createdBy?: string, contentType?: string): AxiosInstance => {
  const state = store.getState();
  const createdAtStore = state?.user?.createdAt ?? "";
  const createdAt = createdBy || createdAtStore || "ntc-region10";
  return Axios.create({
    baseURL: R2_BASE_URL,
    headers: {
        'Content-type': (contentType || 'application/json'),
      Authorization: `Bearer ${token}`,
      CreatedAt: createdAt,
        Version: SWAGGER_VERSION
    }
  });
};
const createGDriveInstance = (token: string,   createdBy?: string, contentType?: string): AxiosInstance => {
    const state = store.getState();
    const createdAtStore = state?.user?.createdAt ?? "";
    const createdAt = createdBy || createdAtStore || "ntc-region10";
    return Axios.create({
        baseURL: BACKUP_WORKER_URL,
        headers: {
            'Content-type': (contentType || 'application/json'),
            Authorization: `Bearer ${token}`,
            CreatedAt: createdAt,
            Version: SWAGGER_VERSION
        }
    });
};
const createWorkerInstance = (token: string,   createdBy?: string, contentType?: string): AxiosInstance => {
  const state = store.getState();
  const createdAtStore = state?.user?.createdAt ?? "";
  const createdAt = createdBy || createdAtStore || "ntc-region10";
  return Axios.create({
    baseURL: BASE_WORKER_URL,
    headers: {
      'Content-type': (contentType || 'application/json'),
      Authorization: `Bearer ${token}`,
      CreatedAt: createdAt,
        Version: SWAGGER_VERSION
    }
  });
};

const createUploadWorkerInstance = (
    token: string,
    createdBy?: string,
    contentType?: string
): AxiosInstance => {
  const state = store.getState();
  const createdAtStore = state?.user?.createdAt ?? "";
  const createdAt = createdBy || createdAtStore || "ntc-region10";

  // Build headers but omit Content-Type by default
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token || ""}`,
    CreatedAt: createdAt,
      Version: SWAGGER_VERSION
  };
  if (contentType) headers["Content-Type"] = contentType; // only set if explicitly passed

  return Axios.create({
    baseURL: BASE_UPLOAD_WORKER_URL,
    headers,
  });
};
export const apiWorker = (token: string, _createdBy?: string, contenttype?: string) => {
  instance = createWorkerInstance(token, _createdBy, contenttype);
  instance.interceptors.request.use(
      function (config) {
        getCreatedAt(config);
        return config;
      },
      function (error) {

        return Promise.reject(error);
      }
  );
  instance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        return Promise.reject(error);
      }
  );

  return instance;
};

export const apiUploadWorker = (token: string, _createdBy?: string, contenttype?: string) => {
  instance = createUploadWorkerInstance(token, _createdBy, contenttype);
  instance.interceptors.request.use(
      function (config) {
        getCreatedAt(config);
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
  );
  instance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        return Promise.reject(error);
      }
  );

  return instance;
};

export const apiR2Upload = (token: string, _createdBy?: string, contenttype?: string) => {
  instance = createR2Instance(token, _createdBy, contenttype);
  instance.interceptors.request.use(
      function (config) {
        getCreatedAt(config);
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
  );
  instance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        return Promise.reject(error);
      }
  );

  return instance;
};
export const apiDriveBackupUpload = (token: string, _createdBy?: string, contenttype?: string) => {
    instance = createGDriveInstance(token, _createdBy, contenttype);
    instance.interceptors.request.use(
        function (config) {
            getCreatedAt(config);
            return config;
        },
        function (error) {
            return Promise.reject(error);
        }
    );
    instance.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            return Promise.reject(error);
        }
    );

    return instance;
};


const api = (token: string, _createdBy?: string, contenttype?: string) => {
  instance = createInstance(token, _createdBy, contenttype);
  instance.interceptors.request.use(
      function (config) {
        getCreatedAt(config);
        return config;
      },
      function (error) {

        return Promise.reject(error);
      }
  );
  instance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        return Promise.reject(error);
      }
  );

  return instance;
};

export default api;



