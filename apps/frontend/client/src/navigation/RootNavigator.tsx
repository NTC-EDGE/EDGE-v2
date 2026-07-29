import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import SettingsScreen from "../screens/SettingsScreen";

export const RootStack = createDrawerNavigator({
  screenOptions: {
    drawerType: "permanent",
    headerShown: true,
  },
  screens: {
    Home: HomeScreen,
    Details: DetailsScreen,
    Settings: SettingsScreen,
  },
});
