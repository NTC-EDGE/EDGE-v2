const { Record } = require('immutable');

export default Record({
  notification: {},
  fetchingNotifications: false,
  fetchNotificationSuccess: false,
  fetchNotificationError: false,
});