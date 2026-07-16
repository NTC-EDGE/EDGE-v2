const {
  SET_SELECTED_SERVICE,
  SET_SERVICE_LAYOUT,
  SET_APPLICATION_ITEM,
  SET_SELECTED_SERVICE_KEY,
  RESET_SERVICE,
} = require('./types').default;

export function setSelectedService(payload: any) {
  return {
    type: SET_SELECTED_SERVICE,
    payload,
  }
};
export function setSelectedServiceKey(payload: any) {
  return {
    type: SET_SELECTED_SERVICE_KEY,
    payload,
  }
};

export function setServiceLayout(payload: any) {
  return {
    type: SET_SERVICE_LAYOUT,
    payload,
  }
};

export function setApplicationItem(payload: any) {
  return {
    type: SET_APPLICATION_ITEM,
    payload,
  }
};

export function resetService() {
  return {
    type: RESET_SERVICE,
  }
};