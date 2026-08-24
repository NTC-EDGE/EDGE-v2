import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { type StaticParamList } from "@react-navigation/native";
import { Services } from "../auth/Services";
import { MyApplications } from "../auth/MyApplications";
import { Settings } from "../auth/Settings";

export const AuthenticatedStack = createNativeStackNavigator({
  initialRouteName: "Services",
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Services: {
      screen: Services,
      path: "services",
    },
    MyApplications: {
      screen: MyApplications,
      path: "my-applications",
    },
    Settings: {
      screen: Settings,
      path: "settings",
    },
  },
});

export type AuthParamList = StaticParamList<typeof AuthenticatedStack>;
