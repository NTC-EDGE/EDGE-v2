import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const MainTabs = createBottomTabNavigator({
  screens: {
    Home: HomeScreen,
    Settings: SettingsScreen,
  },
});

export const RootStack = createNativeStackNavigator({
  screens: {
    Main: {
      screen: MainTabs,
      options: { headerShown: false },
    },
    Details: {
      screen: DetailsScreen,
      options: { title: "Details" },
    },
  },
});
