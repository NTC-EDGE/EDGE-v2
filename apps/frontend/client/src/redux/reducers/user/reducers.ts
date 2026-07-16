const {
  REGISTERING,
  TABSWITCH,
  REGISTER_SUCCESS,
  REGISTER_ERROR,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
  LOGGING_IN,
  LOGOUT_USER,
  SET_USER,
  SET_USER_TEMPORARILY,
  SAVE_CC,
  UPDATING_USER_PHOTO,
  UPDATING_USER_PROFILE,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  CHANGING_PASSWORD,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_ERROR,
  SET_BIOMETRICS_LOGIN,
  UPDATING_SIGNATURE,
  UPLOAD_SIGNATURE_SUCCESS,
  UPLOAD_SIGNATURE_ERROR,
  SET_CREATED_AT
} = require('./types').default;
const InitialState = require('./initialState').default;

interface Action {
  type: string;
  payload: any;
};

export default (state = new InitialState(), action:Action) => {
  const { type, payload } = action;
  switch (type) {
    case REGISTERING: {
      return {
        ...state,
        registering: payload,
      }
    }
    case TABSWITCH: {
      return {
        ...state,
        tabSwitch: payload,
      }
    }
    case REGISTER_SUCCESS: {
      return {
        ...state,
        registerSuccess: payload,
      }
    }
    case REGISTER_ERROR: {
      return {
        ...state,
        registerError: payload,
      }
    }
    case LOGIN_USER_SUCCESS: {
      return {
        ...state,
        loginUserSuccess: payload,
      } 
    }
    case LOGIN_USER_ERROR: {
      return {
        ...state,
        loginUserError: payload,
      } 
    }
    case LOGGING_IN: {
      return {
        ...state,
        loggingIn: payload,
      }
    }
    case LOGOUT_USER: {
      let biometrics = state.biometrics;
      return {
        ...InitialState,
        biometrics,
      };
    }
    case SET_USER: {
      let biometrics = state.biometrics;

      if (biometrics !== payload._id) {
        biometrics = null;
      }

      return {
        ...state,
        session: payload,
        biometrics,
      };
    }
    case SET_USER_TEMPORARILY: {
      return {
        ...state,
        sessionTemporary: payload,
      };
    }
    case SAVE_CC: {
      return {
        ...state,
        cc: payload,
      };
    }
    case UPDATING_USER_PHOTO: {
      return {
        ...state,
        updatingUserPhoto: payload,
      }
    }
    case UPDATING_USER_PROFILE: {
      return {
        ...state,
        updatingUserProfile: payload,
      }
    }
    case UPDATE_USER_SUCCESS: {
      return {
        ...state,
        updateUserSuccess: payload,
      }
    }
    case UPDATE_USER_ERROR: {
      return {
        ...state,
        updateUserError: payload,
      }
    }
    case CHANGING_PASSWORD: {
      return {
        ...state,
        changingPassword: payload,
      }
    }
    case CHANGE_PASSWORD_SUCCESS: {
      return {
        ...state,
        changePasswordSuccess: payload,
      }
    }
    case CHANGE_PASSWORD_ERROR: {
      return {
        ...state,
        changePasswordError: payload,
      }
    }
    case SET_BIOMETRICS_LOGIN: {
      return {
        ...state,
        biometrics: action.payload,
      }
    }
    case UPDATING_SIGNATURE: {
      return {
        ...state,
        uploadingSignature: action.payload,
      }
    }
    case UPLOAD_SIGNATURE_SUCCESS: {
      return {
        ...state,
        uploadSignatureSuccess: action.payload,
      }
    }
    case UPLOAD_SIGNATURE_ERROR: {
      return {
        ...state,
        uploadSignatureError: action.payload,
      }
    }
    case SET_CREATED_AT: {
      return {
        ...state,
        createdAt: action.payload,
      }
    }
    default:
      return state;
  }
};
