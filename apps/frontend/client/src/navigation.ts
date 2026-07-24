import "@react-navigation/native";
import type { UnauthParamList } from "./routes/public";
import type { AuthParamList } from "./routes/auth";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends UnauthParamList, AuthParamList {}
  }
}

