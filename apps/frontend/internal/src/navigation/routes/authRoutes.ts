import { type ParamListBase, type RouteProp } from "@edge/ui";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";
import { EmployeesScreen } from "../../features/employees/screens/EmployeesScreen";
import { UsersScreen } from "../../features/users/screens/UsersScreen";
import { SettingsScreen } from "../../features/settings/screens/SettingsScreen";
import { AdminSettingsScreen } from "../../features/settings/screens/AdminSettingsScreen";
import { RolesPermissionScreen } from "../../features/roles-permission/screens/RolesPermissionScreen";
import { ActivitiesScreen } from "../../features/queue/screens/ActivitiesScreen";
import { PlaceholderScreen } from "../stacks/PlaceholderScreen";

// We keep these direct references for the route config.
// Wrapping in AppLayout will be handled by a Layout HOC or at the root component level.

export const authRoutes = {
  Dashboard: {
    screen: DashboardScreen,
    path: "dashboard",
    options: { title: "Dashboard" },
  },
  Activities: {
    screen: ActivitiesScreen,
    path: "activities",
    options: { title: "Activities" },
  },
  Chat: {
    screen: PlaceholderScreen,
    path: "chat",
    options: { title: "Chat" },
  },
  Meet: {
    screen: PlaceholderScreen,
    path: "meet",
    options: { title: "Meet" },
  },
  Reports: {
    screen: PlaceholderScreen,
    path: "reports",
    options: { title: "Reports" },
  },
  ReceiptManagement: {
    screen: PlaceholderScreen,
    path: "receipt-management",
    options: { title: "Receipt Management" },
  },
  RolesPermission: {
    screen: RolesPermissionScreen,
    path: "roles-permissions",
    options: { title: "Roles & Permission" },
  },
  Schedule: {
    screen: PlaceholderScreen,
    path: "schedule",
    options: { title: "Schedule" },
  },
  Employees: {
    screen: EmployeesScreen,
    path: "employees",
    options: { title: "Employees" },
  },
  Users: {
    screen: UsersScreen,
    path: "users",
    options: { title: "Users" },
  },
  Settings: {
    screen: AdminSettingsScreen,
    path: "settings",
    options: { title: "Settings" },
  },
  AccountSettings: {
    screen: SettingsScreen,
    path: "account-settings",
    options: { title: "Account Settings" },
  },
};
