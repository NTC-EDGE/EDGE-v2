import { createLinkingConfig, type LinkingOptions } from "@edge/ui";

export const linking: LinkingOptions<object> = createLinkingConfig({
  defaultRoute: "Dashboard",
  defaultPath: "/dashboard",
  redirectPaths: ["", "/", "internal/login"],
});
