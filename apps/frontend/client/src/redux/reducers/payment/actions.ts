const {
  PAY,
  PAYING,
  PAYMENT_SUCCESS,
  PAYMENT_ERROR,
  SET_PAYMENT_OPTIONS,
  SET_PAYMENT_OPTION,
  UPLOAD_PAYMENT,
  SET_UPLOADING_PAYMENT,
  SET_PAYMENT_ROUTE,
  RESET_PAYMENT,
} = require('./types').default;

export function pay(payload: any) {
  return {
    type: PAY,
    payload,
  }
};

export function setPaying(payload: any) {
  return {
    type: PAYING,
    payload,
  }
};

export function setPaymentSuccess(payload: any) {
  return {
    type: PAYMENT_SUCCESS,
    payload,
  }
};

export function setPaymentError(payload: any) {
  return {
    type: PAYMENT_ERROR,
    payload,
  }
};

export function setPaymentOptions(payload: any) {
  return {
    type: SET_PAYMENT_OPTIONS,
    payload,
  }
};

export function setPaymentOption(payload: any) {
  return {
    type: SET_PAYMENT_OPTION,
    payload,
  }
};

export function uploadPayment(payload: any) {
  return {
    type: UPLOAD_PAYMENT,
    payload,
  }
};

export function setUploadingPayment(payload: any) {
  return {
    type: SET_UPLOADING_PAYMENT,
    payload,
  }
};

export function setPaymentRoute(payload: any) {
  return {
    type: SET_PAYMENT_ROUTE,
    payload,
  }
};

export function resetPayment() {
  return {
    type: RESET_PAYMENT,
  }
};
