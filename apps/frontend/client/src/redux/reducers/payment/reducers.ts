const {
  PAYING,
  PAYMENT_SUCCESS,
  PAYMENT_ERROR,
  SET_PAYMENT_OPTIONS,
  SET_PAYMENT_OPTION,
  SET_UPLOADING_PAYMENT,
  SET_PAYMENT_ROUTE,
  RESET_PAYMENT,
} = require('./types').default;
const InitialState = require('./initialState').default;

interface Action {
  type: string;
  payload: any;
};

export default (state = new InitialState(), action:Action) => {
  const { type, payload } = action;
  switch (type) {
    case PAYING: {
      return {
        ...state,
        paying: payload,
      }
    }
    case PAYMENT_SUCCESS: {
      return {
        ...state,
        paymentSuccess: payload,
      }
    }
    case PAYMENT_ERROR: {
      return {
        ...state,
        paymentError: payload,
      }
    }
    case SET_PAYMENT_OPTIONS: {
      return {
        ...state,
        paymentOptions: payload,
      }
    }
    case SET_PAYMENT_OPTION: {
      return {
        ...state,
        paymentOption: payload,
      }
    }
    case SET_UPLOADING_PAYMENT: {
      return {
        ...state,
        uploadingPayment: payload,
      }
    }
    case SET_PAYMENT_ROUTE: {
      return {
        ...state,
        paymentRoute: payload,
      }
    }
    case RESET_PAYMENT:
      return InitialState;
    default:
      return state;
  }
};