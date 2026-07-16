
import {Alert, Platform} from 'react-native';

import { call, put, select } from 'redux-saga/effects';

import {
  request_saveApplication,
  request_saveBulkApplication,
  request_uploadRequirement,
  request_fetchApplications,
  request_fetchApplication,
  request_fetchRegions,
  request_fetchSchedules,
  request_fetchProvinces,
  request_fetchCities,
  request_fetchBarangays,
  request_fetchSOA
} from '../requests/application';

import {
  setSavingApplication,
  setSaveApplicationError,
  setSaveApplicationSuccess,
  setFetchingApplications,
  setFetchingApplication,
  addApplication,
  setApplications,
  setApplication,
  setUploadingRequirement,
  setUploadRequirementSuccess,
  setUploadRequirementError,
  setApplicationCart,
  setFetchingRegions,
  setRegions,
  setFetchingSchedules,
  setSchedules,
  setFetchingProvinces,
  setProvinces,
  setFetchingCities,
  setCities,
  setFetchingBarangays,
  setBarangays,
  setFetchingSOA,
  setSOA,
  setFetchSOAError,
  setFetchSOASuccess,
  batchAddApplications, setSavingBulkApplication, setSaveBulkApplicationSuccess, setSaveBulkApplicationError
} from '@reducers/application/actions';

import getSession from './_session';
import {getCredentials} from "@hooks/useBiometrics";
import {request_loginUser} from "@sagas/requests/user";
import {setUser} from "@reducers/user/actions";
import {addBulkApplication, clearBulkApplication} from "@reducers/theme/actions";
export function* handle_saveApplication(action: any) {
  try {
    yield put(setSavingApplication(true));
    yield put(setSaveApplicationSuccess(false));
    yield put(setSaveApplicationError(false));
    yield put(setFetchSOASuccess(false));
    yield put(setFetchSOAError(false));

    let session = yield select(getSession);

    let res = yield call(request_saveApplication, {session, ...action});
    if (res?.status === 401 ) {
      const creds = getCredentials()
      if (!creds) throw new Error("Not logged in");
      let result = yield call(request_loginUser, {
        email: creds?.username,
        password: creds?.password,
      });
      if (result?.status === 200) {
        session.token = result.data.sessionToken;
        yield put(setUser(result?.data));
        let _res = yield call(request_saveApplication, {session, ...action});
        if (_res?.status === 201 || _res?.status === 200) {
          yield put(setSaveApplicationSuccess(true));
          yield put(addApplication(_res?.data));
        }
      }
    }
    if (res?.status === 201 || res?.status === 200) {
      yield put(setSaveApplicationSuccess(true));
      yield put(addApplication(res?.data));
    }
    else {
      yield put(setSaveApplicationError(true));
      var msg = res?.msg;
      if (Platform.OS === 'web') {
        if(res?.msg == "User not found."){

          msg = `Oops! We couldn’t find your account.\n The selected region does not match the user's registration. — each region has its own system.\n
If you signed up in ${action.payload.applicant?.address?.region}, your account won’t show up in Region ${action?.payload?.region}.\n
Want to apply in Region ${action?.payload?.region}? Just create a new account for that region. 😊`
        }
        window.alert( msg ?? 'Something went wrong');
      }else{
        Alert.alert('Alert', msg);
      }

    }

    yield put(setSavingApplication(false));
  }
  catch(err) {
    yield put(setSaveApplicationError(true));
    yield put(setSavingApplication(false));
    if (Platform.OS === 'web') {
      console.log(err, "err")
      window.alert( 'Something went wrong');
    }else{
      Alert.alert('Alert', res?.msg);
    }

  }
};


