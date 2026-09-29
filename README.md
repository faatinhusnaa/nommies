# 🍮 nommies (nomnom empire)

A chaotic-good full-stack financial simulator & treat laundering syndicate built because budgeting spreadsheets are depressing. 

Instead of index funds, you manage snack capital, calculate sugar deficit runways, hoard pastry reserves, and fight for dominance on the real-time syndicate wire.

---

## ✨ Features

- **Mandatory Snack Onboarding**: You can't just sneak into the dashboard. New accounts get forced through a 5-question snack runway quiz to calibrate their actual risk tolerance (`Conservative`, `Moderate`, `Growth`, or full unhinged `Aggressive`).
- **Treat Portfolio Donut**: Live SVG breakdown showing your pastry allocations vs. chamomile tea downside hedging.
- **Compound Hoard Simulator**: Reactive math engine simulating what happens when you diamond-hand your boba capital instead of impulse buying at 2 AM.
- **The Perk Ladder**:
  - `50 pts` → 👑 **VIP Halo Frame** (pulsing border for your avatar)
  - `100 pts` → 🌈 **Chroma Nametag** (animated rainbow CSS gradient glow)
  - `200 pts` → ✨ **Snack Overlord Aura** (particle glow + diamond syndicate badge)
  - `500 pts` → 🛸 **Moon Dairy Tycoon** (floating neon crown + 1% deed to lunar milk lands)
- **NomNom Wire**: Real-time websocket feed with upvotes, downvotes, and threaded replies so executives can roast each other's snack portfolios.
- **Admin Command Center**: Search users, promote/demote roles, inspect database state, or reset points when someone gets too cocky.

---

## 🛠️ Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT + Passport, Multer, Socket.io, Swagger
- **Frontend**: Vite, React, TypeScript, Tailwind CSS v4
- **Tooling**: Bruno, ngrok, Docker/local Postgres

---

## 🚀 Setup

### 1. Backend

Pop into the backend folder, install stuff, and setup your env:

```bash
cd backend # or root
npm install
```

Create a `.env` in the root:

```env
PORT=8080
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=nomnom_db
JWT_SECRET=super_secret_nomnom_key
```

Fire it up:

```bash
npm run start:dev
```

- API lives at `http://localhost:8080`
- Swagger UI docs live at `http://localhost:8080/api`

---

### 2. Frontend

Open another terminal tab:

```bash
cd nomnom-client
npm install
npm run dev
```

Dashboard boots up at `http://localhost:5173`.

---

## 📡 Endpoints

| Method | Route | Auth | What it does |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Create tycoon account |
| `POST` | `/auth/login` | Public | Grab JWT token |
| `POST` | `/auth/reset-password` | Public | Reset forgotten passcodes |
| `GET` | `/auth/quiz` | Public | Fetch risk quiz questions |
| `GET` | `/users/me` | User | Get current profile & points |
| `PATCH` | `/users/me` | User | Update display credentials / password |
| `PATCH` | `/users/me/avatar` | User | Upload avatar image (multipart) |
| `GET` | `/users` | Admin | Paginated list of registered accounts |
| `POST` | `/users` | Admin | Create user directly |
| `GET` | `/users/:id` | User/Admin | Inspect specific user account |
| `PATCH` | `/users/:id` | Admin | Update user role or profile details |
| `DELETE` | `/users/:id` | Admin | Permanently purge an account |
| `PATCH` | `/users/:id/reset-points` | Admin | Wipe or set treat points |
| `GET` | `/portfolio/recommended` | User | Fetch model portfolio allocation weights |
| `GET` | `/posts` | Public/User | Fetch all live dispatches |
| `POST` | `/posts` | User | Drop a new wire bulletin |
| `GET` | `/posts/:id` | User | Inspect a specific dispatch |
| `POST` | `/posts/:id/vote` | User | Upvote or downvote a dispatch |
| `POST` | `/posts/:id/replies` | User | Drop a reply in the thread |
| `DELETE` | `/posts/:id` | User/Admin | Remove a wire bulletin |

---

## 📄 License

MIT. HAPPY NOMMIES GUYS!!!!!!!!!!!!!!
