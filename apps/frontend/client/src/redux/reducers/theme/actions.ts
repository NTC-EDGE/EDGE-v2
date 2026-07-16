
// theme/actions.ts
const {
  SET_THEME,
  SET_SPLIT,
  SET_BULK_APPLICATIONS,
  ADD_BULK_APPLICATION,
  DELETE_BULK_APPLICATION,
  CLEAR_BULK_APPLICATION,
  SET_BULK_APPLICATION
} = require('./types').default;

export function setTheme(payload: any) {
  return {
    type: SET_THEME,
    payload,
  };
}

export function setSplit(payload: boolean) {
  return {
    type: SET_SPLIT,
    payload,
  };
}

export function setBulkApplications(payload: any[]) {
  return {
    type: SET_BULK_APPLICATIONS,
    payload,
  };
}

export function setBulkApplication(payload: any) {
  return {
    type: SET_BULK_APPLICATION,
    payload,
  };
}

export function addBulkApplication(payload: any) {
  return {
    type: ADD_BULK_APPLICATION,
    payload,
  };
}
export function clearBulkApplication() {
  return {
    type: CLEAR_BULK_APPLICATION,
  };
}
export function deleteBulkApplication(payload: string) {
  return {
    type: DELETE_BULK_APPLICATION,
    payload, // id
  };
}
