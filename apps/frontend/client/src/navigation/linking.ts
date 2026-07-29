import { type LinkingOptions } from "@react-navigation/native";

export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [
    "https://myapp.com",
    "myapp://",
  ],
  config: {
    screens: {
      Home: "",
      Settings: "settings",
      Details: "details/:id",
    },
  },
};
