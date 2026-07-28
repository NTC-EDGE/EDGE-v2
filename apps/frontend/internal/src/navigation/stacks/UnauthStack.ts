import { createNativeStackNavigator } from "@edge/ui";
import { unauthRoutes } from "../routes";

export const UnauthStack = createNativeStackNavigator({
  initialRouteName: "Landing",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    Landing: unauthRoutes.Landing,
    Onboarding: unauthRoutes.Onboarding,
    InternalLogin: unauthRoutes.InternalLogin,
    Signup: unauthRoutes.Signup,
  },
});
