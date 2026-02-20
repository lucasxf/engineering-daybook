# learnimo - Backend

> Spring Boot REST API for learnimo

## Tech Stack

- **Java 21** (with Virtual Threads)
- **Spring Boot 4.0+**
- **PostgreSQL 15** with pgvector
- **Flyway** for migrations
- **SpringDoc OpenAPI** for API documentation

## Prerequisites

- Java 21 (LTS)
- Docker (for local PostgreSQL)
- Maven 3.9+ (or use included wrapper)

## Quick Start

### 1. Start PostgreSQL (Docker)

From the project root:

```bash
docker-compose up -d
```

### 2. Run the Application

```bash
./mvnw spring-boot:run
```

> **Windows note:** If `./mvnw` fails with an SSL error (`CRYPT_E_NO_REVOCATION_CHECK`), use the system Maven instead: `mvn spring-boot:run`

### 3. Access the API

- **Health Check:** http://localhost:8080/api/v1/health
- **Swagger UI:** http://localhost:8080/swagger-ui
- **OpenAPI Spec:** http://localhost:8080/api-docs

## Development

### Run Tests

```bash
./mvnw test
```

### Run Full Verification

```bash
./mvnw verify
```

### Build Docker Image

```bash
docker build -t engineering-daybook-backend .
```

## Project Structure

```
src/main/java/com/lucasxf/ed/
├── EdApplication.java       # Main entry point
├── config/                  # Spring configurations
├── controller/              # REST controllers
├── service/                 # Business logic
├── repository/              # Data access
├── domain/                  # Entities
├── dto/                     # Request/Response objects
├── security/                # Authentication/Authorization
└── exception/               # Error handling
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `ed` | Database name |
| `DB_USER` | `ed` | Database user |
| `DB_PASSWORD` | `ed` | Database password |
| `SERVER_PORT` | `8080` | Server port |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS allowed origins |
| `JWT_SECRET` | *(dev-only default)* | HMAC-SHA256 signing key — **must be set in production** |
| `GOOGLE_CLIENT_ID` | *(placeholder)* | Google OAuth 2.0 client ID for ID token verification |

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | No | Health check |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register with email and password |
| POST | `/api/v1/auth/login` | No | Login with email and password |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| POST | `/api/v1/auth/logout` | No | Invalidate refresh token |
| POST | `/api/v1/auth/google` | No | Login or register with Google ID token |
| POST | `/api/v1/auth/google/complete` | No | Complete Google sign-up (set handle) |
| GET | `/api/v1/auth/handle/available` | No | Check handle availability (`?h=<handle>`) |

### POKs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/poks` | JWT | List/search user's POKs (paginated) |
| GET | `/api/v1/poks/{id}` | JWT | Get POK by ID |
| POST | `/api/v1/poks` | JWT | Create new POK |
| PUT | `/api/v1/poks/{id}` | JWT | Update POK |
| DELETE | `/api/v1/poks/{id}` | JWT | Delete POK |

## Deployment

The backend is deployed on **[Railway](https://railway.app)** using the `Dockerfile` at `backend/Dockerfile`. Railway auto-deploys from the `main` branch.

- **Production URL:** `https://engineering-daybook-production.up.railway.app`
- **Database:** [Supabase](https://supabase.com) — managed PostgreSQL 15 + pgvector
- **Migrations:** Flyway runs automatically on startup
