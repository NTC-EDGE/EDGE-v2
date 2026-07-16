const {
  SET_NOTIFICATIONS,
  FETCHING_NOTIFICATIONS,
  FETCH_NOTIFICATION_SUCCESS,
  FETCH_NOTIFICATION_ERROR,
  RESET_NOTIFICATION,
} = require('./types').default;

const InitialState = require('./initialState').default;

interface Action {
  type: string;
  payload: any;
};

export default (state = new InitialState(), action:Action) => {
  const { type, payload } = action;
  let list = state?.notification?.list || [];

  switch (type) {
    case SET_NOTIFICATIONS:
      let { docs, page, pageSize, total } = payload;
      list = page === 1 ? docs : list?.concat(docs);
      return {
        ...state,
        notification: {
          list,
          page,
          pageSize,
          total,
        }
      }
    case FETCHING_NOTIFICATIONS:
      return {
        ...state,
        fetchingNotifications: payload,
      }
    case FETCH_NOTIFICATION_SUCCESS:
      return {
        ...state,
        fetchNotificationSuccess: payload,
      }
    case FETCH_NOTIFICATION_ERROR:
      return {
        ...state,
        fetchNotificationError: payload,
      }
    case RESET_NOTIFICATION:
      return InitialState;
    default:
      return state;
  }
};