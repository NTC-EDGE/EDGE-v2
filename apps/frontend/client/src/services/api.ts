import Axios, { AxiosRequestConfig } from 'axios';
import { BASE_URL } from './config';
import {store} from "./store";
function getCreatedAt(config: AxiosRequestConfig<any>) {
  const state = store.getState();
  const createdAt = state?.user?.createdAt ?? "";
  if (createdAt && config) {
    config.headers['CreatedAt'] = createdAt;
  }
}
const api = (token: any, createdBy?: string) => {
  const state = store.getState();
  const createdAtStore = state?.user?.createdAt ?? "";
  const instance = Axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(createdBy || createdAtStore ? {CreatedAt: createdBy || createdAtStore} : {})
    }
  });

  // Add a request interceptor
  instance.interceptors.request.use(function (config) {
    getCreatedAt(config);
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

  // Add a response interceptor
  instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });

  return instance;
}

export default api;