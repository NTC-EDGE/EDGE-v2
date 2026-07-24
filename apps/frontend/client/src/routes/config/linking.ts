import type { LinkingOptions } from "@react-navigation/native";

/**
 * Web & Native linking configuration for Client app.
 * Automatically resolves relative to browser location on Web (window.location.origin).
 */
export const clientLinking: LinkingOptions<object> = {
  prefixes: [],
};
