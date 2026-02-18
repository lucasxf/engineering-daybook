# Engineering Daybook - Backend

> Spring Boot 3 REST API for Engineering Daybook

## Tech Stack

- **Java 21** (with Virtual Threads)
- **Spring Boot 4.0**
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
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

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
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | ed | Database name |
| `DB_USER` | ed | Database user |
| `DB_PASSWORD` | ed | Database password |
| `SERVER_PORT` | 8080 | Server port |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |

*More endpoints will be added as development progresses.*
