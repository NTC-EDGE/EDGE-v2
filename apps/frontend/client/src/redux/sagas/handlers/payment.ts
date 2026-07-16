import {Alert, Platform} from 'react-native';
import { call, put, select } from 'redux-saga/effects';

import {
  request_pay,
  request_uploadPayment
} from '../requests/payment';
import {
  setPaying,
  setPaymentSuccess,
  setPaymentError,
  setUploadingPayment,
  setPaymentOptions,
  setPaymentOption
} from '@reducers/payment/actions';

import getSession from './_session';
import {request_loginUser} from "@sagas/requests/user";
import {GUEST_USER} from "@utils/ntc";

export function* handle_pay(action: any) {
  try {
    yield put(setPaying(true));
    let session = yield select(getSession);
    let user = null

    if(!session.token){

      user = yield call(request_loginUser, {
        ...GUEST_USER
    });

      session.token = user.data.sessionToken;
    }

    let res = yield call(request_pay, {session, ...action});
    if (res?.status === 200) yield put(setPaymentSuccess(true));
    else {
      yield put(setPaymentError(true));
      if(Platform.OS == "web"){
        window.alert(res?.msg);
      }else{
        Alert.alert('Alert', res?.msg);
      }

    }

    yield put(setPaying(false));
  }
  catch(err) {
    yield put(setPaying(false));
  }
};

export function* handle_uploadPayment(action: any) {
  var { paymentOption = {}, file, formData } = action?.payload;
  if (paymentOption) paymentOption.uploading = true;

  try {
    yield put(setPaymentOption(paymentOption));

    let session = yield select(getSession);
    let res = yield call(request_uploadPayment, {session, payload: formData});

    let success = res?.status === 200 && !res?.data?.failure;

    if (paymentOption) {
      paymentOption.uploading = false;
      paymentOption.uploaded = success;
      paymentOption.file = success ? paymentOption.file ?  [...paymentOption.file , {...file, uploading:false, uploaded: success } ] : [{...file, uploading:false, uploaded: success }] : paymentOption.file;
      paymentOption.links = success ? paymentOption.links ?  [...paymentOption.links, res?.data  ]:  [res?.data ]  :paymentOption.links;

    }
    if (!success && res?.data?.msg) Alert.alert('Alert', res?.data?.msg);

    yield put(setPaymentOption(paymentOption));
  }
  catch(err) {
    paymentOption.uploading = false;
    yield put(setPaymentOption(paymentOption));
  }
};
