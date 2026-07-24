import { createNativeStackNavigator } from "@edge/ui";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";
import { QueueScreen } from "../../features/queue/screens/QueueScreen";
import { PlaceholderScreen } from "./PlaceholderScreen";

export const AuthStack = createNativeStackNavigator({
  initialRouteName: "Dashboard",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    Dashboard: { screen: DashboardScreen, path: "dashboard" },
    Activities: { screen: QueueScreen, path: "activities" },
    Chat: { screen: PlaceholderScreen, path: "chat" },
    Meet: { screen: PlaceholderScreen, path: "meet" },
    Reports: { screen: PlaceholderScreen, path: "reports" },
    ReceiptManagement: { screen: PlaceholderScreen, path: "receipt-management" },
    RolesPermission: { screen: PlaceholderScreen, path: "roles-permissions" },
    Schedule: { screen: PlaceholderScreen, path: "schedule" },
    Employees: { screen: PlaceholderScreen, path: "employees" },
    Users: { screen: PlaceholderScreen, path: "users" },
    Settings: { screen: PlaceholderScreen, path: "settings" },
  },
});
