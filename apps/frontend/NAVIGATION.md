# NTC-EDGE Frontend Navigation Architecture & Expo Web Linking Guidelines

This document outlines the standard navigation architecture for **Expo applications** in this monorepo (`apps/frontend/internal` and `apps/frontend/client`).

> [!NOTE]
> **Expo-Exclusive Scope**: This navigation architecture and custom linking configuration (`createLinkingConfig`, `getPrefixes`) apply **exclusively to Expo apps** using React Navigation version 8. Next.js apps in this workspace (such as `apps/frontend/admin`) use Next.js native filesystem routing and `@clerk/nextjs` server/middleware redirections, which operate independently without React Navigation.

---

## 1. Core Principles (Expo Apps)

1. **Separation of Concerns**: `App.tsx` serves strictly as the application root (initializing global providers like Clerk, Auth Context, and top-level shells). Navigation stacks, screen routing, and web linking configs MUST live in the dedicated `navigation` (or `routes`) directory.
2. **React Navigation 8 Static Navigation**: Stacks are declared statically using `createNativeStackNavigator` and converted to static components via `createStaticNavigation`.
3. **Web Linking Support & Dynamic Helpers**: Web linking configurations (`prefixes`, `getStateFromPath`, `getPathFromState`) are declaratively generated using `createLinkingConfig` from the shared `@edge/ui` workspace package.

---

## 2. Shared Expo Navigation Utilities (`packages/ui`)

Common navigation helpers and deep linking utilities shared across all Expo applications live in `@edge/ui`:

```ts
import { createLinkingConfig, type LinkingOptions } from "@edge/ui";

export const authLinking: LinkingOptions<object> = createLinkingConfig({
  defaultRoute: "Dashboard",
  defaultPath: "/dashboard",
  redirectPaths: ["", "/", "internal/login", "internal/landing"],
});
```

`createLinkingConfig` automatically:
- Manages web prefixes (`http://localhost:8081-8083`, `edge://`, `window.location.origin`).
- Handles trailing/leading slashes, query parameters, and custom root route redirects cleanly.
- Applies OWASP Open Redirect security sanitization (`sanitizeRedirectPath`).

---

## 3. Internal Application Navigation Structure (`apps/frontend/internal/src/navigation`)

```
src/navigation/
├── index.ts               # Main entry point exporting UnauthNavigation, AuthNavigation, linking, & types
├── config/
│   └── linking.ts         # Declarative web linking configurations via createLinkingConfig()
├── stacks/
│   ├── index.ts           # Re-exports all navigation stacks and placeholder components
│   ├── AuthStack.tsx      # Authenticated navigation stack (Dashboard, Employees, Users, Settings, etc.)
│   ├── UnauthStack.ts     # Unauthenticated navigation stack (InternalLogin)
│   └── PlaceholderScreen.tsx # Staging placeholder component for feature modules
└── types.ts               # TypeScript route param lists (AuthParamList, UnauthParamList)
```

---

## 4. Client Application Navigation Structure (`apps/frontend/client/src/routes`)

```
src/routes/
├── index.ts               # Entry point exporting UnauthNavigation, AuthNavigation, clientLinking, & types
├── config/
│   └── linking.ts         # Client web linking configuration via createLinkingConfig()
├── auth.tsx               # Authenticated stack (Services, MyApplications, etc.)
└── public.tsx             # Unauthenticated stack (Landing, Login, SignUp, ForgotPassword)
```

---

## 5. `App.tsx` Integration Pattern (Expo Apps)

`App.tsx` should only import navigation components and pass the linking configuration:

```tsx
import {
  UnauthNavigation,
  AuthNavigation,
  unauthLinking,
  authLinking,
} from "./src/navigation";

// Inside AppContent:
if (!isAuthenticated) {
  return <UnauthNavigation linking={unauthLinking} />;
}

return (
  <DashboardShell activeScreen={activeScreen} onNavigate={...}>
    <AuthNavigation ref={navigationRef} linking={authLinking} />
  </DashboardShell>
);
```

---

## 6. Strict Type Safety Guidelines

- Do **NOT** use type assertions (`value as string`) or non-null assertions (`value!`).
- Do **NOT** use `any`. Use `unknown` or standard TypeScript types (`RouteProp<ParamListBase, string>`).
- Always check nullable values with explicit runtime checks (`if (value !== null)`).
