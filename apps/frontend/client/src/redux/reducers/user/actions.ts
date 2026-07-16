const {
  REGISTER,
  REGISTERING,
  REGISTER_SUCCESS,
  REGISTER_ERROR,
  LOGIN_USER,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  LOGOUT_USER,
  LOGGING_IN,
  SET_USER,
  SET_USER_TEMPORARILY,
  SAVE_CC,
  UPDATE_USER,
  UPDATING_USER_PHOTO,
  UPDATING_USER_PROFILE,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  CHANGE_PASSWORD,
  CHANGING_PASSWORD,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_ERROR,
  SET_BIOMETRICS_LOGIN,
  UPLOAD_SIGNATURE,
  UPLOADING_SIGNATURE,
  UPLOAD_SIGNATURE_SUCCESS,
  UPLOAD_SIGNATURE_ERROR,
  SET_CREATED_AT,
  LOGIN_GUEST_USER,
  TABSWITCH
} = require('./types').default;

export function loginUser(payload: any) {
  return {
    type: LOGIN_USER,
    payload,
  }
};
export function setTabSwitch(payload: any) {
  return {
    type: TABSWITCH,
    payload,
  }
};
export function loginGuestUser(payload: any) {
  return {
    type: LOGIN_GUEST_USER,
    payload,
  }
};
export function setLoginUserSuccess(payload: any) {
  return {
    type: LOGIN_USER_SUCCESS,
    payload,
  }
};

export function setCreatedAt(payload) {
  return {
    type: SET_CREATED_AT,
    payload,
  };
}

export function setLoginUserError(payload: any) {
  return {
    type: LOGIN_USER_ERROR,
    payload,
  }
};

export function logoutUser() {
  return {
    type: LOGOUT_USER,
  }
};

export function setLoggingIn(payload: boolean) {
  return {
    type: LOGGING_IN,
    payload,
  }
};

export function setUser(payload: any) {
  return {
    type: SET_USER,
    payload,
  }
};

export function setUserTemporarily(payload: any) {
  return {
    type: SET_USER_TEMPORARILY,
    payload,
  }
};

export function saveCC(payload: any) {
  return {
    type: SAVE_CC,
    payload,
  }
};

export function register(payload: any) {
  return {
    type: REGISTER,
    payload,
  }
};

export function setRegistering(payload: any) {
  return {
    type: REGISTERING,
    payload,
  }
};

export function setRegisterSuccess(payload: any) {
  return {
    type: REGISTER_SUCCESS,
    payload,
  }
};

export function setRegisterError(payload: any) {
  return {
    type: REGISTER_ERROR,
    payload,
  }
};

export function updateUser(payload: any) {
  return {
    type: UPDATE_USER,
    payload,
  }
};

export function setUpdatingUserPhoto(payload: any) {
  return {
    type: UPDATING_USER_PHOTO,
    payload,
  }
};

export function setUpdatingUserProfile(payload: any) {
  return {
    type: UPDATING_USER_PROFILE,
    payload,
  }
};

export function setUpdateUserSuccess(payload: any) {
  return {
    type: UPDATE_USER_SUCCESS,
    payload,
  }
};

export function setUpdateUserError(payload: any) {
  return {
    type: UPDATE_USER_ERROR,
    payload,
  }
};

export function changePassword(payload: any) {
  return {
    type: CHANGE_PASSWORD,
    payload,
  }
};

export function setChangingPassword(payload: any) {
  return {
    type: CHANGING_PASSWORD,
    payload,
  }
};

export function setChangePasswordSuccess(payload: any) {
  return {
    type: CHANGE_PASSWORD_SUCCESS,
    payload,
  }
};

export function setChangePasswordError(payload: any) {
  return {
    type: CHANGE_PASSWORD_ERROR,
    payload,
  }
};

export function setBiometricsLogin(payload: any) {
  return {
    type: SET_BIOMETRICS_LOGIN,
    payload
  }
}

export function uploadSignature(payload: any) {
  return {
    type: UPLOAD_SIGNATURE,
    payload,
  }
};

export function uploadingSignature(payload: any) {
  return {
    type: UPLOADING_SIGNATURE,
    payload,
  }
};

export function setUploadSignatureSuccess(payload: any) {
  return {
    type: UPLOAD_SIGNATURE_SUCCESS,
    payload,
  }
};

export function setUploadSignatureError(payload: any) {
  return {
    type: UPLOAD_SIGNATURE_ERROR,
    payload,
  }
};
