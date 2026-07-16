# NTC-EDGE Backend API

This is the backend Web API service for the NTC-EDGE monorepo ecosystem. It is built using **.NET 10** and organized following the **Clean Architecture** structure.

## Architectural Layers
*   **EDGE.Domain**: Core entities and business rules (e.g., `ApplicationRecord`).
*   **EDGE.Application**: Use cases, MediatR command/query handlers, and FluentValidation rules.
*   **EDGE.Infrastructure**: Implementations of database, background tasks (Hangfire), and real-time communications (SignalR).
*   **EDGE.Api**: Web API hosting, Minimal APIs endpoints, and Clerk authentication configuration.

---

## Prerequisites
*   [.NET 10 SDK](https://dotnet.microsoft.com/download)
*   Development Secrets Tool initialized for `EDGE.Api`

---

## Development Setup

### 1. Set Up User Secrets
To ensure credentials are not committed to source control, configure the Clerk Secret Key using `.NET User Secrets`:

```bash
# Initialize user secrets inside apps/backend
dotnet user-secrets init --project EDGE.Api/EDGE.Api.csproj

# Set the Clerk Secret Key
dotnet user-secrets set "Clerk:SecretKey" "sk_test_C0jZFgcj8EnmImggVV5GE3JCyf4I53r4ombEgOmLBT" --project EDGE.Api/EDGE.Api.csproj
```

### 2. Build the Solution
Build the entire solution from the `apps/backend/` directory:

```bash
dotnet build
```

### 3. Run the Web API
Start the development server:

```bash
dotnet run --project EDGE.Api/EDGE.Api.csproj
```

By default, the application runs on:
*   Local Endpoint: `http://localhost:5038`

---

## Features & Endpoints

### Authentication
Endpoints like `POST /api/applications` are protected by Clerk JWT token authentication. You must supply a valid token in the headers:
```http
Authorization: Bearer <your_clerk_jwt_token>
```

### OpenAPI Documentation
When running in `Development` mode, interactive Scalar API documentation is available at:
*   [http://localhost:5038/scalar/v1](http://localhost:5038/scalar/v1)

### Real-time Notifications (SignalR)
SignalR Hub client endpoint for broadcasting system notifications:
*   Hub URL: `http://localhost:5038/hubs/notifications`

### Background Job Dashboard (Hangfire)
Monitor background and recurring worker queues:
*   Dashboard URL: `http://localhost:5038/hangfire`
