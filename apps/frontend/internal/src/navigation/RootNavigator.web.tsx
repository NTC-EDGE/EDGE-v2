import { createDrawerNavigator } from "@react-navigation/drawer";
import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { AdminSettingsScreen } from "../features/settings/screens/AdminSettingsScreen";

export const RootStack = createDrawerNavigator({
  screenOptions: {
    drawerType: "permanent",
    headerShown: true,
  },
  screens: {
    Dashboard: DashboardScreen,
    Settings: SettingsScreen,
    AdminSettings: AdminSettingsScreen,
  },
});
