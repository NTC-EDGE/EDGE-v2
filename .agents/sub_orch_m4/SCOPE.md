# Scope: Milestone 4 — Core Feature Screens Redesign

## Architecture & Requirements
- Target directory: `apps/frontend/internal/src/features/`
- Goal: Redesign all core feature screens with enterprise aesthetic, runtime `useTheme()`, 3 platform variants (.native.tsx, .web.tsx, .desktop.tsx) + master selector (.tsx), motion design/micro-interactions, and zero TS errors / zero rule violations.
- Code Layout & Rules:
  - Strict TypeScript compliance (zero `any`, zero `as`, zero `!`).
  - `@edge/ui` component reuse (`PageHeader`, `DataTable`, `StatusBadge`, `SkeletonLoader`, `AnimatedCard`, `EmptyState`, `SearchBar`, `ThemeToggle`, `Button`, `FormFieldInput`).
  - Mobile-first + Responsive web (`maxWidth: 1200`, `alignSelf: 'center'`).
  - Master selector `[Screen].tsx` selects platform variant (`.native`, `.web`, `.desktop`).

## Milestones & Work Items
| # | Screen / Feature | Single File -> 3 Variants | Redesign Existing Variants | Status |
|---|------------------|---------------------------|----------------------------|--------|
| 1 | Announcements (`announcements/screens/AnnouncementsScreen.tsx`) | Yes | Yes | PLANNED |
| 2 | Audit Logs (`audit-logs/screens/AuditLogsScreen.tsx`) | Yes | Yes | PLANNED |
| 3 | Feedback (`feedback/screens/FeedbackScreen.tsx`) | Yes | Yes | PLANNED |
| 4 | Form Builder (`form-builder/screens/FormBuilderScreen.tsx`) | Yes | Yes | PLANNED |
| 5 | Queue Activities (`queue/screens/ActivitiesScreen.tsx`) | Yes | Yes | PLANNED |
| 6 | Queue Application Review (`queue/screens/ApplicationReviewScreen.tsx`) | Yes | Yes | PLANNED |
| 7 | Roles & Permission (`roles-permission/screens/RolesPermissionScreen.tsx`) | Yes | Yes | PLANNED |
| 8 | Employees (`employees/screens/EmployeesScreen.tsx`) | No (Existing variants) | Yes | PLANNED |
| 9 | Users (`users/screens/UsersScreen.tsx`) | No (Existing variants) | Yes | PLANNED |

## Iteration Status
Current iteration: 0 / 32
