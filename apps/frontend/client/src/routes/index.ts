import { createStaticNavigation } from "@react-navigation/native";
import { UnauthenticatedStack } from "./public";
import { AuthenticatedStack } from "./auth";

export const UnauthNavigation = createStaticNavigation(UnauthenticatedStack);
export const AuthNavigation = createStaticNavigation(AuthenticatedStack);

export * from "./public";
export * from "./auth";
export * from "./config/linking";