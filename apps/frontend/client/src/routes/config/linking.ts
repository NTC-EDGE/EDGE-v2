import { createLinkingConfig, type LinkingOptions } from "@edge/ui";

/**
 * Web & Native linking configuration for Client app.
 * Automatically resolves relative to browser location on Web (window.location.origin).
 */
export const clientLinking: LinkingOptions<object> = createLinkingConfig({
  defaultRoute: "Services",
  defaultPath: "/services",
  redirectPaths: ["", "/"],
});
