# NTC-EDGE External Client Application

This is the cross-platform client app for external portal users. It is built using **Expo SDK 57**, **React Native**, and **React Navigation 8**.

---

## Prerequisites
*   [Node.js](https://nodejs.org/) (v24.22.1+ LTS)
*   [Bun](https://bun.sh/) (v1.x) or [Yarn](https://yarnpkg.com/)
*   [Expo Go App](https://expo.dev/go) (for running on physical mobile devices)

---

## Development Setup

### 1. Configure Clerk Environment Variables
Create a `.env` file in the root of this folder (`apps/frontend/client/.env`) and add your Clerk Publishable Key:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZWFzeS1zbmlwZS0zNi5jbGVyay5hY2NvdW50cy5kZXYk
```

### 2. Install Dependencies
Run installation from the workspace root or inside this folder:

```bash
# Using bun (recommended)
bun install
```

### 3. Start the Application
Start the Expo Metro Bundler server:

```bash
bun start
```

Once Metro is running, choose your target platform:
*   Press **`w`** to launch on the Web.
*   Press **`a`** to open in an Android Emulator.
*   Press **`i`** to open in an iOS Simulator.
*   Scan the QR code in the terminal using the **Expo Go** application on your phone.

---

## Authentication Integration
This project is integrated with **Clerk Authentication**. 
*   **Token Caching**: Handled securely via `expo-secure-store`.
*   **Auth Guard**: The navigation is wrapped inside `<ClerkProvider>` so that only authenticated users can access the application details screens. Unauthenticated users are redirected to the custom auth sign-in and registration screen.
