import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { type StaticParamList } from "@react-navigation/native";
import { LandingScreen } from "../unAuth/LandingScreen";
import { LoginScreen } from "../unAuth/LoginScreen";
import { SignUpScreen } from "../unAuth/SignUpScreen";
import { ForgotPasswordScreen } from "../unAuth/ForgotPasswordScreen";

export const UnauthenticatedStack = createNativeStackNavigator({
  initialRouteName: "Landing",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
  },
  screens: {
    Landing: {
      screen: LandingScreen,
      path: "",
    },
    Login: {
      screen: LoginScreen,
      path: "login",
    },
    SignUp: {
      screen: SignUpScreen,
      path: "signup",
    },
    ForgotPassword: {
      screen: ForgotPasswordScreen,
      path: "forgot-password",
    },
  },
});

export type UnauthParamList = StaticParamList<typeof UnauthenticatedStack>;

