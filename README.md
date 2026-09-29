# Robo 

RESTful backend service built with NestJS, TypeORM, and PostgreSQL 

---

## Features

- **Authentication & Security**: JWT Bearer authentication, passwords hashed with `bcrypt` (10 rounds), and role-based access control.
- **Users Management**: Full CRUD operations for user entities with UUID primary keys and soft-deletion.
- **Hardening & Protection**: Helmet headers, CORS allowlist, rate limiting via `@nestjs/throttler` (max 3 req/min on `/auth/*`), and a global exception filter enforcing consistent error envelopes (`{ statusCode, message, error }`).
- **Documentation & Testing**: Interactive Swagger UI at `/api/docs` with Bearer auth support and an automated Bruno API test collection.

---

## Tech Stack & Prerequisites

- **Node.js** LTS (v18+)
- **NestJS** 10.x
- **PostgreSQL 15+** (managed via DBngin or local service)
- **TypeORM**
- **Bruno** API Client
- **TablePlus** (database inspection)

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=robo_intern
JWT_SECRET=supersecretjwtkey_do_not_share_67
```
## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
``
2.  **Database setup**:

- Start PostgreSQL using DBngin or your local database service.
- Ensure the database robo_intern exists.
- Run TypeORM migrations (avoid using synchronize: true in production environments):
```bash
npm run typeorm migration:run
```

3. **Start the application**:
```bash
# Development watch mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

| Method | Route | Description | Auth Required | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register account with hashed password | No | Public |
| `POST` | `/auth/login` | Validate credentials, issue 15-min JWT | No (Rate Limited) | Public |
| `GET` | `/users/me` | Fetch authenticated profile from token | Yes | User / Admin |
| `GET` | `/users` | List users with pagination (`?page=&limit=`) | Yes | User / Admin |
| `GET` | `/users/:id` | Fetch user details by UUID | Yes | Owner / Admin |
| `PATCH` | `/users/:id` | Update profile fields | Yes | Owner Only |
| `DELETE` | `/users/:id` | Soft-delete user account (204 response) | Yes | Admin Only |

## Testing & Documentation
- Swagger UI: Access interactive documentation and try out requests at http://localhost:3000/api/docs.
- Bruno Test Suite:
  1. Import the collection into Bruno.
  2. Select the Local environment (baseUrl: http://localhost:3000).
  3. Execute POST /auth/login to automatically capture the JWT into the {{token}} variable.
  4. Run the Collection Runner to verify assertions across all test cases (2xx, 400, 401, 403, and 429 rate limit triggers).
