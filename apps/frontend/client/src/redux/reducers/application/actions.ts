const {
  SAVE_APPLICATION,
  SAVE_BULK_APPLICATION,
  SAVING_APPLICATION,
  SAVING_BULK_APPLICATION,
  SAVE_APPLICATION_ERROR,
  SAVE_APPLICATION_SUCCESS,
  SAVE_BULK_APPLICATION_SUCCESS,
  SAVE_BULK_APPLICATION_ERROR,
  ADD_APPLICATION,
  ADD_APPLICATIONS,
  SET_APPLICATION_CART,
  BATCH_ADD_APPLICATIONS,
  BATCH_SET_APPLICATIONS,
  SET_APPLICATIONS,
  SET_APPLICATION,
  APPLICATION_PROCESS,
  FETCH_APPLICATIONS,
  FETCHING_APPLICATIONS,

  FETCH_APPLICATION,
  FETCHING_APPLICATION,

  UPLOAD_REQUIREMENT,
  UPLOADING_REQUIREMENT,
  UPLOAD_REQUIREMENT_SUCCESS,
  UPLOAD_REQUIREMENT_ERROR,

  FETCH_REGIONS,
  FETCHING_REGIONS,
  SET_REGIONS,
  FETCH_SCHEDULES,
  FETCHING_SCHEDULES,
  SET_SCHEDULES,
  FETCH_PROVINCES,
  FETCHING_PROVINCES,
  SET_PROVINCES,
  FETCH_CITIES,
  FETCHING_CITIES,
  SET_CITIES,
  FETCH_BARANGAYS,
  FETCHING_BARANGAYS,
  SET_BARANGAYS,

  FETCH_SOA,
  FETCHING_SOA,
  SET_SOA,
  FETCH_SOA_SUCCESS,
  FETCH_SOA_ERROR,

  RESET_APPLICATION,

  SET_BUTTON_TEXT
} = require('./types').default;

export function saveApplication(payload: any) {
  return {
    type: SAVE_APPLICATION,
    payload,
  }
};

export function saveBulkApplication(payload: any) {
  return {
    type: SAVE_BULK_APPLICATION,
    payload,
  }
};
export function batchAddApplications(payload: any) {
  return {
    type: BATCH_ADD_APPLICATIONS,
    payload,
  }
};

export function batchSetApplications(payload: any) {
  return {
    type: BATCH_SET_APPLICATIONS,
    payload,
  }
}

export function setSaveApplicationError(payload: any) {
  return {
    type: SAVE_APPLICATION_ERROR,
    payload,
  }
};

export function setSaveApplicationSuccess(payload: any) {
  return {
    type: SAVE_APPLICATION_SUCCESS,
    payload,
  }
};

export function setSavingApplication(payload: boolean) {
  return {
    type: SAVING_APPLICATION,
    payload,
  }
};
export function setSaveBulkApplicationError(payload: any) {
  return {
    type: SAVE_BULK_APPLICATION_ERROR,
    payload,
  }
};

export function setSaveBulkApplicationSuccess(payload: any) {
  return {
    type: SAVE_BULK_APPLICATION_SUCCESS,
    payload,
  }
};

export function setSavingBulkApplication(payload: boolean) {
  return {
    type: SAVING_BULK_APPLICATION,
    payload,
  }
};

export function addApplication(payload: any) {
  return {
    type: ADD_APPLICATION,
    payload,
  }
};
export function addApplications(payload: any) {
  return {
    type: ADD_APPLICATIONS,
    payload,
  }
};


export function setApplicationCart(payload: any) {
  return {
    type: SET_APPLICATION_CART,
    payload,
  }
};

export function setApplications(payload: any) {
  return {
    type: SET_APPLICATIONS,
    payload,
  }
};

export function setApplication(payload: any) {
  return {
    type: SET_APPLICATION,
    payload,
  }
};

export function setUploadingRequirement(payload: any) {
  return {
    type: UPLOADING_REQUIREMENT,
    payload,
  }
};

export function uploadRequirement(payload: any) {
  return {
    type: UPLOAD_REQUIREMENT,
    payload,
  }
};

export function setUploadRequirementSuccess(payload: any) {
  return {
    type: UPLOAD_REQUIREMENT_SUCCESS,
    payload,
  }
};

export function setUploadRequirementError(payload: any) {
  return {
    type: UPLOAD_REQUIREMENT_ERROR,
    payload,
  }
};

export function fetchApplications(payload: any = {}) {
  return {
    type: FETCH_APPLICATIONS,
    payload,
  }
};

export function setFetchingApplications(payload: boolean) {
  return {
    type: FETCHING_APPLICATIONS,
    payload,
  }
};

export function fetchApplication(payload: any = {}) {
  return {
    type: FETCH_APPLICATION,
    payload,
  }
};

export function setFetchingApplication(payload: boolean) {
  return {
    type: FETCHING_APPLICATION,
    payload,
  }
};

export function fetchRegions() {
  return {
    type: FETCH_REGIONS,
  }
};

export function setFetchingRegions(payload: boolean) {
  return {
    type: FETCHING_REGIONS,
    payload,
  }
};

export function setRegions(payload: any) {
  return {
    type: SET_REGIONS,
    payload,
  }
};

export function fetchSchedules(payload: any) {
  return {
    type: FETCH_SCHEDULES,
    payload,
  }
};

export function setFetchingSchedules(payload: boolean) {
  return {
    type: FETCHING_SCHEDULES,
    payload,
  }
};

export function setSchedules(payload: any) {
  return {
    type: SET_SCHEDULES,
    payload,
  }
};

export function fetchProvinces(payload: any) {
  return {
    type: FETCH_PROVINCES,
    payload,
  }
};

export function setFetchingProvinces(payload: boolean) {
  return {
    type: FETCHING_PROVINCES,
    payload,
  }
};

export function setProvinces(payload: any) {
  return {
    type: SET_PROVINCES,
    payload,
  }
};

export function fetchCities(payload: any) {
  return {
    type: FETCH_CITIES,
    payload,
  }
};

export function setFetchingCities(payload: boolean) {
  return {
    type: FETCHING_CITIES,
    payload,
  }
};

export function setCities(payload: any) {
  return {
    type: SET_CITIES,
    payload,
  }
};

export function fetchBarangays(payload: any) {
  return {
    type: FETCH_BARANGAYS,
    payload,
  }
};
export function setApplicationProcess(payload: any) {
  return {
    type: APPLICATION_PROCESS,
    payload,
  }
};
export function setFetchingBarangays(payload: boolean) {
  return {
    type: FETCHING_BARANGAYS,
    payload,
  }
};

export function setBarangays(payload: any) {
  return {
    type: SET_BARANGAYS,
    payload,
  }
};

export function fetchSOA(payload: any) {
  return {
    type: FETCH_SOA,
    payload,
  }
};

export function setFetchingSOA(payload: any) {
  return {
    type: FETCHING_SOA,
    payload,
  }
};

export function setSOA(payload: any) {
  return {
    type: SET_SOA,
    payload,
  }
};

export function setFetchSOASuccess(payload: any) {
  return {
    type: FETCH_SOA_SUCCESS,
    payload,
  }
};

export function setFetchSOAError(payload: any) {
  return {
    type: FETCH_SOA_ERROR,
    payload,
  }
};

export function resetApplication() {
  return {
    type: RESET_APPLICATION,
  }
};


export function setButtonText(payload: any) {
  return {
    type: SET_BUTTON_TEXT,
    payload,
  }
};
