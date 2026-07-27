import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import type { UnauthParamList } from "./routes/public";
import type { AuthParamList } from "./routes/auth";

/**
 * Combined param list for both authenticated and unauthenticated stacks.
 */
export type AppParamList = UnauthParamList & AuthParamList;
export type AppNavigationProp = NavigationProp<AppParamList>;

/**
 * Typed navigation hook that returns a fully-typed navigation prop.
 * Use this instead of `useNavigation()` for type-safe `navigate()` calls.
 *
 * @example
 *   const navigation = useAppNavigation();
 *   navigation.navigate("Login");
 */
export function useAppNavigation(): AppNavigationProp {
  return useNavigation() as unknown as AppNavigationProp;
}
