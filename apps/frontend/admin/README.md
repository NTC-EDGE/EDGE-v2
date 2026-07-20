# NTC-EDGE | System Administrator Configuration Portal

This is the **System Administrator Web Application** for the **NTC-EDGE** ecosystem. Built as a high-end web dashboard using the App Router, it provides system managers with administrative control over geo-reference structures (Regions, Provinces, Municipalities, and Barangays).

---

## 🚀 Tech Stack

- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Data Caching & Fetching**: [SWR](https://swr.vercel.app/) (State-While-Revalidate hooks) & [Axios](https://github.com/axios/axios)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/nextjs` middleware and pre-configured screens)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI Primitives](https://www.radix-ui.com/)
- **Monorepo Linkage**: [Bun](https://bun.sh/) (Workspace package links, leveraging `@edge/api`)

---

## 📂 Architecture & Layers

The project splits frontend boundaries into three segregated layers for maintainability and workspace sharing:

```
apps/frontend/admin/
├── src/
│   ├── app/            <-- Next.js Pages & Layouts (UI layer)
│   ├── components/     <-- Shared components & Radix wraps (Dialog, Button)
│   ├── lib/            <-- Utilities & helper libraries
│   └── services/       <-- Service Layer (SWR Hooks, CRUD operations)
```

1. **Data Layer** (Shared via `@edge/api` in `packages/api/src/types.ts`):
   - Type definitions and interfaces for geographic entities (`Region`, `Province`, `Municipality`, `Barangay`) and request DTOs.
2. **Network Layer** (Shared via `@edge/api` and configured locally in `src/services/api.ts`):
   - Axios client instance with base server URLs.
   - Dynamic request interceptor to fetch and attach Clerk JWT tokens in the `Authorization` header of outgoing requests.
3. **Service Layer** (`src/services/`):
   - High-level CRUD operations wrapping SWR caching and Axios calls (e.g. `useRegions`, `createProvince`, `deleteMunicipality`).

---

## 🛠️ Configuration

Create a `.env.local` file in this directory (or duplicate `.env.local.example`):

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk Route Settings
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Backend API Service URL
NEXT_PUBLIC_API_URL=http://localhost:5038
```

---

## 💻 Commands & Development

Since this project resides within a monorepo workspace, run commands from the **root directory** of the repository:

### 1. Run Development Server
```bash
bun admin:dev
```
Serves the portal locally on [http://localhost:3000](http://localhost:3000).

### 2. Workspace Typecheck
```bash
bun check-types
```
Validates TypeScript compilations across `@edge/admin`, Expo mobile clients, and packages.

### 3. Production Build
```bash
bun admin:build
```
Generates an optimized static next-build output.

### 4. Serve Production Build
```bash
bun admin:start
```
Runs the compiled server production bundle.
