import { createNativeStackNavigator } from "@edge/ui";
import { InternalLoginPage } from "../../features/login/components/InternalLoginPage";

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
