# ClimaHub 🌍

> **Centralized Climate Research Data Platform for Universities and Environmental Science Labs**

ClimaHub is a full-stack MERN application that lets researchers upload, visualize, and collaboratively discuss open climate and environmental datasets. It features a modern, climate-science-themed UI, a local embedded MongoDB (no external database required to run), JWT-protected endpoints, interactive Recharts visualizations, and a real-time comment system.

[![GitHub repo](https://img.shields.io/badge/GitHub-Akshaya--dev25%2Fclimahub-2ea44f?logo=github)](https://github.com/Akshaya-dev25/climahub)

---

## ✨ Features

### Frontend (React + Vite)
- **Gradient Landing Hero** on the dashboard with live-calculated stats — total datasets, total observations, and contributor count pulled directly from the API.
- **Climate-Themed Design System** — deep forest green, ocean teal, sky blue, warm sand, and sunny amber palette with Inter font and smooth transitions.
- **Split Authentication Layout** — Login and Register pages feature a climate-gradient panel with research context alongside the form.
- **Dataset Cards** — Colored accent strips, weather icons, measured variable tags, and a soft hover-lift animation.
- **Interactive Dataset Detail Page**:
  - Toggle between **Gradient Area**, **Line Plot**, and **Bar Columns** charts (Recharts with SVG gradient fills).
  - Select X-Axis and toggle individual metrics/variables with color-coded pills.
  - **Summary Statistics Table** with color-coded Mean (teal), Min (blue), and Max (amber) badges.
  - Raw data preview (first 10 rows).
  - **Chat-style Discussion Thread** with researcher avatar initials.
- **CSV Upload Page** with drag-and-drop, filename auto-fill, and inline file preview.
- Loading skeletons and friendly empty states throughout.
- Fully **responsive** for mobile and tablet.

### Backend (Node.js + Express)
- **JWT Authentication** (`bcryptjs` password hashing, 30-day tokens).
- **CSV Ingestion Pipeline** — Multer receives the upload, `csv-parser` parses rows, all data stored in MongoDB.
- **Automated Statistics API** — computes mean, min, max, count, and sum for every numeric column without pre-processing.
- **Search** — case-insensitive regex query across title, description, and filename.
- **Comments System** — users can post discussion notes on any dataset.
- **Embedded Local MongoDB** via `mongodb-memory-server` with WiredTiger persistent storage — no MongoDB Atlas account or local installer needed.
- CORS enabled for cross-origin client requests.

---

## 🗂️ Project Structure

```text
climahub/
├── .gitignore           # Excludes node_modules, .env, server/data, dist
├── package.json         # Root convenience scripts (npm run server / client)
├── README.md
├── client/              # Vite + React frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx                  # Router setup with protected routes
│       ├── index.css                # Full design system (CSS variables, layout, components)
│       ├── main.jsx
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state, login/register/logout
│       ├── services/
│       │   └── api.js               # Axios instance with JWT interceptor
│       ├── components/
│       │   ├── Navbar.jsx           # Sticky navbar with blur, user badge, logout
│       │   └── ProtectedRoute.jsx   # Redirects unauthenticated users to /login
│       └── pages/
│           ├── Login.jsx            # Split layout with climate gradient panel
│           ├── Register.jsx         # Split layout with feature highlights
│           ├── Dashboard.jsx        # Hero + stat cards + dataset grid + search
│           ├── Upload.jsx           # Drag-and-drop CSV upload form
│           └── DatasetDetail.jsx    # Charts, stats table, raw preview, comments
└── server/              # Express + Mongoose backend
    ├── .env             # PORT, MONGO_URI, JWT_SECRET (not committed)
    ├── .gitignore
    ├── nodemon.json     # Ignores server/data from triggering restarts
    ├── package.json
    ├── server.js        # Express app entry point
    ├── sample-climate-data.csv
    ├── config/
    │   └── db.js        # Auto-starts embedded MongoDB, connects Mongoose
    ├── controllers/
    │   ├── authController.js     # register, login, getMe
    │   └── datasetController.js  # upload, list, getById, stats, comments
    ├── middleware/
    │   ├── authMiddleware.js     # JWT protect() guard
    │   ├── errorMiddleware.js    # 404 + global error handler
    │   └── uploadMiddleware.js   # Multer config (CSV to uploads/)
    ├── models/
    │   ├── User.js      # name, email, password (hashed)
    │   ├── Dataset.js   # title, description, fileName, parsedData[], uploadedBy
    │   └── Comment.js   # dataset ref, user ref, text, createdAt
    └── routes/
        ├── authRoutes.js      # /api/auth
        └── datasetRoutes.js   # /api/datasets
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios (with JWT interceptor) |
| **Charts** | Recharts (Area, Line, Bar) |
| **Icons** | Lucide React |
| **Styling** | Plain Vanilla CSS with CSS custom properties |
| **Typography** | Inter + JetBrains Mono (Google Fonts) |
| **Backend** | Node.js + Express 4 |
| **Database** | MongoDB (embedded via `mongodb-memory-server`) |
| **ODM** | Mongoose 8 |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` |
| **File Upload** | Multer |
| **CSV Parsing** | `csv-parser` |
| **Dev Server** | Nodemon |

---

## ⚙️ Environment Setup

The server uses an **embedded local MongoDB** — no Atlas or local MongoDB installation required. On first start it downloads the MongoDB binary and stores persistent data in `server/data/`.

Create `server/.env` with the following (do **not** commit this file):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/climahub
JWT_SECRET=your_strong_jwt_secret_here
```

> **Switching back to Atlas:** Replace `MONGO_URI` with your Atlas connection string. Make sure your current IP is whitelisted in Atlas → Network Access.

---

## 🚀 Running the Project

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/Akshaya-dev25/climahub.git
cd climahub
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Create the server environment file

```bash
# In server/
cp .env.example .env    # or create manually (see ⚙️ above)
```

### 4. Start the backend server

Run from the project **root**:
```bash
npm run server
```

Or from the `server/` folder:
```bash
npm run dev
```

The server will start on **http://localhost:5000**. On first run, `mongodb-memory-server` downloads the MongoDB binary (~654 MB) and saves it to a cache — subsequent starts take only a few seconds.

**Expected output:**
```text
> climahub-server@1.0.0 dev
> nodemon server.js

[nodemon] 3.1.14
[nodemon] starting `node server.js`
[ClimaHub Server] running in development mode on port 5000
[ClimaHub API URL] http://localhost:5000
[Local MongoDB] Starting embedded server with persistent data at: .../server/data
[Local MongoDB] Server active on port 27017 (database: climahub)
MongoDB connected: 127.0.0.1/climahub
```

### 5. Start the frontend client

Open a new terminal, from the project **root**:
```bash
npm run client
```

Or from the `client/` folder:
```bash
npm run dev
```

The client dev server starts on **http://localhost:5173**.

### 6. Open in browser

| Service | URL |
|---|---|
| **Frontend App** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:5000](http://localhost:5000) |

Register an account, upload `server/sample-climate-data.csv` as a test dataset, and explore the charts and statistics.

---

## 📡 REST API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Body / Notes |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Public | `{ email, password }` → returns JWT |
| `GET` | `/api/auth/me` | 🔒 JWT | Returns user profile |

### Datasets — `/api/datasets`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/datasets` | Public | List all datasets. Supports `?search=` |
| `POST` | `/api/datasets` | 🔒 JWT | Upload CSV (`multipart/form-data`: `file`, `title`, `description`) |
| `GET` | `/api/datasets/:id` | Public | Dataset detail + all parsed rows |
| `GET` | `/api/datasets/:id/stats` | Public | Auto-computed `mean`, `min`, `max`, `sum`, `count` per numeric column |
| `GET` | `/api/datasets/:id/comments` | Public | All comments for a dataset |
| `POST` | `/api/datasets/:id/comments` | 🔒 JWT | Post a comment `{ text }` |

---

## 📊 Sample Dataset

A sample climate CSV is included at `server/sample-climate-data.csv`:

```csv
station_id,city,country,date,temperature_c,humidity_pct,rainfall_mm,wind_speed_kmh,co2_ppm
ST-001,Zurich,Switzerland,2026-01-15,14.5,72.4,12.2,15.8,418.5
ST-002,Nairobi,Kenya,2026-01-15,26.8,58.1,0.0,18.2,416.9
...
```

Upload it from the Upload page to immediately see charts and statistics generated from real data.

---

## 🔒 Security Notes

- **Passwords** are hashed with `bcryptjs` (salt rounds: 10) before storage.
- **JWTs** are signed with `JWT_SECRET` and expire after 30 days.
- The `server/.env` file and `server/data/` folder are excluded from git via `.gitignore`.
- In production, restrict CORS origins and use environment secrets management.

---

## 📜 License

ISC — open for academic and research use.
