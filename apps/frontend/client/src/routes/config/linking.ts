import { createLinkingConfig } from "@edge/ui";
import { type ParamListBase } from "@react-navigation/native";

/**
 * Web & Native linking configuration for Client app.
 * Automatically resolves relative to browser location on Web (window.location.origin).
 */
export const clientLinking = createLinkingConfig<ParamListBase>({
  defaultRoute: "Services",
  defaultPath: "/services",
  redirectPaths: ["", "/"],
});