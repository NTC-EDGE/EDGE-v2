import { createLinkingConfig, type LinkingOptions } from "@edge/ui";

/**
 * Web & Native linking configuration for unauthenticated routes in Internal app.
 */
export const unauthLinking: LinkingOptions<object> = createLinkingConfig({
  defaultRoute: "InternalLogin",
  defaultPath: "/internal/login",
  redirectPaths: ["", "/", "login"],
});

/**
 * Web & Native linking configuration for authenticated routes in Internal app.
 * Handles root redirects (/ -> /dashboard) and legacy route aliases.
 */
export const authLinking: LinkingOptions<object> = createLinkingConfig({
  defaultRoute: "Dashboard",
  defaultPath: "/dashboard",
  redirectPaths: ["", "/", "internal/login", "internal/landing"],
});
