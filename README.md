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

---

## Troubleshooting & Common Issues

### 1. Unsupported Protocol Error (`EUNSUPPORTEDPROTOCOL`)
If you try to run `npm install` or Yarn v1 (`Classic`), you will get an error like:
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```
**Reason**: Standard `npm` and Yarn v1 do not support the `workspace:` protocol notation used to link local packages inside this monorepo.
**Solution**: Use **`bun install`** (or Yarn Berry v2+ / pnpm) which natively support monorepos.

### 2. `bun: command not found` in Git Bash (Windows)
If you installed Bun but get a command not found error in Git Bash:
**Reason**: Git Bash does not automatically sync environmental PATH changes on Windows without a reload.
**Solution**:
1. Run this command to load Bun in your current session:
   ```bash
   export PATH="$PATH:$USERPROFILE/.bun/bin"
   ```
2. Make it permanent by adding it to your `.bashrc`:
   ```bash
   echo 'export PATH="$PATH:$USERPROFILE/.bun/bin"' >> ~/.bashrc
   source ~/.bashrc
   ```
3. Alternatively, run the commands from **PowerShell** or **Command Prompt** (cmd.exe) which reload the PATH variables immediately.

