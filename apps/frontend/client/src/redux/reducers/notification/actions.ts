const {
  SET_NOTIFICATIONS,
  FETCH_NOTIFICATIONS,
  FETCHING_NOTIFICATIONS,
  FETCH_NOTIFICATION_SUCCESS,
  FETCH_NOTIFICATION_ERROR,
  RESET_NOTIFICATION,
} = require('./types').default;

export function setNotifications(payload: boolean) {
  return {
    type: SET_NOTIFICATIONS,
    payload,
  }
}

export function fetchNotifications(payload: any = {}) {
  return {
    type: FETCH_NOTIFICATIONS,
    payload,
  }
};

export function setFetchingNotifications(payload: boolean) {
  return {
    type: FETCHING_NOTIFICATIONS,
    payload,
  }
};

export function setFetchNotificationSuccess(payload: boolean) {
  return {
    type: FETCH_NOTIFICATION_SUCCESS,
    payload,
  }
};

export function setFetchNotificationError(payload: boolean) {
  return {
    type: FETCH_NOTIFICATION_ERROR,
    payload,
  }
};

export function resetNotification() {
  return {
    type: RESET_NOTIFICATION,
  }
};