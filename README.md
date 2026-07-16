# NTC-EDGE Monorepo

Welcome to the **NTC-EDGE** monorepo. This repository contains both frontend and backend applications for the NTC-EDGE ecosystem.

## Directory Structure

```
NTC-EDGE.FrontEnd/
├── apps/
│   ├── frontend/
│   │   └── client/      <-- Cross-platform Client (React Native, Expo, Electron)
│   └── backend/         <-- Backend C# / .NET services
├── packages/            <-- Shared packages (JS/TS libraries, C# DLLs)
├── package.json         <-- Workspace settings
└── yarn.lock            <-- Workspace lockfile
```

## Getting Started

### Prerequisites

- [Yarn](https://yarnpkg.com/) (v1.x recommended)
- [Node.js](https://nodejs.org/) (v18+)
- [.NET SDK](https://dotnet.microsoft.com/download) (for C# backends)

### Installation

Install dependencies for all workspace projects from the root directory:

```bash
yarn install
```

### Running the Client Application

Run the cross-platform client app using these scripts at the root level:

- **Start Expo Metro Bundler**:
  ```bash
  yarn client:start
  ```
- **Run on Android**:
  ```bash
  yarn client:android
  ```
- **Run on iOS**:
  ```bash
  yarn client:ios
  ```
- **Run on Web**:
  ```bash
  yarn client:web
  ```
- **Build Web Bundle**:
  ```bash
  yarn client:build:web
  ```
