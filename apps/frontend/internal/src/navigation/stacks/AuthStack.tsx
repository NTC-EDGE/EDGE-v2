import {
  createNativeStackNavigator,
  type ParamListBase,
  type RouteProp,
} from "@edge/ui";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";
import { QueueScreen } from "../../features/queue/screens/QueueScreen";
import { EmployeesScreen } from "../../features/employees/screens/EmployeesScreen";
import { UsersScreen } from "../../features/users/screens/UsersScreen";
import { SettingsScreen } from "../../features/settings/screens/SettingsScreen";
import { AdminSettingsScreen } from "../../features/settings/screens/AdminSettingsScreen";
import { RolesPermissionScreen } from "../../features/roles-permission/screens/RolesPermissionScreen";
import { StandardPageWrapper } from "../../features/shell/components/StandardPageWrapper";
import { PlaceholderScreen } from "./PlaceholderScreen";

function SettingsScreenWrapped() {
  return (
    <StandardPageWrapper activeScreen="Settings">
      <AdminSettingsScreen />
    </StandardPageWrapper>
  );
}

function DashboardScreenWrapped() {
  return (
    <StandardPageWrapper activeScreen="Dashboard">
      <DashboardScreen />
    </StandardPageWrapper>
  );
}

function ActivitiesScreenWrapped() {
  return (
    <StandardPageWrapper activeScreen="Activities">
      <QueueScreen />
    </StandardPageWrapper>
  );
}

function ChatScreenWrapped(props: { route: RouteProp<ParamListBase, string> }) {
  return (
    <StandardPageWrapper activeScreen="Chat">
      <PlaceholderScreen {...props} />
    </StandardPageWrapper>
  );
}

function MeetScreenWrapped(props: { route: RouteProp<ParamListBase, string> }) {
  return (
    <StandardPageWrapper activeScreen="Meet">
      <PlaceholderScreen {...props} />
    </StandardPageWrapper>
  );
}

function ReportsScreenWrapped(props: { route: RouteProp<ParamListBase, string> }) {
  return (
    <StandardPageWrapper activeScreen="Reports">
      <PlaceholderScreen {...props} />
    </StandardPageWrapper>
  );
}

function ReceiptManagementScreenWrapped(props: { route: RouteProp<ParamListBase, string> }) {
  return (
    <StandardPageWrapper activeScreen="ReceiptManagement">
      <PlaceholderScreen {...props} />
    </StandardPageWrapper>
  );
}

function RolesPermissionScreenWrapped() {
  return (
    <StandardPageWrapper activeScreen="RolesPermission">
      <RolesPermissionScreen />
    </StandardPageWrapper>
  );
}

function ScheduleScreenWrapped(props: { route: RouteProp<ParamListBase, string> }) {
  return (
    <StandardPageWrapper activeScreen="Schedule">
      <PlaceholderScreen {...props} />
    </StandardPageWrapper>
  );
}

function EmployeesScreenWrapped() {
  return (
    <StandardPageWrapper activeScreen="Employees">
      <EmployeesScreen />
    </StandardPageWrapper>
  );
}

function UsersScreenWrapped() {
  return (
    <StandardPageWrapper activeScreen="Users">
      <UsersScreen />
    </StandardPageWrapper>
  );
}

export const AuthStack = createNativeStackNavigator({
  initialRouteName: "Dashboard",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    Dashboard: {
      screen: DashboardScreenWrapped,
      path: "dashboard",
      options: { title: "Dashboard" },
    },
    Activities: {
      screen: ActivitiesScreenWrapped,
      path: "activities",
      options: { title: "Activities" },
    },
    Chat: {
      screen: ChatScreenWrapped,
      path: "chat",
      options: { title: "Chat" },
    },
    Meet: {
      screen: MeetScreenWrapped,
      path: "meet",
      options: { title: "Meet" },
    },
    Reports: {
      screen: ReportsScreenWrapped,
      path: "reports",
      options: { title: "Reports" },
    },
    ReceiptManagement: {
      screen: ReceiptManagementScreenWrapped,
      path: "receipt-management",
      options: { title: "Receipt Management" },
    },
    RolesPermission: {
      screen: RolesPermissionScreenWrapped,
      path: "roles-permissions",
      options: { title: "Roles & Permission" },
    },
    Schedule: {
      screen: ScheduleScreenWrapped,
      path: "schedule",
      options: { title: "Schedule" },
    },
    Employees: {
      screen: EmployeesScreenWrapped,
      path: "employees",
      options: { title: "Employees" },
    },
    Users: {
      screen: UsersScreenWrapped,
      path: "users",
      options: { title: "Users" },
    },
    Settings: {
      screen: SettingsScreenWrapped,
      path: "settings",
      options: { title: "Settings" },
    },
    AccountSettings: {
      screen: SettingsScreen,
      path: "account-settings",
      options: { title: "Account Settings" },
    },
  },
});
