# Adversarial Challenge Report — Milestone 4 Core Feature Screens Redesign

## Challenge Summary

**Overall Risk Assessment**: **MEDIUM**

While the core feature screens successfully implement platform splitting (`.native.tsx`, `.web.tsx`, `.desktop.tsx`, and master selector `.tsx`) and adopt clean component structure without circular imports or `any` types, empirical testing revealed specific type check failures, missing `maxWidth: 1200` constraints on `ApplicationReviewScreen` desktop/web variants, and hardcoded background color hex values violating theme palette enforcement.

---

## Challenges

### [High] Challenge 1: Type Check Compilation Failures in `SettingsScreen` and Auth/Login Screens
- **Assumption challenged**: All redesigned feature screens compile cleanly without TypeScript errors when invoking `pnpm --filter ntc-edge-internal check-types` (`npx tsc --noEmit`).
- **Attack Scenario**: Running `pnpm --filter ntc-edge-internal check-types` fails with Exit Code 2 due to 18 TypeScript errors across `SettingsScreen` variants (`SettingsScreen.desktop.tsx`, `SettingsScreen.native.tsx`, `SettingsScreen.web.tsx`) as well as `LandingScreen` and `OnboardingScreen`. In `SettingsScreen`, `NavigationProp` and `ParamListBase` produce TS2552 and TS2304 compilation errors.
- **Blast Radius**: CI/CD build failures; potential runtime navigation errors if untyped navigation hooks fail during routing.
- **Mitigation**: Correct navigation type annotations in `SettingsScreen.desktop.tsx`, `SettingsScreen.native.tsx`, `SettingsScreen.web.tsx` by importing or specifying valid react-navigation types or custom screen prop interface.

### [Medium] Challenge 2: Missing `maxWidth: 1200` Responsive Wrapper in `ApplicationReviewScreen.desktop.tsx` and `ApplicationReviewScreen.web.tsx`
- **Assumption challenged**: All web and desktop screen variants enforce `maxWidth: 1200` with centering to prevent layout overstretching on wide desktop viewports.
- **Attack Scenario**: Opening `ApplicationReviewScreen` on an ultra-wide desktop monitor (e.g. 1920px - 2560px width).
- **Blast Radius**: `ApplicationReviewScreen.desktop.tsx` and `ApplicationReviewScreen.web.tsx` wrap `<ApplicationReviewScreenContent />` in `{ flex: 1, width: '100%' }` without `maxWidth: 1200` or `alignSelf: 'center'`, causing tables, detail panes, and forms to stretch across the full screen width, violating `AGENTS.md` responsive design rules.
- **Mitigation**: Wrap `ApplicationReviewScreenContent` in `ApplicationReviewScreen.desktop.tsx` and `ApplicationReviewScreen.web.tsx` with `{ maxWidth: 1200, width: '100%', alignSelf: 'center' }`.

### [Medium] Challenge 3: Hardcoded Background Hex Color Tokens Violating Theme Palette Consistency
- **Assumption challenged**: All screen components dynamically resolve background colors via `useTheme()` palette values (`colors.bg`, `colors.surface`, `colors.card`) rather than hardcoding static hex colors.
- **Attack Scenario**: Toggling dark mode runtime theme (`useTheme()`) on `RolesPermissionScreen` or sub-components (`AddRoleModal`, `RoleCard`, `ActivitiesFeedPane`).
- **Blast Radius**: In `RolesPermissionScreen.desktop.tsx:351` and `RolesPermissionScreen.web.tsx:353`, matrix toolbars hardcode `#F8FAFC` and `#0F172A`. In `AddRoleModal.tsx:308`, `RoleCard.tsx:74`, and `RegionSelectionModal.tsx:383`, `backgroundColor: '#F8FAFC'` is hardcoded without theme palette reference. Under customized high-contrast themes or custom brand color schemes, these hardcoded backgrounds will fail to adapt.
- **Mitigation**: Replace hardcoded `#F8FAFC` and `#0F172A` values with dynamic palette tokens from `useTheme()` (e.g., `colors.surface`, `colors.bg`).

### [Low] Challenge 4: Type Assertion (`as `) Usage in Child Content / Pane Components
- **Assumption challenged**: Zero type assertions (`value as Type`) are used across the codebase as specified by strict TypeScript rules in `AGENTS.md`.
- **Attack Scenario**: Modifying data shapes or API responses passed into `ApplicationReviewScreenContent.tsx` or `ActivitiesFeedPane.tsx`.
- **Blast Radius**: `ApplicationReviewScreenContent.tsx:1118` uses `(EDITABLE_STATUSES as readonly string[])`, `ActivitiesFeedPane.tsx:56-81` uses `"Exams" as ApplicationCategory`, `EndorseModal.tsx:88` uses `item.icon as 'briefcase'`, and `RegionalConfigTab.tsx:103` uses `card.icon as keyof typeof Lucide.glyphMap`. If types change upstream, runtime errors may be masked by type assertions.
- **Mitigation**: Replace `as` assertions with typed constant declarations (`satisfies`) or explicit type annotations on arrays/objects.

---

## Stress Test Results

| Test Scenario | Target File(s) | Expected Result | Actual Result | Verdict |
|---|---|---|---|---|
| 1. TypeScript Type Check Compilation | `apps/frontend/internal/src/features` | Exit code 0 (clean compilation) | Exit code 2 (18 TS errors in `SettingsScreen`, `LandingScreen`, `OnboardingScreen`) | **FAIL** |
| 2. `any` Token Check | 9 core feature screen files | 0 `any` type usage | 0 `any` type usage | **PASS** |
| 3. `!` Non-null Assertion Check | 9 core feature screen files | 0 `!` non-null assertion usage | 0 `!` non-null assertion usage | **PASS** |
| 4. Hardcoded `#F8FAFC` Background Check | 9 core feature screen files & components | No hardcoded background hex codes | Hardcoded `#F8FAFC` found in `RolesPermissionScreen.desktop.tsx:351`, `RolesPermissionScreen.web.tsx:353`, `AddRoleModal.tsx:308`, `RoleCard.tsx:74`, etc. | **FAIL** |
| 5. `maxWidth: 1200` Container Check | Web & Desktop variants of 9 screens | `maxWidth: 1200` present in all web/desktop variants | Present in 8 of 9 screens; Missing in `ApplicationReviewScreen.desktop.tsx` and `ApplicationReviewScreen.web.tsx` | **FAIL** |
| 6. Variant Export & Props Consistency | Master `.tsx` & platform variants | Consistent default/named exports and matching props | All 9 screens export matching components and handle props correctly without circular references | **PASS** |

---

## Unchallenged Areas

- **Backend SignalR / Minimal APIs**: Out of scope for frontend feature screen empirical testing.
- **Animation Performance on Physical Hardware**: Real-device FPS testing of `AnimatedCard` motion physics was not performed; static structural and compilation analysis was executed.
