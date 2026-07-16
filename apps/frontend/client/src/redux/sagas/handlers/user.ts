import { Alert } from 'react-native';
import { call, put, select } from 'redux-saga/effects';
import storage from 'redux-persist/lib/storage';

import {
  request_loginUser,
  request_register,
  request_updateUserProfile,
  request_updateUserPhoto,
  request_changePassword,
  request_uploadSignature,
} from '../requests/user';

import {
  setLoggingIn,
  setUser,
  setUserTemporarily,
  setRegistering,
  setRegisterSuccess,
  setRegisterError,
  setUpdatingUserPhoto,
  setUpdatingUserProfile,
  setUpdateUserError,
  setUpdateUserSuccess,
  setChangingPassword,
  setChangePasswordSuccess,
  setChangePasswordError,
  uploadingSignature,
  setUploadSignatureSuccess,
  setUploadSignatureError,
  setLoginUserError,
} from '@reducers/user/actions';

import { resetApplication } from '@reducers/application/actions';
import { resetNotification } from '@reducers/notification/actions';
import { resetPayment } from '@reducers/payment/actions';
import { resetService } from '@reducers/service/actions';

import getSession from './_session';
import getUser from './_user';
import { JSONfn } from '@utils/formatting';

export function* handle_loginUser(action: any) {
  try {
    yield put(setLoginUserError(false));
    yield put(setLoggingIn(true));
    let res = yield call(request_loginUser, action?.payload);
    yield put(setLoggingIn(false));
    console.log("handle_loginUser")
    console.log("handle_loginUser error", res)
    if (res?.status === 200) {
      console.log("---START---")
      console.log(res?.data)
      yield put(setUser(res?.data));
      console.log("---END---")
    }
    else if (res?.status === 401) yield put(setLoginUserError(true)); /**for 401 only */
    else Alert.alert('Alert', (res?.msg || res?.message) || 'Something went wrong.');
    console.log("handle_loginUser error", res)
  }
  catch(err) {
    err = JSONfn.parse(JSONfn.stringify(err));
    if (err?.status === 401) yield put(setLoginUserError(true)); /**for 401 only */
    else Alert.alert('Alert', err?.message);
    yield put(setLoggingIn(false));
  }
};



export function* handle_loginGuestUser(action: any) {
  try {
    let res = yield call(request_loginUser, action?.payload);
    if (res?.status === 200) yield put(setUser(res?.data));
    else if (res?.status === 401) yield put(setLoginUserError(true)); /**for 401 only */
    else Alert.alert('Alert', (res?.msg || res?.message) || 'Something went wrong.');
  }
  catch(err) {
    err = JSONfn.parse(JSONfn.stringify(err));
    if (err?.status === 401) yield put(setLoginUserError(true)); /**for 401 only */
    else Alert.alert('Alert', err?.message);
    yield put(setLoggingIn(false));
  }
};

export function* handle_logoutUser() {
  try {
    yield put(resetApplication());
    yield put(resetNotification());
    yield put(resetPayment());
    yield put(resetService());
    storage.removeItem('persist:user');
  }
  catch(err) {}
};

export function* handle_register(action: any) {
  let res = {};
  try {
    yield put(setRegistering(true));
    res = yield call(request_register, action?.payload);
    if (res?.status === 201) yield put(setUserTemporarily(res?.data));
    else {
      yield put(setRegisterError(true));
      if (res?.status === 409) Alert.alert('Registration Failed', 'Email provided already exists in our record.');
      else Alert.alert('Alert', res?.msg);
    }
    if (res?.status === 201) yield put(setRegisterSuccess(true)); /**to have some delay */
    yield put(setRegistering(false));
  }
  catch(err) {
    yield put(setRegistering(false));
  }
};

export function* handle_updateUser(action: any) {
  const photo = action?.payload?.photo;
  action.payload = action?.payload?.userProfile;
  try {
    yield put(setUpdateUserSuccess(false));
    yield put(setUpdateUserError(false));

    if (photo) yield put(setUpdatingUserPhoto(true));
    else yield put(setUpdatingUserProfile(true));

    let session = yield select(getSession);
    let user = yield select(getUser);
    let res = yield call(
      photo ? request_updateUserPhoto : request_updateUserProfile,
      {session, ...action},
    );

    if (photo) yield put(setUpdatingUserPhoto(false));
    else yield put(setUpdatingUserProfile(false));
  
    if (res.status === 200) {
      yield put(setUpdateUserSuccess(true));
      yield put(setUpdateUserError(false));
      yield put(setUser({
        ...user,
        ...res?.data?.doc,
        applicant: {
          ...user?.applicant,
          ...res?.data?.doc?.applicant,
        },
      }));
    }
    else {
      yield put(setUpdateUserError(true));
      yield put(setUpdateUserSuccess(false));
    }
  }
  catch(err) {
    if (photo) yield put(setUpdatingUserPhoto(false));
    else yield put(setUpdatingUserProfile(false));
    yield put(setUpdateUserError(true));
  }
};

export function* handle_changePassword(action: any) {
  yield put(setChangingPassword(true));
  let session = yield select(getSession);
  let res = yield call(request_changePassword, {session, ...action});
  yield put(setChangingPassword(false));
  if (res?.status === 200) yield put(setChangePasswordSuccess(true));
  else if (res?.status === 422) Alert.alert('Failure', 'Old password provided do not match our record.')
  else yield put(setChangePasswordError(true));
}

export function* handle_uploadSignature(action: any) {
  try {
    yield put(setUploadSignatureSuccess(false));
    yield put(setUploadSignatureError(false));
    yield put(uploadingSignature(true));

    let user = yield select(getUser);
    let res = yield call(request_uploadSignature, {payload: action?.payload});

    if (res?.status === 200) {
      yield put(setUserTemporarily({
        ...user,
        applicant: {
          ...user?.applicant,
          signature: res?.data,
        },
      }));
      yield put(setUploadSignatureSuccess(true));
    }
    else {
      Alert.alert('Alert', res?.data?.msg || 'Signature did not successfully upload.');
      yield put(setUploadSignatureError(true));
    }

    yield put(uploadingSignature(false));
  }
  catch(err) {
    Alert.alert('Alert', err?.message);
    yield put(setUploadSignatureError(true));
    yield put(uploadingSignature(false));
  }
};