export function* handle_saveBulkApplication(action: any) {
  try {
    yield put(setSavingBulkApplication(true));
    yield put(setSaveBulkApplicationSuccess(false));
    yield put(setSaveBulkApplicationError(false));
    yield put(setFetchSOASuccess(false));
    yield put(setFetchSOAError(false));

    let session = yield select(getSession);

    let res = yield call(request_saveBulkApplication, {session, ...action});
    if (res?.status === 401 ) {
      const creds = getCredentials()
      if (!creds) throw new Error("Not logged in");
      let result = yield call(request_loginUser, {
        email: creds?.username,
        password: creds?.password,
      });
      if (result?.status === 200) {
        session.token = result.data.sessionToken;
        yield put(setUser(result?.data));
        let _res = yield call(request_saveBulkApplication, {session, ...action});
        if (_res?.status === 201 || _res?.status === 200) {
          yield put(setSaveBulkApplicationSuccess(true));
          yield put(clearBulkApplication());

        }
      }
    }
    if (res?.status === 201 || res?.status === 200) {
      yield put(setSaveBulkApplicationSuccess(true));
      yield put(clearBulkApplication());
    }
    else {
      yield put(setSaveBulkApplicationError(true));
      var msg = res?.msg;
      if (Platform.OS === 'web') {
        if(res?.msg == "User not found."){

          msg = `Oops! We couldn’t find your account.\n The selected region does not match the user's registration. — each region has its own system.\n
If you signed up in ${action.payload.applicant?.address?.region}, your account won’t show up in Region ${action?.payload?.region}.\n
Want to apply in Region ${action?.payload?.region}? Just create a new account for that region. 😊`
        }
        window.alert( msg ?? 'Something went wrong');
      }else{
        Alert.alert('Alert', msg);
      }

    }

    yield put(setSavingBulkApplication(false));
  }
  catch(err) {
    yield put(setSaveBulkApplicationError(true));
    yield put(setSavingBulkApplication(false));
    if (Platform.OS === 'web') {
      console.log(err, "err")
      window.alert( 'Something went wrong');
    }else{
      Alert.alert('Alert', res?.msg);
    }

  }
};




export function* handle_fetchApplications(action: any) {
  try {
    yield put(setFetchingApplications(true));

    let session = yield select(getSession);
    let res = yield call(request_fetchApplications, {session, ...action});
    if (res?.data) yield put(setApplications(res?.data));
    yield put(setFetchingApplications(false));
  }
  catch(err) {
    yield put(setFetchingApplications(false));
    Alert.alert('Alert', err?.message);
  }
};

export function* handle_fetchApplication(action: any) {
  try {
    yield put(setFetchingApplication(true));

    let session = yield select(getSession);
    let res = yield call(request_fetchApplication, {session, ...action});
    if (res?.data) yield put(setApplication(res?.data));

    yield put(setFetchingApplication(false));
  }
  catch(err) {
    yield put(setFetchingApplication(false));
    Alert.alert('Alert', err?.message);
  }
};

export function* handle_uploadRequirement(action: any) {

  try {
    const requirements = action?.payload?.requirements;

    action.payload = action?.payload?.formData;
    const applicationCart = yield select(state => state?.application?.applicationCart) || {};
    let key = action?.payload?._parts?.[1]?.[1];
    let fileName = action?.payload?.has("name") ? action?.payload?.get("name") : undefined
    if(key == undefined){
      key = action?.payload?.has("key") ? action?.payload?.get("key") : undefined
    }

    requirements.forEach((r: any, index: number) => {
      if (key === r?.key) {
        let i = requirements[index].files?.length - 1;
        requirements[index].files[i].uploading = true;
        if(requirements[index]?.files[i]?.assets?.length > 0){
          requirements[index].files[i].assets?.forEach((a: any) => {
            a.uri = ""
            return a
          })
        }
        return;
      }
    });
    yield put(setUploadingRequirement(true));
    yield put(setUploadRequirementError(false));
    let session = yield select(getSession);

    let res = yield call(request_uploadRequirement, {session, ...action});
    let success = res?.status === 200 && !res?.data?.failure;
    requirements.forEach((r: any, index: number) => {
      if (key === r?.key) {

        let i = requirements[index].files?.length - 1;
        requirements[index].files[i].uploading = false;
        requirements[index].files[i].uploaded = success;
        if (success) {
          requirements[index].files[i].links = res?.data || [];
        }
        else {
          requirements[index].files.splice(i, 1);
        }
        return;
      }
    });
    let msg = res?.data?.msg || res?.msg;
    if (res?.status === 401) yield put(setUploadRequirementError(true)); /**for 401 only, to force logout the app */
    else if (!success && msg.match('413')) Alert.alert('File Too Large', 'File size must be lesser than 20MB.');
    else if (!success) Alert.alert('Alert', msg);

    yield put(setUploadingRequirement(false));
    if (success) {
      yield put(setApplicationCart({
        ...applicationCart,
        service: {
          ...applicationCart?.service,
          applicationType: {
            ...(applicationCart?.service?.applicationType),
            requirements
          }
        },
      }));
    }
  }
  catch(err) {
    yield put(setUploadingRequirement(false));
    if (err?.status === 401) yield put(setUploadRequirementError(true)); /**for 401 only, to force logout the app */
    Alert.alert('Alert', err?.message);
  }
};

