import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import application from './application/reducers';
import notifications from './notification/reducers';
import payment from './payment/reducers';
import service from './service/reducers';
import theme from './theme/reducers';
import user from './user/reducers';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

export default combineReducers({
  application,
  notifications,
  payment,
  service,
  theme,
  user: persistReducer(persistConfig, user),
});