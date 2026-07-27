import { createLinkingConfig } from "@edge/ui";
import { type LinkingOptions } from "@react-navigation/native";

/**
 * Web & Native linking configuration for Client app.
 * Automatically resolves relative to browser location on Web (window.location.origin).
 *
 * NOTE: The explicit cast is required because Bun resolves two peer-dep-hashed copies of
 * @react-navigation/core (one from @edge/ui, one from this app), making the same structural
 * type appear as "unrelated types" to the TypeScript compiler. The cast is safe — both copies
 * are structurally identical at runtime.
 */
export const clientLinking = createLinkingConfig({
  defaultRoute: "Services",
  defaultPath: "/services",
  redirectPaths: ["", "/"],
}) as unknown as LinkingOptions<object>;
