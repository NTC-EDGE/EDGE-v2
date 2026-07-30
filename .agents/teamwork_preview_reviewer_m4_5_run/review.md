# Code Review Report — Worker 3 Changes in apps/frontend/internal

**Reviewer**: Reviewer 5
**Target**: `apps/frontend/internal`
**Verdict**: **VETO**

---

## Executive Summary

The type-check command (`cmd /c pnpm --filter ntc-edge-internal check-types`) executed cleanly with **0 errors**. Zero non-null `!` assertions and zero `any` types were detected. However, the submission fails two mandatory task and workspace rules:
1. **7 explicit `as` type assertions** exist in `ActivitiesFeedPane.tsx` and `EndorseModal.tsx`.
2. **1 file using `Page` naming** (`StandardPageWrapper.tsx`) exists in `src/features/shell/components/`, violating the `*Screen` naming standard.

---

## Review Dimensions & Findings

### 1. Type Safety & Assertions

- **Status**: **FAIL**
- **Findings**:
  - `apps/frontend/internal/src/features/queue/components/ActivitiesFeedPane.tsx`:
    - Line 56: `value: "Exams" as ApplicationCategory`
    - Line 61: `value: "Permits" as ApplicationCategory`
    - Line 66: `value: "Licenses" as ApplicationCategory`
    - Line 71: `value: "Accreditations" as ApplicationCategory`
    - Line 76: `value: "Certificates" as ApplicationCategory`
    - Line 81: `value: "Complaints and Request" as ApplicationCategory`
  - `apps/frontend/internal/src/features/queue/components/modals/EndorseModal.tsx`:
    - Line 88: `name={item.icon as 'briefcase'}`
- **Impact**: Violates strict type safety rules in `AGENTS.md` ("No Type Assertions: Never use type assertions") and the task constraint ("Verify zero `as` assertions").

### 2. Naming Standards (`*Screen` vs `*Page`)

- **Status**: **FAIL**
- **Findings**:
  - `apps/frontend/internal/src/features/shell/components/StandardPageWrapper.tsx`
- **Impact**: Violates naming conventions in `AGENTS.md` ("Use *Screen keyword for all screen components... Do NOT use *Page") and the task constraint ("Verify zero `*Page` files").

### 3. Type Checking (`check-types`)

- **Status**: **PASS**
- **Details**: `cmd /c pnpm --filter ntc-edge-internal check-types` ran `tsc --noEmit` and passed with exit code 0.

### 4. No `any` & No Non-Null Assertions (`!`)

- **Status**: **PASS**
- **Details**: AST analysis confirmed 0 occurrences of `any` types and 0 non-null `!` assertions in logic code.

---

## Detailed Findings & Actionable Remediation

### [Critical] Finding 1: Remove `as` Type Assertions in Queue Components

- **Where**:
  - `apps/frontend/internal/src/features/queue/components/ActivitiesFeedPane.tsx:56,61,66,71,76,81`
  - `apps/frontend/internal/src/features/queue/components/modals/EndorseModal.tsx:88`
- **Remediation**:
  - In `ActivitiesFeedPane.tsx`, define `FILTER_CATEGORIES` using typed literal tuples or typed object array so TypeScript infers `ApplicationCategory` naturally without casting.
  - In `EndorseModal.tsx`, ensure `item.icon` is typed properly using the icon name union type.

### [Major] Finding 2: Rename `StandardPageWrapper.tsx` to `*Screen` Convention

- **Where**: `apps/frontend/internal/src/features/shell/components/StandardPageWrapper.tsx`
- **Remediation**:
  - Rename file to `StandardScreenWrapper.tsx`.
  - Rename component export to `StandardScreenWrapper`.
  - Update imports in `AppLayout.desktop.tsx` and `AppLayout.web.tsx`.

---

## Verified Claims Matrix

| Claim / Requirement | Verification Method | Result | Notes |
|---|---|---|---|
| `pnpm --filter ntc-edge-internal check-types` | Executed via terminal | **PASS** | 0 compilation errors |
| Zero `as` type assertions | AST scan (`ts.isAsExpression`) | **FAIL** | 7 `as` assertions found |
| Zero `*Page` files | Filename pattern search | **FAIL** | `StandardPageWrapper.tsx` present |
| Zero non-null `!` assertions | AST scan (`ts.isNonNullExpression`) | **PASS** | 0 `!` assertions |
| Zero `any` types | AST scan (`ts.SyntaxKind.AnyKeyword`) | **PASS** | 0 `any` types |

---

## Final Verdict

**VETO**
