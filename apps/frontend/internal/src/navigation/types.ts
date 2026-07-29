import { type StaticParamList } from "@react-navigation/native";
import { type AuthStack } from "./stacks/AuthStack";

type RootStackParamList = StaticParamList<typeof AuthStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
