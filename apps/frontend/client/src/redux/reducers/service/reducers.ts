const {
  SET_SELECTED_SERVICE,
  SET_SERVICE_LAYOUT,
  SET_APPLICATION_ITEM,
  SET_SELECTED_SERVICE_KEY,
  RESET_SERVICE,
} = require('./types').default;
const InitialState = require('./initialState').default;

interface Action {
  type: string;
  payload: any;
};

export default (state = new InitialState(), action:Action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_SELECTED_SERVICE: {
      return {
        ...state,
        selectedService: payload,
      }
    }
    case SET_SERVICE_LAYOUT: {
      return {
        ...state,
        serviceLayout: payload,
      }
    }

    case SET_APPLICATION_ITEM: {
      return {
        ...state,
        applicationItem: payload,
      }
    }
    case SET_SELECTED_SERVICE_KEY: {
      return {
        ...state,
        selectedServiceKey: payload,
      }
    }
    case RESET_SERVICE:
      return InitialState;
    default:
      return state;
  }
};