# ClimaHub Backend API 🌍

**ClimaHub** is a centralized platform designed for universities and research institutions to store, visualize, collaborate on, and analyze climate datasets.

---

## 📁 Project Structure

```text
climahub/
├── .gitignore
├── README.md
└── server/
    ├── .env                     # Environment variables (MONGO_URI, JWT_SECRET, PORT)
    ├── .gitignore               # Server-specific gitignore
    ├── package.json             # Server dependencies & scripts
    ├── sample-climate-data.csv  # Sample CSV dataset for testing
    ├── server.js                # Express app entry point
    ├── config/
    │   └── db.js                # MongoDB connection handler
    ├── controllers/
    │   ├── authController.js    # Register, login, and profile controllers
    │   └── datasetController.js # Upload, search, stats, comments controllers
    ├── middleware/
    │   ├── authMiddleware.js    # JWT authorization protection
    │   ├── errorMiddleware.js   # 404 and global error handlers
    │   └── uploadMiddleware.js  # Multer setup for CSV uploads
    ├── models/
    │   ├── Comment.js           # Comment schema (dataset, user, text)
    │   ├── Dataset.js           # Dataset schema (title, description, parsedData, etc.)
    │   └── User.js              # User schema (name, email, password)
    └── routes/
        ├── authRoutes.js        # /api/auth routes
        └── datasetRoutes.js     # /api/datasets routes
```

---

## ⚙️ Configuration (.env)

Open [server/.env](file:///c:/Users/aksha/OneDrive/Desktop/climahub/server/.env) and replace the placeholder with your MongoDB connection string:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/climahub?retryWrites=true&w=majority
JWT_SECRET=climahub_super_secret_jwt_key_2026_secure
```

> **Note:** Make sure your IP address is whitelisted in MongoDB Atlas Network Access (or use `0.0.0.0/0` for development).

---

## 🚀 Commands to Run the Server

### 1. Navigate to the server folder
```bash
cd server
```

### 2. Start in development mode (with automatic restart via nodemon)
```bash
npm run dev
```

### 3. Or start in standard production mode
```bash
npm start
```

The API will be available at:
`http://localhost:5000`

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Login & receive JWT (`email`, `password`) |
| `GET` | `/api/auth/me` | Protected | Get authenticated user profile |

#### Register Request Body:
```json
{
  "name": "Dr. Jane Doe",
  "email": "jane@university.edu",
  "password": "securepassword123"
}
```

---

### 📊 Datasets (`/api/datasets`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/datasets` | **Protected** | Upload CSV file (`multipart/form-data`) with `file`, `title`, and optional `description` |
| `GET` | `/api/datasets` | Public | List all datasets. Supports `?search=` query |
| `GET` | `/api/datasets/:id` | Public | Get dataset details and full parsed rows |
| `GET` | `/api/datasets/:id/stats` | Public | Compute `mean`, `min`, `max`, and `count` for all numeric columns |
| `GET` | `/api/datasets/:id/comments` | Public | Retrieve all comments for the dataset |
| `POST` | `/api/datasets/:id/comments` | **Protected** | Post comment (`text`) on the dataset |

---

## 🧪 Testing with cURL

### 1. Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Smith\",\"email\":\"alice@univ.edu\",\"password\":\"secret123\"}"
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alice@univ.edu\",\"password\":\"secret123\"}"
```

### 3. Upload a CSV dataset (Protected)
```bash
curl -X POST http://localhost:5000/api/datasets \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -F "title=Global Weather Stations January 2026" \
  -F "description=Climate station data across global cities" \
  -F "file=@server/sample-climate-data.csv"
```

### 4. Search datasets
```bash
curl http://localhost:5000/api/datasets?search=Weather
```

### 5. Get numeric statistics
```bash
curl http://localhost:5000/api/datasets/<DATASET_ID>/stats
```

### 6. Add a comment (Protected)
```bash
curl -X POST http://localhost:5000/api/datasets/<DATASET_ID>/comments \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Great dataset! Noticeable temperature anomaly in station 006.\"}"
```
