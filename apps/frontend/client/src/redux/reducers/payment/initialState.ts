const { Record } = require('immutable');

export default Record({
  paying: false,
  paymentSuccess: false,
  paymentError: false,
  paymentOptions: [],
  paymentOption: {},
  uploadingPayment: false,
  uploadSuccess: false,
  uploadError: false,
  paymentRoute: ''
});
