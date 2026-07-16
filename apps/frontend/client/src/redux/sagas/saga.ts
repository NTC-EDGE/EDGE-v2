import { takeLatest } from 'redux-saga/effects';

const {
  REGISTER,
  LOGIN_USER,
  LOGOUT_USER,
  UPDATE_USER,
  CHANGE_PASSWORD,
  UPLOAD_SIGNATURE,
  LOGIN_GUEST_USER
} = require('@reducers/user/types').default;

const {
  SAVE_APPLICATION,
  UPLOAD_REQUIREMENT,
  FETCH_APPLICATIONS,
  FETCH_APPLICATION,
  FETCH_REGIONS,
  FETCH_SCHEDULES,
  FETCH_PROVINCES,
  FETCH_CITIES,
  FETCH_BARANGAYS,
  FETCH_SOA,
  SAVE_BULK_APPLICATION,
  BATCH_ADD_APPLICATIONS
} = require('@reducers/application/types').default;

const {
  PAY,
  UPLOAD_PAYMENT,
} = require('@reducers/payment/types').default;

const {
  FETCH_NOTIFICATIONS
} = require('@reducers/notification/types').default;

import {
  handle_register,
  handle_loginUser,
  handle_logoutUser,
  handle_updateUser,
  handle_changePassword,
  handle_uploadSignature, handle_loginGuestUser,
} from './handlers/user';

import {
  handle_saveApplication,
  handle_saveBulkApplication,
  handle_fetchApplications,
  handle_fetchApplication,
  handle_uploadRequirement,
  handle_fetchRegions,
  handle_fetchSchedules,
  handle_fetchProvinces,
  handle_fetchCities,
  handle_fetchBarangays,
  handle_fetchSOA
} from './handlers/application';

import {
  handle_pay,
  handle_uploadPayment,
} from './handlers/payment';

import {
  handle_fetchNotifications
} from './handlers/notifications';

export function* watcherSaga() {
  yield takeLatest(REGISTER, handle_register);
  yield takeLatest(LOGIN_USER, handle_loginUser);
  yield takeLatest(LOGIN_GUEST_USER, handle_loginGuestUser);
  yield takeLatest(LOGOUT_USER, handle_logoutUser);
  yield takeLatest(UPDATE_USER, handle_updateUser);
  yield takeLatest(CHANGE_PASSWORD, handle_changePassword);
  yield takeLatest(UPLOAD_SIGNATURE, handle_uploadSignature);

  yield takeLatest(SAVE_APPLICATION, handle_saveApplication);
  yield takeLatest(SAVE_BULK_APPLICATION, handle_saveBulkApplication);
  yield takeLatest(FETCH_APPLICATIONS, handle_fetchApplications);
  yield takeLatest(FETCH_APPLICATION, handle_fetchApplication);
  yield takeLatest(UPLOAD_REQUIREMENT, handle_uploadRequirement);
  yield takeLatest(PAY, handle_pay);
  yield takeLatest(UPLOAD_PAYMENT, handle_uploadPayment);

  yield takeLatest(FETCH_REGIONS, handle_fetchRegions);
  yield takeLatest(FETCH_SCHEDULES, handle_fetchSchedules);
  yield takeLatest(FETCH_PROVINCES, handle_fetchProvinces);
  yield takeLatest(FETCH_CITIES, handle_fetchCities);
  yield takeLatest(FETCH_BARANGAYS, handle_fetchBarangays);

  yield takeLatest(FETCH_SOA, handle_fetchSOA);

  yield takeLatest(FETCH_NOTIFICATIONS, handle_fetchNotifications);
}
