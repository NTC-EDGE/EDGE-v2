import { StyleSheet, Text, View } from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  createStaticNavigation,
  createNativeStackNavigator,
  type ParamListBase,
  type RouteProp,
} from "@edge/ui";
import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { QueueScreen } from "../features/queue/screens/QueueScreen";
import { InternalLoginPage } from "../features/login/components/InternalLoginPage";

// Fallback Placeholder screen for role specific navigation links
export function PlaceholderScreen({
  route,
}: {
  route: RouteProp<ParamListBase, string>;
}) {
  const name = route.name;

  const formattedName = name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str: string) => str.toUpperCase())
    .trim();

  return (
    <View style={styles.placeholderContainer}>
      <View style={[styles.placeholderCard, SHADOWS.card]}>
        <Text style={styles.placeholderTitle}>{formattedName} Portal</Text>
        <Text style={styles.placeholderText}>
          This sub-module is currently undergoing staging and compliance
          verification. All interactions are simulated under the active role
          constraints.
        </Text>
      </View>
    </View>
  );
}

export const UnauthStack = createNativeStackNavigator({
  initialRouteName: "InternalLogin",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    InternalLogin: {
      screen: InternalLoginPage,
      path: "internal/login",
      options: {
        title: "Login",
      },
    },
  },
});

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

export const UnauthNavigation = createStaticNavigation(UnauthStack);
export const AuthNavigation = createStaticNavigation(AuthStack);

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[20],
  },
  placeholderCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[32],
    maxWidth: 600,
    alignItems: "center",
    textAlign: "center",
  },
  placeholderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
  },
  placeholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: "center",
    lineHeight: 22,
  },
});
