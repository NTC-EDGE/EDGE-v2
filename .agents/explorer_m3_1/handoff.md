# Handoff Report — Explorer 1 (Milestone 3: Auth Screens Exploration)

## 1. Observation
Directly observed facts and findings from code analysis:

* **File structure in `apps/frontend/internal/src/features/login/`**:
  * Monolithic screens missing platform variants (`.native.tsx`, `.web.tsx`, `.desktop.tsx` + master selector):
    * `components/LandingScreen.tsx` (164 lines)
    * `components/ForgotPasswordScreen.tsx` (201 lines)
    * `components/OnboardingScreen.tsx` (188 lines)
  * Existing master selector + 3 platform variants (requiring redesign):
    * `components/InternalLoginScreen.tsx` (18 lines)
    * `components/InternalLoginScreen.native.tsx` (154 lines)
    * `components/InternalLoginScreen.web.tsx` (487 lines)
    * `components/InternalLoginScreen.desktop.tsx` (259 lines)
* **Type Safety & Non-Null / Type Assertion Violations**:
  * `LandingScreen.tsx:9`: `const navigation = useNavigation<any>();`
  * `LandingScreen.tsx:30`: `style={({ pressed, hovered }: any) => [`
  * `OnboardingScreen.tsx:25`: `const navigation = useNavigation<any>();`
  * `OnboardingScreen.tsx:55`: `<Lucide name={step.icon as any} size={48} color={COLORS.brand[800]} />` with `eslint-disable-next-line @typescript-eslint/no-explicit-any`
  * `useForgotPasswordForm.ts:46`: `const signInObj = signIn as unknown as { create: ... };`
  * `useForgotPasswordForm.ts:77`: `const signInObj = signIn as unknown as { resetPassword: ... };`
  * `MfaOtpVerificationModal.tsx:382`: `({ outlineWidth: 0, outlineColor: "transparent" } as unknown as TextStyle)`
* **Theme Awareness Deficiencies**:
  * `LandingScreen.tsx` imports static `COLORS` from `@edge/ui` (line 3) instead of calling `useTheme()`.
  * `OnboardingScreen.tsx` imports static `COLORS` from `@edge/ui` (line 3) instead of calling `useTheme()`.
  * `ForgotPasswordScreen.tsx` hardcodes hex colors (`#0B132B`, `#94A3B8`, `#FFFFFF`, `#E2E8F0`, `#3B82F6`, `#0F172A`, `#64748B`, `#10B981`) instead of using `useTheme()`.
  * `InternalLoginScreen.native.tsx`, `.web.tsx`, `.desktop.tsx`, and `LoginForm.tsx` hardcode hex colors (`#0B132B`, `#080D1A`, `#FFFFFF`, `#F1F5F9`, `#1E3A8A`, `#2563EB`, `#E2E8F0`) instead of consuming `useTheme()` tokens dynamically.
* **Layout Sizing Constraints**:
  * `LandingScreen.tsx` uses `maxWidth: 600` (line 65) instead of standard `maxWidth: 440`.
  * `OnboardingScreen.tsx` uses `maxWidth: 600` (line 102) instead of standard `maxWidth: 440`.
  * `ForgotPasswordScreen.tsx` uses `maxWidth: 480` (line 137) instead of standard `maxWidth: 440`.
  * `InternalLoginScreen.web.tsx` & `.desktop.tsx` form cards use `maxWidth: 460` (lines 356 & 199) instead of standard `maxWidth: 440`.
* **TypeScript Check Result**:
  * Command `bun run check-types` in `apps/frontend/internal` completed successfully with 0 errors.

---

## 2. Logic Chain

1. **Observation**: `LandingScreen.tsx`, `ForgotPasswordScreen.tsx`, and `OnboardingScreen.tsx` currently exist as single files without `.native.tsx`, `.web.tsx`, and `.desktop.tsx` platform splits.
   * **Reasoning**: To comply with design system Section 5 ("The 4-File Platform Pattern"), each feature screen must be split into a master selector (`[Feature]Screen.tsx`) and 3 platform variants (`.native.tsx`, `.web.tsx`, `.desktop.tsx`).

2. **Observation**: Multiple instances of `any` types and `as unknown as` assertions were found in `LandingScreen.tsx`, `OnboardingScreen.tsx`, `useForgotPasswordForm.ts`, and `MfaOtpVerificationModal.tsx`.
   * **Reasoning**: Project rules strictly mandate ZERO `any` types, ZERO `as` type assertions, and ZERO `!` non-null assertions. These assertions must be replaced with strict interfaces, safe property checks (`'create' in signIn`), and generic types.

3. **Observation**: All 4 Auth screens and sub-forms use static `COLORS` imports or hardcoded hex strings instead of `useTheme()`.
   * **Reasoning**: The design system requires runtime dynamic theme switchability (Slate 800/900 dark palette, Slate 50 light palette). Replacing static imports with `useTheme()` hook tokens (`colors.bg`, `colors.cardBg`, `colors.text`, `colors.border`) enables instant light/dark adaptation without visual shifts.

4. **Observation**: Container width styling across auth screens ranges from `460px` to `600px`.
   * **Reasoning**: Monorepo custom rules mandate mobile-first design with `maxWidth: 440` on all auth forms/modals combined with `alignSelf: 'center'`.

5. **Observation**: Form submission and navigation logic currently function properly with Clerk, `safeAsync`, `react-hook-form`, and `zodResolver`.
   * **Reasoning**: Implementers must maintain existing state contracts, schema definitions (`authSchemas.ts`), and API error handling while applying the UI/UX redesign and platform split.

---

## 3. Caveats
* **Build Environment**: `bun run check-types` passes, confirming no existing syntax/type compilation issues.
* **Assets**: Logo assets (`logo.png`, `white-ntc-logo.png`, `footer-logo.png`) exist in `apps/frontend/internal/assets/`.
* **Testing Scope**: Unit test execution was not requested during exploration; implementers should re-run `bun run check-types` and `bun test` after refactoring.

---

## 4. Conclusion
The Auth screens in `apps/frontend/internal/src/features/login/` require restructuring into master selector + 3 platform variants (`.native.tsx`, `.web.tsx`, `.desktop.tsx`), strict removal of all `any` and `as` type assertions, complete theme token adoption via `@edge/ui` `useTheme()`, standardization to `maxWidth: 440` with `alignSelf: 'center'`, and addition of mount entrance animations (`AnimatedCard`) while strictly preserving existing form logic, Clerk auth, and navigation functionality.

Detailed execution blueprints and proposed code changes are documented in `analysis.md`.

---

## 5. Verification Method

To independently verify the findings and implementation readiness:
1. Inspect `analysis.md` for deep dive code observations, gap breakdowns, and proposed refactoring snippets.
2. Execute TypeScript validation command:
   ```bash
   cd apps/frontend/internal
   bun run check-types
   ```
3. Inspect `apps/frontend/internal/src/features/login/components/` files to verify line references quoted in Section 1.