export function* handle_fetchRegions() {
  try {
    yield put(setFetchingRegions(true));

    let session = yield select(getSession);
    let res = yield call(request_fetchRegions, session);

    if (res?.data) yield put(setRegions(res?.data));

    yield put(setFetchingRegions(false));

  }
  catch(err) {
    yield put(setFetchingRegions(false));
    Alert.alert('Alert', err?.message);

  }
};

export function* handle_fetchSchedules(action: any) {
  try {
    yield put(setFetchingSchedules(true));

    let session = yield select(getSession);
    let res = yield call(request_fetchSchedules, {session, ...action});
    if (res?.data) yield put(setSchedules(res?.data));

    yield put(setFetchingSchedules(false));

  }
  catch(err) {
    yield put(setFetchingSchedules(false));
    Alert.alert('Alert', err?.message);
  }
};

export function* handle_fetchProvinces(action: any) {
  try {
    yield put(setFetchingProvinces(true));

    let session = yield select(getSession);
    let res = yield call(request_fetchProvinces, {session, ...action});
    if (res?.data) yield put(setProvinces(res?.data));

    yield put(setFetchingProvinces(false));

  }
  catch(err) {
    yield put(setFetchingProvinces(false));
    Alert.alert('Alert', err?.message);
  }
};

export function* handle_fetchCities(action: any) {
  try {
    yield put(setFetchingCities(true));

    let session = yield select(getSession);
    let res = yield call(request_fetchCities, {session, ...action});
    if (res?.data) yield put(setCities(res?.data));

    yield put(setFetchingCities(false));

  }
  catch(err) {
    yield put(setFetchingCities(false));
    Alert.alert('Alert', err?.message);
  }
};

export function* handle_fetchBarangays(action: any) {
  try {
    yield put(setFetchingBarangays(true));

    let session = yield select(getSession);
    let res = yield call(request_fetchBarangays, {session, ...action});
    if (res?.data) yield put(setBarangays(res?.data));

    yield put(setFetchingBarangays(false));

  }
  catch(err) {
    yield put(setFetchingBarangays(false));
    Alert.alert('Alert', err?.message);
  }
};

export function* handle_fetchSOA(action: any) {
  try {
    yield put(setFetchingSOA(true));
    yield put(setSOA({}));
    let session = yield select(getSession);
    let res = yield call(request_fetchSOA, {session, ...action});

    if (res?.status === 200) {
      yield put(setSOA(res?.data));
      yield put(setFetchSOASuccess(true));
    }
    else yield put(setFetchSOAError(true));
    yield put(setFetchingSOA(false));

  }
  catch(err) {
    yield put(setFetchingSOA(false));
    yield put(setFetchSOAError(true));
    Alert.alert('Alert', err?.message);
  }
};
