import api from '@config/api';
import { Platform } from 'react-native';
import {call} from "redux-saga/effects";
import {request_loginUser} from "@sagas/requests/user";
import {GUEST_USER} from "@utils/ntc";
 
export function request_pay(data: any) { /**lacking */
  const { session, payload } = data;

  return api(session?.token, '')
    .patch(`/applications/${payload?.applicationId}/pay`, {
      paymentMethod: payload?.payment,
      file: payload?.file,
    })
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

export function request_uploadPayment(data: any) {
  const { session, payload } = data;
  var id = payload?._parts?.[2]?.[1];
  if (Platform.OS === 'web') {
    payload?.forEach((p: any, index: string) => {
      if (index === 'applicationId') {
        id = p;
        return;
      }
    });
  }
  return api(session?.token, session.createdAt, 'multipart/form-data', true)
    .post(`/applications/${id}/upload-proof-of-payment`, payload)
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
