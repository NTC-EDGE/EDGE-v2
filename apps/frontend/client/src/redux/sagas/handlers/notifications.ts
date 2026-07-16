import { call, put, select } from 'redux-saga/effects';
import getSession from './_session';

import { setFetchingNotifications, setNotifications } from '@reducers/notification/actions';
import { request_fetchNotifications } from '@sagas/requests/notifications';

export function* handle_fetchNotifications(action: any) {
  try {
    yield put(setFetchingNotifications(true));
    
    let session = yield select(getSession);
    let res = yield call(request_fetchNotifications, {session, ...action});
    if (res?.data) yield put(setNotifications(res?.data));

    yield put(setFetchingNotifications(false));
  }
  catch(err) {
    yield put(setFetchingNotifications(false));
    Alert.alert('Alert', err?.message);
  }
};