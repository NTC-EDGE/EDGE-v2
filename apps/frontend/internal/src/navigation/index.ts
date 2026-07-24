import { createStaticNavigation } from "@edge/ui";
import { UnauthStack, AuthStack } from "./stacks";

export const UnauthNavigation = createStaticNavigation(UnauthStack);
export const AuthNavigation = createStaticNavigation(AuthStack);

export * from "./config/linking";
export * from "./stacks";
export * from "./types";
