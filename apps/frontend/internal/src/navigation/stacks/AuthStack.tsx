import { createNativeStackNavigator } from "@edge/ui";
import { Platform } from "react-native";
import { authRoutes } from "../routes";

export const AuthStack = createNativeStackNavigator({
  initialRouteName: "Dashboard",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    // Native mobile app animation, fade on web
    animation: Platform.OS === "web" ? "fade" : "slide_from_right",
  },
  screens: {
    Dashboard: authRoutes.Dashboard,
    Feedback: authRoutes.Feedback,
    FormBuilder: authRoutes.FormBuilder,
    Announcements: authRoutes.Announcements,
    AuditLogs: authRoutes.AuditLogs,
    Activities: authRoutes.Activities,
    Chat: authRoutes.Chat,
    Meet: authRoutes.Meet,
    Reports: authRoutes.Reports,
    ReceiptManagement: authRoutes.ReceiptManagement,
    RolesPermission: authRoutes.RolesPermission,
    Schedule: authRoutes.Schedule,
    Employees: authRoutes.Employees,
    Users: authRoutes.Users,
    Settings: authRoutes.Settings,
    AccountSettings: authRoutes.AccountSettings,
  },
});
