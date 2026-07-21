import { createNativeStackNavigator } from "@edge/ui";
import { ActivitiesListScreen } from "../features/queue/screens/ActivitiesListScreen";
import { ActivitiesDetailScreen } from "../features/queue/screens/ActivitiesDetailScreen";

export const ActivitiesNavigator = createNativeStackNavigator({
  initialRouteName: "ActivitiesList",
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: "transparent" },
    animation: "fade",
  },
  screens: {
    ActivitiesList: {
      screen: ActivitiesListScreen,
    },
    ActivitiesDetail: {
      screen: ActivitiesDetailScreen,
    },
  },
});
