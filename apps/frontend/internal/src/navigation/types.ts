import type { StaticParamList } from "@edge/ui";
import type { UnauthStack } from "./stacks/UnauthStack";
import type { AuthStack } from "./stacks/AuthStack";

export type UnauthParamList = StaticParamList<typeof UnauthStack>;
export type AuthParamList = StaticParamList<typeof AuthStack>;
