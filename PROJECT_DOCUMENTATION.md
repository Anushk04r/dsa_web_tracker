# DSA Tracker - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Configuration](#environment-configuration)
7. [API Documentation](#api-documentation)
8. [Features](#features)
9. [Running the Project](#running-the-project)
10. [Troubleshooting](#troubleshooting)
11. [Development Guide](#development-guide)

---

## 📖 Project Overview

**DSA Tracker** is a comprehensive full-stack platform designed to help students track their Data Structures and Algorithms (DSA) learning progress. It combines problem tracking, progress monitoring, and an AI-powered mentor chatbot.

### Key Features

- ✅ **Problem Tracking**: Track problems from LeetCode, GeeksforGeeks, Codeforces, and other platforms
- 🤖 **AI Mentor Chatbot**: Get personalized DSA guidance using Groq LLM
- 📊 **Progress Dashboard**: Visualize your problem-solving statistics
- 🔍 **Metadata Extraction**: Automatically extract problem details from URLs
- 📝 **Notes Management**: Add and edit notes for each problem
- 🔐 **User Authentication**: Secure JWT-based authentication

### Project Goals

- Help students organize their DSA practice
- Provide AI-powered learning assistance
- Track progress and identify areas for improvement
- Simplify problem management with automated metadata extraction

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │ Auth     │  │ Dashboard│  │   Chat   │   │
│  │  Page    │  │ Pages    │  │  Page    │  │   Page   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  NextAuth.js (Credentials Provider)                         │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP Requests (JWT Bearer Token)
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              Backend API (Express + TypeScript)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Auth       │  │  Problems   │  │  Chatbot    │         │
│  │  Routes     │  │  Routes     │  │  Proxy      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         MongoDB (Mongoose ODM)                      │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │   │
│  │  │ User │  │Problem│ │Session│ │Topic │          │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP Requests
                       │
┌──────────────────────▼───────────────────────────────────────┐
│         Chatbot Service (FastAPI + Python)                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │         LangChain + Groq LLM                       │     │
│  │  (Context-aware DSA mentor with user progress)    │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### Request Flow Examples

#### Authentication Flow
1. User submits login form → Frontend
2. NextAuth calls `POST /auth/login` → Backend
3. Backend validates credentials → MongoDB
4. Backend returns JWT token → Frontend
5. NextAuth stores token in session
6. All subsequent requests include `Authorization: Bearer <token>`

#### Problem Tracking Flow
1. User pastes problem URL in dashboard → Frontend
2. Frontend calls `POST /problems/fetch-metadata` → Backend
3. Backend fetches HTML with axios → External platform
4. Backend parses with Cheerio → Extracts metadata
5. Frontend auto-fills form with extracted data
6. User submits → `POST /problems` → Backend saves to MongoDB

#### Chatbot Flow
1. User sends message → Frontend
2. Frontend calls `POST /chatbot` → Backend
3. Backend builds user progress summary from MongoDB
4. Backend calls `POST /chat` → Chatbot Service
5. Chatbot uses LangChain + Groq LLM with context
6. Response flows back to Frontend → Displayed to user

---

## 💻 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.6 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **NextAuth.js** | 4.24.13 | Authentication library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | Runtime environment |
| **Express** | 5.1.0 | Web framework |
| **TypeScript** | 5.9.3 | Type safety |
| **MongoDB** | - | NoSQL database |
| **Mongoose** | 9.0.0 | MongoDB ODM |
| **JWT** | 9.0.2 | Token-based authentication |
| **bcryptjs** | 3.0.3 | Password hashing |
| **Zod** | 4.1.13 | Schema validation |
| **Cheerio** | 1.1.2 | HTML parsing/scraping |
| **Axios** | 1.13.2 | HTTP client |

### Chatbot Service

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Runtime |
| **FastAPI** | Latest | Web framework |
| **Uvicorn** | Latest | ASGI server |
| **LangChain** | Latest | LLM framework |
| **langchain-groq** | Latest | Groq LLM integration |
| **Pydantic** | Latest | Data validation |

---

## 📁 Project Structure

```
dsatrackercursor/
│
├── backend/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── index.ts            # Entry point, server setup
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authentication middleware
│   │   ├── models/             # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Problem.ts
│   │   │   ├── Session.ts
│   │   │   └── Topic.ts
│   │   └── routes/             # API route handlers
│   │       ├── auth.ts         # Authentication routes
│   │       ├── problems.ts     # Problem management routes
│   │       └── chatbot.ts      # Chatbot proxy route
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                    # Environment variables
│
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx    # Dashboard page
│   │   │   ├── chat/
│   │   │   │   └── page.tsx    # Chat page
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── api/
│   │   │       └── auth/
│   │   │           └── [...nextauth]/
│   │   │               └── route.ts  # NextAuth handler
│   │   └── components/
│   │       ├── Navbar.tsx
│   │       └── Providers.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .env.local              # Frontend environment variables
│
├── chatbot-service/            # Python FastAPI Microservice
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Chatbot environment variables
│
└── README.md                   # Project overview
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (3.11 or higher) - [Download](https://www.python.org/)
- **MongoDB** - Either:
  - MongoDB Atlas (Cloud) - [Sign up](https://www.mongodb.com/cloud/atlas) (Recommended)
  - MongoDB Community Edition (Local) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Comes with Node.js
- **pip** - Comes with Python

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd dsatrackercursor
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4. Install Chatbot Service Dependencies

```bash
cd ../chatbot-service
pip install -r requirements.txt
```

#### 5. Configure Environment Variables

See [Environment Configuration](#environment-configuration) section below.

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)

Create `backend/.env` file with the following:

```env
# Server Configuration
PORT=4000

# MongoDB Connection
# Option 1: MongoDB Atlas (Cloud)
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dsaproject?retryWrites=true&w=majority

# Option 2: Local MongoDB
# MONGO_URI=mongodb://localhost:27017/dsa-tracker

# JWT Secret (Generate a random string)
JWT_SECRET=your-long-random-secret-here-minimum-32-characters

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Chatbot Service URL
CHATBOT_URL=http://localhost:8000/chat
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (`frontend/.env.local`)

Create `frontend/.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Backend API URL
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use the same command as JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Chatbot Service (`chatbot-service/.env`)

Create `chatbot-service/.env` file:

```env
# Groq API Configuration
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=mixtral-8x7b-32768
```

**Get Groq API Key:**
1. Visit [https://console.groq.com/](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into `.env`

---

## 📚 API Documentation

### Base URLs

- **Backend API**: `http://localhost:4000`
- **Chatbot Service**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000`

### Authentication

All protected endpoints require JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

### Backend API Endpoints

#### Health Check

**GET** `/health`

Check if the backend service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "backend-api"
}
```

---

#### Authentication Routes

##### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `400` - Invalid data (validation error)
- `409` - Email already registered
- `500` - Internal server error

---

##### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400` - Invalid data
- `401` - Invalid credentials
- `500` - Internal server error

---

##### Get Current User

**GET** `/auth/me`

Get authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `401` - Not authenticated
- `404` - User not found

---

#### Problem Routes

##### Create Problem

**POST** `/problems`

Create a new problem entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Two Sum",
  "link": "https://leetcode.com/problems/two-sum/",
  "source": "leetcode",
  "difficulty": "easy",
  "tags": ["array", "hash-table"],
  "status": "solved",
  "notes": "Used hash map approach"
}
```

**Response (201 Created):**
```json
{
  "_id": "problem_id",
  "title": "Two Sum",
  "link": "https://leetcode.com/problems/two-sum/",
  "source": "leetcode",
  "difficulty": "easy",
  "tags": ["array", "hash-table"],
  "status": "solved",
  "notes": "Used hash map approach",
  "user": "user_id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

##### Get All Problems

**GET** `/problems`

Get all problems for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "_id": "problem_id",
    "title": "Two Sum",
    "link": "https://leetcode.com/problems/two-sum/",
    "source": "leetcode",
    "difficulty": "easy",
    "status": "solved",
    "user": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

##### Fetch Problem Metadata

**POST** `/problems/fetch-metadata`

Extract problem metadata from a URL (LeetCode, GeeksforGeeks, etc.).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "url": "https://leetcode.com/problems/two-sum/"
}
```

**Response (200 OK):**
```json
{
  "title": "Two Sum",
  "difficulty": "easy",
  "tags": ["array"],
  "source": "leetcode"
}
```

**Supported Platforms:**
- LeetCode (`leetcode.com`)
- GeeksforGeeks (`geeksforgeeks.org`)
- Others (basic extraction)

---

##### Update Problem Notes

**PATCH** `/problems/:id`

Update notes for a specific problem.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "notes": "Updated solution notes"
}
```

**Response (200 OK):**
```json
{
  "_id": "problem_id",
  "title": "Two Sum",
  "notes": "Updated solution notes",
  ...
}
```

---

#### Chatbot Routes

##### Chat with AI Mentor

**POST** `/chatbot`

Send a message to the AI mentor chatbot.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Explain binary search algorithm"
}
```

**Response (200 OK):**
```json
{
  "reply": "Binary search is a divide and conquer algorithm..."
}
```

**Note:** The backend automatically includes user's DSA progress summary as context for the AI.

---

### Chatbot Service Endpoints

#### Health Check

**GET** `/health`

Check if the chatbot service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "chatbot-service"
}
```

---

#### Chat

**POST** `/chat`

Process a chat message with the AI mentor.

**Request Body:**
```json
{
  "message": "Explain binary search",
  "user_summary": "User has solved 10 problems: 5 easy, 3 medium, 2 hard"
}
```

**Response (200 OK):**
```json
{
  "reply": "Binary search is a divide and conquer algorithm..."
}
```

---

## ✨ Features

### Problem Management

- ✅ Add problems manually or via URL
- ✅ Automatic metadata extraction from LeetCode, GeeksforGeeks URLs
- ✅ Track problem status (unsolved, attempted, solved, review)
- ✅ Add notes to problems
- ✅ Filter and sort problems
- ✅ Click problems to open in new tab

### Progress Tracking

- ✅ Dashboard with statistics
- ✅ Total problems count
- ✅ Solved problems count
- ✅ Recent problems list
- ✅ Problem difficulty distribution

### AI Mentor

- ✅ Context-aware responses based on user progress
- ✅ Beginner-friendly explanations
- ✅ Code debugging assistance
- ✅ DSA concept explanations
- ✅ Personalized learning guidance

### User Experience

- ✅ Clean white and green UI theme
- ✅ Responsive design
- ✅ Modal dialogs for notes
- ✅ Loading states
- ✅ Error handling and messages
- ✅ Secure authentication

---

## 🏃 Running the Project

### Start All Services

You need to run three services simultaneously. Open **three separate terminal windows**:

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:4000`

**Verify:** `GET http://localhost:4000/health`

---

#### Terminal 2: Chatbot Service

```bash
cd chatbot-service
python -m uvicorn main:app --reload --port 8000
```

Chatbot service will start on `http://localhost:8000`

**Verify:** `GET http://localhost:8000/health`

---

#### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:3000`

**Access:** Open `http://localhost:3000` in your browser

---

### Using PowerShell (Windows)

You can also start all services in separate PowerShell windows:

```powershell
# Backend
cd backend; npm run dev

# Chatbot Service (in new window)
cd chatbot-service; python -m uvicorn main:app --reload --port 8000

# Frontend (in new window)
cd frontend; npm run dev
```

---

### Quick Start Script (Optional)

Create `start-all.ps1` for Windows:

```powershell
# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Chatbot
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd chatbot-service; python -m uvicorn main:app --reload --port 8000"

# Frontend
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

Run with: `.\start-all.ps1`

---

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED` or `querySrv ENOTFOUND`

**Solutions:**
- ✅ Verify `MONGO_URI` in `backend/.env` is correct
- ✅ For MongoDB Atlas: Ensure your IP is allowlisted in Network Access
- ✅ Check username/password in connection string
- ✅ Ensure connection string includes `?retryWrites=true&w=majority`
- ✅ For local MongoDB: Ensure MongoDB service is running

**Test connection:**
```bash
mongosh "<your-mongo-uri>"
```

---

#### 2. Authentication Failed (MongoDB)

**Error:** `MongoServerError: bad auth : Authentication failed`

**Solutions:**
- ✅ Verify MongoDB username and password in `MONGO_URI`
- ✅ Check Database Access in MongoDB Atlas (user must exist)
- ✅ Ensure password doesn't contain special characters that need URL encoding
- ✅ Try creating a new database user in MongoDB Atlas

---

#### 3. Frontend Can't Connect to Backend

**Error:** `Failed to fetch` or network errors

**Solutions:**
- ✅ Verify backend is running on port 4000
- ✅ Check `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`
- ✅ Ensure CORS is configured correctly in backend
- ✅ Check browser console for detailed error messages

---

#### 4. Chatbot Service Not Responding

**Error:** `Failed to contact chatbot service`

**Solutions:**
- ✅ Verify chatbot service is running on port 8000
- ✅ Check `CHATBOT_URL` in `backend/.env`
- ✅ Verify `GROQ_API_KEY` is set in `chatbot-service/.env`
- ✅ Test chatbot health: `GET http://localhost:8000/health`

---

#### 5. Registration Fails

**Error:** "Email already registered" or validation errors

**Solutions:**
- ✅ Password must be at least 6 characters
- ✅ Email must be valid format
- ✅ Check if email is already in database
- ✅ Review backend console for detailed error messages

---

#### 6. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4000`

**Solutions:**
- ✅ Find and kill the process using the port:

```powershell
# Windows
netstat -ano | findstr :4000
taskkill /PID <pid> /F

# Or change port in .env
PORT=4001
```

---

#### 7. Python Dependencies Not Found

**Error:** `ModuleNotFoundError` when running chatbot service

**Solutions:**
```bash
cd chatbot-service
pip install -r requirements.txt

# If using virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

---

#### 8. TypeScript Compilation Errors

**Error:** Type errors in backend or frontend

**Solutions:**
- ✅ Ensure all dependencies are installed: `npm install`
- ✅ Check `tsconfig.json` configuration
- ✅ Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- ✅ Restart TypeScript server in your IDE

---

### Debugging Tips

1. **Check Console Logs**: Always check backend terminal for detailed error messages
2. **Browser DevTools**: Use Network tab to see API request/response details
3. **Health Checks**: Verify each service with their `/health` endpoints
4. **Environment Variables**: Double-check all `.env` files are configured correctly
5. **Database**: Verify MongoDB connection separately using `mongosh` or Atlas dashboard

---

## 👨‍💻 Development Guide

### Adding a New API Endpoint

1. Create route handler in `backend/src/routes/<route-name>.ts`
2. Import and register in `backend/src/index.ts`
3. Add validation schema using Zod
4. Update frontend to call the new endpoint

### Adding a New Frontend Page

1. Create page component in `frontend/src/app/<route-name>/page.tsx`
2. Add route to Navbar if needed
3. Implement authentication checks if required

### Database Schema Changes

1. Update model in `backend/src/models/<Model>.ts`
2. MongoDB will apply schema changes automatically
3. Consider migration scripts for production

### Chatbot Prompt Customization

Edit `chatbot-service/main.py` to modify the system prompt:

```python
system_prompt = (
    "You are a friendly DSA mentor..."
    # Customize here
)
```

---

## 📝 Additional Notes

### Database Models

All models use Mongoose with TypeScript interfaces. Key models:

- **User**: Email, name, passwordHash
- **Problem**: Title, link, source, difficulty, status, notes, user reference
- **Session**: Date, duration, problemsSolved, user reference
- **Topic**: Name, category, description (for future use)

### Security Considerations

- ✅ Passwords are hashed using bcryptjs (10 rounds)
- ✅ JWT tokens expire after 7 days
- ✅ CORS is configured to allow only frontend origin
- ✅ Input validation using Zod schemas
- ⚠️ For production: Use HTTPS, implement rate limiting, add request logging

### Performance Tips

- MongoDB indexes on `email` (User) and `user` (Problem) fields
- Consider pagination for large problem lists
- Cache chatbot responses if needed
- Use MongoDB connection pooling (default in Mongoose)

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📧 Support

For issues, questions, or contributions:

- Check the [Troubleshooting](#troubleshooting) section
- Review existing issues in the repository
- Create a new issue with detailed description

---

## 🎯 Future Enhancements

- [ ] Problem filtering and search
- [ ] Streak tracking
- [ ] Progress charts and analytics
- [ ] Export data (CSV, JSON)
- [ ] Social features (share progress)
- [ ] Mobile app version
- [ ] More platform scrapers (Codeforces, CodeChef)
- [ ] RAG (Retrieval Augmented Generation) for chatbot
- [ ] Code submission tracking
- [ ] Practice session timer

---

**Last Updated:** January 2024

**Project Status:** ✅ Fully Functional - Ready for Development and Deployment
