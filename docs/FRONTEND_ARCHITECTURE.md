# NTC-EDGE Frontend Layered Feature Architecture Guide

This document defines the mandatory architecture pattern for developing features, screens, forms, and data models across the NTC-EDGE Expo and TypeScript frontend applications (`apps/frontend/internal` and `apps/frontend/client`).

---

## 1. Directory Structure Standard

Every feature module inside `src/features/[featureName]/` **must adhere strictly to the following 4-layer directory structure**:

```
src/features/[featureName]/
├── schemas/                # Layer 1: Data & Validation Schemas (Zod)
│   └── [feature]Schemas.ts
├── hooks/                  # Layer 2: Service & Custom Form Hooks
│   └── use[Feature]Form.ts
├── forms/                  # Layer 3: Pure Form UI Components
│   └── [Feature]Form.tsx
└── components/             # Layer 4: Screen Presentation & Platform Native Shells
    ├── [Feature]Screen.tsx          # Master Platform Selector
    ├── [Feature]Screen.web.tsx      # Web Responsive Shell
    ├── [Feature]Screen.native.tsx   # Mobile Native (iOS / Android) Shell
    └── [Feature]Screen.desktop.tsx  # Desktop (macOS / Windows) Shell
```

---

## 2. Layer Responsibilities & Rules

### Layer 1: Data & Validation Schema (`schemas/`)
- Define Zod validation schemas (`z.object({...})`) for all user inputs and form fields.
- Export inferred TypeScript types (`export type MyFormData = z.infer<typeof mySchema>`).
- Keep validation rules pure, deterministic, and isolated from UI or API logic.

### Layer 2: Service & Custom Form Hooks (`hooks/`)
- Manage form state using `react-hook-form` initialized with `zodResolver(mySchema)`.
- Execute all asynchronous API endpoints, SWR calls, or Clerk authentication operations using the `safeAsync` wrapper (`import { safeAsync } from "@edge/api"`).
- **Rule**: Never leak scope error messages or use scattered `try-catch` blocks. `safeAsync` returns a clean tuple `[data, error]`.

### Layer 3: Pure Form UI Components (`forms/`)
- Build isolated form UI components (e.g., `LoginForm.tsx`, `ServiceRequestForm.tsx`).
- Consume atomic reusable components from `@edge/ui`:
  - `FormFieldInput` (Atomic Input integrated with `react-hook-form` & Zod errors)
  - `Button` (Atomic Button with primary/secondary/outline/ghost variants and loading state)
  - `AlertToast` (Atomic Alert/Toast banner)
- **Rule**: Form components must contain ZERO platform window layout code or hero branding cards.

### Layer 4: Screen Presentation & Platform Shells (`components/`)
- **Naming Standard**: All screen files and component symbols MUST use the `*Screen` suffix (e.g. `InternalLoginScreen`, `ForgotPasswordScreen`, `DashboardScreen`). Do **NOT** use `*Page`.
- Implement platform-specific UX extensions (`.web.tsx`, `.native.tsx`, `.desktop.tsx`) when platform UX shells differ.
- Export `[Feature]Screen.tsx` as the master platform entry selector.

---

## 3. Reference Implementation Example

```tsx
// 1. Data Schema (schemas/authSchemas.ts)
import { z } from "zod";
export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required."),
  password: z.string().min(1, "Password is required."),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// 2. Form Hook (hooks/useLoginForm.ts)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { safeAsync } from "@edge/api";

export function useLoginForm() {
  const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const onSubmit = form.handleSubmit(async (data) => {
    const [res, error] = await safeAsync(loginApiCall(data));
    if (error) {
      // Handle error cleanly
    }
  });
  return { form, onSubmit };
}

// 3. Form Component (forms/LoginForm.tsx)
import { FormFieldInput, Button } from "@edge/ui";
export function LoginForm({ loginState }) {
  return (
    <View>
      <FormFieldInput control={loginState.form.control} name="identifier" label="Email" />
      <Button onPress={loginState.onSubmit}>Sign In</Button>
    </View>
  );
}

// 4. Master Screen Component (components/InternalLoginScreen.tsx)
import { Platform } from "react-native";
import { InternalLoginScreenWeb } from "./InternalLoginScreen.web";
import { InternalLoginScreenNative } from "./InternalLoginScreen.native";

export function InternalLoginScreen() {
  return Platform.OS === "web" ? <InternalLoginScreenWeb /> : <InternalLoginScreenNative />;
}
```
