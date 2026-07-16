import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from 'src/services/store';
import Navigation from 'src/navigations';
import { useFonts} from '@expo-google-fonts/poppins';
import { MenuProvider } from 'react-native-popup-menu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HelmetProvider } from 'react-helmet-async';

import AppPromoBanner from '@components/AppPromotionModal';
import Constants from "expo-constants";

 export default function App() {
  const [fontsLoaded] = useFonts({
    PoppinsRegular: require('./assets/fonts/Poppins-Regular.ttf'),
    PoppinsMedium: require('./assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemiBold: require('./assets/fonts/Poppins-SemiBold.ttf'),
    Poppins_400Regular: require('./assets/fonts/Poppins-Regular.ttf'),
    Poppins_500Medium: require('./assets/fonts/Poppins-Medium.ttf'),
    Poppins_600SemiBold: require('./assets/fonts/Poppins-SemiBold.ttf'),

  });

 if (!fontsLoaded) return null;

  return (
    <HelmetProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <HelmetProvider>
              <MenuProvider>
                <Navigation />
              </MenuProvider>
              <AppPromoBanner />
              <StatusBar />
            </HelmetProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </HelmetProvider>
  );
}
