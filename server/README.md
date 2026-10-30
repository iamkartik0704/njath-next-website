# NJATH Backend (Express + MongoDB)

High-performance REST API backend for **NJATH (Not Just Another Treasure Hunt)** — an annual online cryptic treasure hunt platform.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT stored in HTTP-only cookies, bcrypt for password hashing, and **Google OAuth 2.0**
- **Validation**: Joi schema validation
- **Logging**: Pino & Morgan
- **Containerization**: Docker & Docker Compose with Nginx reverse proxy

---

## 📂 Directory Structure

```
server/
├── config/
│   └── default.mjs          # Central configuration with env fallbacks
├── controllers/
│   ├── auth.controller.js        # Auth, password management & Google OAuth
│   ├── participant.controller.js # Gameplay: questions, hints, answers, levels, leaderboard
│   └── question.controller.js    # Question bank management (Admin/Organizer)
├── middlewares/
│   ├── checkUser.js              # Role-based authorization & JWT verification
│   ├── validateBody.js           # Joi request body validation
│   └── validateLevelParam.js     # Query param validation & level progression check
├── models/
│   ├── user.model.js             # User base schema & discriminators (Participant, Organizer, Admin)
│   └── question.model.js         # Question & QuestionResponse schemas
├── routes/
│   ├── auth.route.js             # /api/auth routes (including Google OAuth)
│   ├── participant.route.js      # /api/participant routes
│   └── question.route.js         # /api/question routes
├── scripts/
│   └── seed.js                   # Database initialization & sample questions seeder
├── utils/
│   ├── auth.util.js              # Password hashing, JWT signing/verification, nodemailer
│   ├── connectDb.js              # Mongoose database connector
│   ├── logger.js                 # Pino logger configuration
│   ├── participant.util.js       # Scoring and level clearance utilities
│   └── question.util.js          # Question validation schemas
├── .env.example                  # Template environment variables
├── .env                          # Local environment variables
├── app.js                        # Express server entry point
├── Dockerfile                    # Container build configuration
├── docker-compose.yml            # Docker Compose setup with Nginx
└── package.json                  # Node dependencies and scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 2. Environment Variables
Create a `.env` file in the `server` directory (or edit the included default `.env`):

```bash
PORT=8080
BACKEND_URL=http://localhost:8080
MONGODB_URL=mongodb://127.0.0.1:27017/njath
JWT_SECRET=your_super_secret_jwt_key
APP_PASSWORD=your_gmail_app_password
SMTP_EMAIL=your_email@gmail.com
FRONTEND_URL=http://localhost:3000
COOKIE_SECURE=false
COOKIE_SAMESITE=lax

# Google OAuth 2.0 Credentials (Optional for local testing without Google)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
```

### 3. Setting up Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and navigate to **APIs & Services > Credentials**.
3. Configure the **OAuth Consent Screen** (User type: External).
4. Click **Create Credentials > OAuth client ID** (Application type: **Web application**).
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `http://localhost:8080`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:8080/api/auth/google/callback`
7. Copy the generated **Client ID** and **Client Secret** into your `server/.env`.

### 4. Install Dependencies
```bash
cd server
npm install
```

### 5. Seed the Database
Populates the database with initial Admin, Organizer, test Participants, and all 6 levels of questions (8 questions per level):
```bash
npm run seed
```
Default accounts created by seeder:
- **Admin**: `admin@njath.com` / `password123`
- **Organizer**: `organizer@njath.com` / `password123`
- **Participant 1**: `player1@njath.com` / `password123`
- **Participant 2**: `player2@njath.com` / `password123`

### 6. Start the Server
```bash
# Start production server
npm start

# Or start with nodemon for hot-reloading
npm run dev
```

Server runs on: `http://localhost:8080`

---

## 📡 API Reference

### Health Check
- `GET /` or `GET /health` — Check if API server is running.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Role / Auth |
|---|---|---|---|
| `POST` | `/api/auth/register-participant` | Register new participant | Public |
| `POST` | `/api/auth/register-organiser` | Register organizer | Admin only |
| `POST` | `/api/auth/login` | Login and obtain HTTP-only cookie | Public |
| `GET` | `/api/auth/login` | Verify if current session is active | Participant |
| `GET` | `/api/auth/logout` | Clear auth cookie | Public |
| `POST` | `/api/auth/forget-password` | Send password reset link to user's email | Public |
| `POST` | `/api/auth/reset-password/:token` | Reset password using reset token | Public |
| `GET` | `/api/auth/google` | Redirect to Google OAuth consent screen | Public |
| `GET` | `/api/auth/google/callback` | Google OAuth redirect callback (exchanges code, sets JWT cookie) | Public |
| `POST` | `/api/auth/google` | Verify Google ID token (for Google One Tap / Button) | Public |

### Gameplay & Participants (`/api/participant`)
*(Requires Participant session cookie)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/participant/` | Get current participant profile, points, remaining loans, and level unlock status |
| `GET` | `/api/participant/get-level-details?level=N` | Get list of questions and unlock/solved status for level `N` |
| `GET` | `/api/participant/question?level=N&order=M` | Fetch question content (deducts 10 points if unlocked for the first time) |
| `POST` | `/api/participant/check-answer` | Submit answer for question `(level, order, answer)` (+20 points on correct) |
| `POST` | `/api/participant/get-hint` | Reveal hint for question (-5 points penalty on first reveal) |
| `GET` | `/api/participant/get-loan?level=N&order=M&safe=0|1` | Open question on loan when points are insufficient (-20 loan penalty) |
| `GET` | `/api/participant/leaderboard` | Get real-time leaderboard rankings (sorted by points descending) |

### Question Management (`/api/question`)
*(Requires Organizer or Admin session cookie)*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/question/add-question` | Add a new question to a level |
| `GET` | `/api/question/all` | List all questions across all levels |

---

## 🔒 Game Rules & Mechanics Configuration
Game constants configured in `server/config/default.mjs`:
- `initialPoints`: 25 points on sign up
- `questionOpenPenelty`: 10 points deducted to unlock/open a question
- `hintPenalty`: 5 points deducted when viewing hint
- `rightAnswerBonous`: 20 points awarded on correct answer
- `minQuestionToclearLevel`: 6 questions required to unlock the next level
- `maxLevels`: 6 levels
- `maxQuestioninLevel`: 8 questions per level
- `allowedLoan`: 2 emergency loans per participant
- `loanPenalty`: 20 points
