# Customization Rules for NTC-EDGE Monorepo

This workspace houses both the C# .NET 10 Clean Architecture backend (`apps/backend`) and the Expo/TypeScript frontends (`apps/frontend`). All agents must adhere to the following segregated rules and best practices.

---

## 1. Frontend (TypeScript & React Native / Expo) Rules

### Strict Type Safety
*   **No Type Assertions**: Never use type assertions (e.g., `value as string`, `<string>value`) or non-null assertions (e.g., `value!`).
*   **Strict Runtime Guards**: Check variables for `null` or `undefined` using explicit checks (e.g., `if (value !== null)`) instead of force-casting with `!`.
*   **No `any` Type**: Do not use the `any` type. If a type is unknown or dynamic, use `unknown` and implement proper type guards (`typeof`, `instanceof`, or custom type guard functions).
*   **Automatic Type Inference**: Rely on TypeScript's automatic type inference as much as possible. When explicit types are required, write them safely and completely.

### Mobile-First & Responsive Web Design
*   **Mobile-First Approach**: All frontend layouts must be built using a mobile-first philosophy, ensuring clean, native-feeling views on iOS and Android devices.
*   **Prevent Overstretching on Web**: To prevent inputs, buttons, cards, forms, and main container wrappers from stretching awkwardly across wide desktop web browsers, you **must** apply a reasonable `maxWidth` constraint (e.g., `maxWidth: 440` for authentication/modals, or `maxWidth: 1200` for grid/dashboards) combined with `alignSelf: 'center'` (or centering parent flex layouts).
*   **Layout Adaptability**: Avoid creating duplicate platform-specific files for layout structures (e.g., avoiding `.web.tsx` vs `.tsx`). Instead, use React Native's `useWindowDimensions()` hook to adapt layout flex directions (e.g., `row` on desktop, `column` on mobile) and override styling properties dynamically.

---

## 2. Backend (C# & .NET 10 Clean Architecture) Rules

### Clean Architecture Alignment
*   Ensure all new features respect the layer separation:
    *   `Domain`: Pure entities, interfaces, and core domain exceptions.
    *   `Application`: Commands, queries, MediatR handlers, and application logic.
    *   `Infrastructure`: Database, SignalR hubs, Hangfire tasks, and external integrations.
    *   `EDGE.Api`: Minimal APIs, routing, and controller mappings.

### Endpoint Validation
*   **Mandatory User Input Validation**: Any API endpoint that accepts user input (e.g., POST/PUT requests mapped to MediatR Commands) **must have an accompanying validator** (using FluentValidation) to validate the input structure and content before processing.
*   **Automatic Invocation**: Always invoke the validator explicitly or via pipeline behaviors at the endpoint entry point (e.g., using `validator.ValidateAsync(command)`) and return appropriate problem details (e.g., `Results.ValidationProblem`) if validation fails.

### Security & Secrets
*   **No Secrets in Source Control**: Never place development or production credentials (such as API keys, secret keys, or connection strings) inside `appsettings.json`. Use `.NET User Secrets` (`secrets.json`) for local development and environment variables/key vault for production and CI/CD pipelines.
