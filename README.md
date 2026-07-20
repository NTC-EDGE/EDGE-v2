# NTC-EDGE Monorepo

Welcome to the **NTC-EDGE** monorepo. This repository contains both frontend and backend applications for the NTC-EDGE ecosystem.

## Directory Structure

```
EDGE-v2/
├── apps/
│   ├── frontend/
│   │   ├── client/      <-- Cross-platform Client (React Native, Expo, Electron)
│   │   └── internal/    <-- Internal Cross-platform App
│   └── backend/         <-- Backend C# / .NET services
├── packages/
│   └── api/             <-- Shared API package
├── package.json         <-- Workspace settings
└── bun.lockb            <-- Workspace lockfile
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [Node.js](https://nodejs.org/) (v18+)
- [.NET SDK](https://dotnet.microsoft.com/download) (for C# backends)

### Installation

Install dependencies for all workspace projects from the root directory:

```bash
bun install
```

### Running the Client Application

Run the cross-platform client app using these scripts at the root level:

- **Start Expo Metro Bundler**:
  ```bash
  bun client:start
  ```
- **Run on Android**:
  ```bash
  bun client:android
  ```
- **Run on iOS**:
  ```bash
  bun client:ios
  ```
- **Run on Web**:
  ```bash
  bun client:web
  ```
- **Build Web Bundle**:
  ```bash
  bun client:build:web
  ```

### Running the Internal Application

Run the internal cross-platform app using these scripts at the root level:

- **Start Expo Metro Bundler**:
  ```bash
  bun internal:start
  ```
- **Run on Android**:
  ```bash
  bun internal:android
  ```
- **Run on iOS**:
  ```bash
  bun internal:ios
  ```
- **Run on Web**:
  ```bash
  bun internal:web
  ```
- **Build Web Bundle**:
  ```bash
  bun internal:build:web
  ```

### Type Checking

Run type checks for both client and internal applications:

```bash
bun check-types
```
