import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Services } from "../auth/Services";
import { MyApplications } from "../auth/MyApplications";

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
  },
});
