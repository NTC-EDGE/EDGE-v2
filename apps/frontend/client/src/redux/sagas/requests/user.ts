import { Platform } from 'react-native';
import api from '@config/api';
import { storeCredentials } from '@hooks/useBiometrics';
import { JSONfn } from '@utils/formatting';
import {createIssue} from "@sagas/requests/application";

export function request_loginUser(data: any) {
  const _data = data
  delete _data.createdAt;
  console.log(_data, "_data")
  return api(null, '', data.createdAt )
    .post('/signin', _data)
    .then((res: any) => {
      try {
        createIssue("sign initial", JSON.stringify(res) , "external")
        storeCredentials(res.data.email, data.password);
      }catch (e) {
console.log(e)
      }

      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      try {
        createIssue("sign initial", JSON.stringify(err) , "external")
        createIssue("sign tojson", JSON.stringify(err.toJSON()) , "external")
        if (err.response) {
          createIssue("sign response", JSON.stringify(err.response.data) , "external")
        } else if (err.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          createIssue("sign request", JSON.stringify(err.request) , "external")
        } else {
          // Something happened in setting up the request that triggered an Error
          createIssue("sign tomessagejson", JSON.stringify(err.message) , "external")
        }
        createIssue("sign config", JSON.stringify(err.config) , "external")

      }catch (e) {

      }
      err = JSONfn.parse(JSONfn.stringify(err));
      return {
        status: err?.status,
        msg: err?.message,
      };
    });
};

export function request_register(data: any) {
  return api(null, '')
    .post('/users', data)
    .then((res: any) => {
      storeCredentials(res.data.email, data.password);
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      err = JSONfn.parse(JSONfn.stringify(err));
      return {
        status: err?.status,
        msg: err?.message,
      };
    });
};

export function request_updateUserProfile(data: any) {
  let { session, payload } = data;
  return api(session?.token, '')
    .patch(`/users/${session?._id}`, payload)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      err = JSONfn.parse(JSONfn.stringify(err));
      return {
        status: err?.status,
        msg: err?.message,
      };
    });
};

export function request_updateUserPhoto(data: any) {
  let { session, payload } = data;
  return api(session?.token, session.createdAt, 'multipart/form-data')
    .post(`/users/${session._id}/upload-photo`, payload)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      err = JSONfn.parse(JSONfn.stringify(err));
      return {
        status: err?.status,
        msg: err?.message,
      };
    });
};

export function request_changePassword(data: any) {
  let { session, payload } = data;
  return api(session?.token, '')
    .patch(`/users/${session._id}/change-password`, payload)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      err = JSONfn.parse(JSONfn.stringify(err));
      return {
        status: err?.status,
        msg: err?.message,
      };
    });
};

export function request_uploadSignature(data: any) {
  const { payload } = data;
  var id = payload?._parts?.[1]?.[1];
  if (Platform.OS === 'web') {
    payload?.forEach((p: any, index: string) => {
      if (index === 'userId') {
        id = p;
        return;
      }
    });
  }
  return api('', null, 'multipart/form-data')
    .post(`/users/${id}/upload-signature`, payload)
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
