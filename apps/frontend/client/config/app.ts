import Constants from 'expo-constants';

const API_URL = Constants.manifest?.extra?.API_URL;
const API_VERSION = Constants.manifest?.extra?.API_VERSION;
export default {
  // BASE_URL_NODE: 'https://ntc.astrotechenergy.com',
  BASE_URL_C: 'https://192.168.1.2:5001',
  BASE_URL_NODE: 'http://127.0.0.1:5000',
  API_VERSION,
};
