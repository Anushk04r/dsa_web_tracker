# DSA Tracker with AI Chatbot (MERN + Next.js + LangChain)

## 1. Overview

This project is a **full‑stack DSA tracking platform** with an **AI DSA mentor**:

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS + NextAuth.
- **Backend API**: Node.js + Express + TypeScript + MongoDB (Mongoose).
- **AI Chatbot Microservice**: Python + FastAPI + LangChain + Groq LLM.

It helps students:

- Track **DSA topics**, **problems solved**, **practice sessions**, and **progress**.
- **Auto‑extract problem details** from platforms like LeetCode and GeeksforGeeks via HTML scraping.
- Chat with an **AI mentor** that explains DSA concepts and helps debug code, using the user’s progress context.

The architecture is deliberately split into:

- A **main MERN/Next.js app**.
- A **separate AI microservice** (FastAPI + LangChain), independently deployable.

---

## 2. High‑Level Architecture

### 2.1 Monorepo Structure

```text
dsatrackercursor/
  backend/          # Express + TypeScript + MongoDB API
  frontend/         # Next.js + NextAuth + Tailwind UI
  chatbot-service/  # FastAPI + LangChain + Groq LLM microservice
```

### 2.2 Component Diagram (Text)

```text
[Browser / Frontend (Next.js)]
   |  \
   |   \  (NextAuth credentials)
   |    \
   |     --> /api/auth/[...nextauth] -----+
   |                                      |
   v                                      v
[Backend API (Express + TS)] <------------+
   |         ^   ^    ^
   |         |   |    |
   |         |   |    +-- Models (User, Topic, Problem, Session)
   |         |   |
   |         |   +-- Problem scraping via axios + cheerio
   |         |
   |         +-- JWT auth (bcryptjs + jsonwebtoken)
   |
   +--> Chatbot proxy (/chatbot) --- axios ---> [Chatbot Service (FastAPI + LangChain)]
                                              |
                                              +--> Groq LLM (Mixtral / LLaMA-3) via langchain-groq
```

### 2.3 Request Flows (Summary)

- **Auth flow**
  - Frontend login → NextAuth credentials provider → `POST /auth/login` (backend) → returns JWT → stored in NextAuth JWT → attached to all authed API calls.
- **Problem scraping flow**
  - Frontend sends problem URL → `POST /problems/fetch-metadata` (backend) → backend fetches HTML with `axios` → parses with `cheerio` → returns title/difficulty/tags.
- **Chatbot flow**
  - Frontend `POST /chatbot` → backend:
    - Reads user problems/sessions from MongoDB.
    - Builds DSA progress summary string.
    - Calls FastAPI `/chat` with `{ message, user_summary }` using `axios`.
    - Returns `{ reply }` to frontend.
  - FastAPI uses **LangChain + Groq LLM** with a carefully crafted system prompt.

---

## 3. Tech Stack and Libraries (Exhaustive)

### 3.1 Frontend (`frontend/`)

- **Framework**: `next` (Next.js 16, App Router).
- **UI**:
  - `react`, `react-dom`
  - **Tailwind CSS** (`tailwindcss`, `@tailwindcss/postcss`)
- **Auth**:
  - `next-auth` – NextAuth.js, using **Credentials Provider**.
- **HTTP**:
  - `fetch` (built‑in) used for calling backend.
- **TypeScript & Tooling**:
  - `typescript`
  - `@types/node`, `@types/react`, `@types/react-dom`
  - `eslint`, `eslint-config-next`

### 3.2 Backend API (`backend/`)

- **Runtime & Framework**:
  - `express` – HTTP server and routing.
  - `cors` – CORS configuration (`FRONTEND_URL`).
  - `dotenv` – Load environment variables from `.env`.
- **Database**:
  - `mongoose` – MongoDB ODM, schema + model management.
- **Validation**:
  - `zod` – Request body validation and parsing.
- **Auth & Security**:
  - `bcryptjs` – Password hashing (`passwordHash` field).
  - `jsonwebtoken` – Sign/verify JWT access tokens.
- **HTTP Client**:
  - `axios` – Used to:
    - Call the chatbot microservice (`CHATBOT_URL`).
    - Fetch HTML from problem URLs (LeetCode / GfG).
- **HTML Parsing / Scraping**:
  - `cheerio` – jQuery‑like API to parse and query HTML.
- **Dev tooling**:
  - `typescript`
  - `ts-node-dev` – Development server with auto‑restart.
  - `@types/express`, `@types/node`, `@types/bcryptjs`, `@types/jsonwebtoken`, `@types/cookie-parser`.

### 3.3 Chatbot Microservice (`chatbot-service/`)

- **Web Framework**:
  - `fastapi` – Python web framework for building the microservice.
  - `uvicorn[standard]` – ASGI server to run FastAPI.
- **Config & Data Models**:
  - `pydantic` – Request/response models (`ChatRequest`, `ChatResponse`).
  - `python-dotenv` – Load `.env` (`GROQ_API_KEY`, `GROQ_MODEL`).
- **LangChain & LLMs**:
  - `langchain` – Core LangChain primitives.
  - `langchain-community` – Community integrations.
  - `langchain-groq` – Groq LLM integration (`ChatGroq`).
  - `langchain-core.messages` – `SystemMessage`, `HumanMessage` for chat history.

---

## 4. Data Models (Backend / MongoDB)

All models live under `backend/src/models`.

### 4.1 User (`User`)

Fields:

- `email: string` – unique, lowercased.
- `name?: string`
- `passwordHash: string` – hashed with `bcryptjs`.
- `createdAt: Date` – automatically generated via timestamps.

Used for:

- Email/password login.
- Linking problems and sessions to a specific user.

### 4.2 Topic (`Topic`)

Fields:

- `name: string` – e.g. “Arrays”, “Dynamic Programming”.
- `category?: string` – optional group, e.g. “Basics”.
- `description?: string`
- `totalProblems?: number` – optional count.

Used for:

- Grouping problems and understanding topic‑wise coverage.

### 4.3 Problem (`Problem`)

Types:

- `ProblemSource`: `"leetcode" | "gfg" | "codeforces" | "other"`.
- `ProblemDifficulty`: `"easy" | "medium" | "hard" | "unknown"`.
- `ProblemStatus`: `"unsolved" | "attempted" | "solved" | "review"`.

Fields:

- `user: ObjectId<User>` – owner.
- `topic?: ObjectId<Topic>` – optional associated topic.
- `title: string`
- `link?: string` – URL to the problem.
- `source: ProblemSource`
- `difficulty: ProblemDifficulty`
- `tags: string[]` – extracted or manually added tags.
- `status: ProblemStatus`
- `notes?: string`
- `solvedAt?: Date`

Used for:

- Listing problems per user.
- Computing solved counts and basic stats.
- Building the user summary for the chatbot.

### 4.4 Session (`Session`)

Fields:

- `user: ObjectId<User>`
- `date: Date` – date of practice session.
- `durationMinutes: number` – length of the session.
- `problemsSolved: number`
- `notes?: string`

Used for:

- Tracking practice frequency and volume.
- Providing extra context to the AI mentor.

---

## 5. Backend API (Express + TS)

Entry file: `backend/src/index.ts`

- Connects to MongoDB via `MONGO_URI` using `mongoose.connect`.
- Configures CORS:
  - `origin: process.env.FRONTEND_URL || "http://localhost:3000"`
  - `credentials: true`
- Parses JSON bodies: `express.json()`.
- Registers routes:
  - `/auth` → `src/routes/auth.ts`
  - `/problems` → `src/routes/problems.ts`
  - `/chatbot` → `src/routes/chatbot.ts`
- Health check:
  - `GET /health` → `{ status: "ok", service: "backend-api" }`

### 5.1 Auth Routes (`/auth`)

File: `backend/src/routes/auth.ts`

- **Validation** with `zod`:
  - `registerSchema`: `{ email, name?, password }`.
  - `loginSchema`: `{ email, password }`.

#### 5.1.1 `POST /auth/register`

- Validates input with `zod`.
- Checks if email is already registered.
- Hashes password with `bcrypt.hash(password, 10)`.
- Creates a new `User` document.
- Returns: `{ id, email, name }`.

#### 5.1.2 `POST /auth/login`

- Validates credentials.
- Looks up `User` by `email`.
- Compares password with `bcrypt.compare`.
- Signs JWT with `jsonwebtoken.sign`:
  - Payload: `{ userId: user.id }`.
  - Secret: `JWT_SECRET` (env).
  - Exp: `7d`.
- Returns:

```json
{
  "token": "<JWT>",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

#### 5.1.3 `GET /auth/me`

- Uses `requireAuth` middleware (see below).
- Finds user by `req.userId`.
- Returns `{ id, email, name }`.

### 5.2 Auth Middleware (`requireAuth`)

File: `backend/src/middleware/auth.ts`

- Extracts JWT from `Authorization: Bearer <token>`.
- Verifies with `JWT_SECRET`.
- If valid, attaches `userId` to request (`AuthRequest`).
- If missing/invalid, returns `401`.

### 5.3 Problems Routes (`/problems`)

File: `backend/src/routes/problems.ts`

#### 5.3.1 `POST /problems`

- Protected by `requireAuth`.
- Validates body using `zod`:
  - `title`, `link?`, `source`, `difficulty`, `tags?`, `status`, `notes?`.
- Creates a `Problem` document with `user: req.userId`.
- Returns full problem JSON.

#### 5.3.2 `GET /problems`

- Protected by `requireAuth`.
- Fetches all `Problem` documents for `user = req.userId`, sorted by `createdAt desc`.
- Used by the dashboard to display recent problems and total counts.

#### 5.3.3 `POST /problems/fetch-metadata`

- Protected by `requireAuth`.
- Body: `{ url: string }`.
- Flow:
  1. Use `axios.get(url)` to fetch the problem page HTML.
  2. Use `cheerio.load(html)` to parse.
  3. Determine the source via `new URL(url).hostname`:
     - If hostname includes `leetcode.com`:
       - `source = "leetcode"`.
       - Try to read problem title from `div[data-cy="question-title"]`.
       - Difficulty may be taken from `div[diff]` attribute.
     - If hostname includes `geeksforgeeks.org`:
       - `source = "gfg"`.
       - Title is taken from first `h1`.
     - Else: `source = "other"`, title falls back to `<title>`.
  4. Returns:

```json
{
  "title": "...",
  "difficulty": "easy | medium | hard | unknown",
  "tags": [],
  "source": "leetcode | gfg | codeforces | other"
}
```

> Note: Difficulty and tags extraction for each platform can be refined further by extending the selectors.

### 5.4 Chatbot Proxy (`/chatbot`)

File: `backend/src/routes/chatbot.ts`

#### 5.4.1 `POST /chatbot`

- Protected by `requireAuth`.
- Body: `{ message: string }` (validated via `zod`).
- Assembles **user DSA progress summary** via `buildUserSummary(userId)`:
  - Loads all `Problem` and `Session` docs for the user.
  - Computes:
    - Total problems solved.
    - Count by difficulty: `easy`, `medium`, `hard`.
    - Total practice sessions.
  - Returns a single summary string.
- Uses `axios.post(CHATBOT_URL)` with:

```json
{
  "message": "<user question>",
  "user_summary": "<computed summary>"
}
```

- `CHATBOT_URL` comes from env (default: `http://localhost:8000/chat`).
- Forwards the chatbot’s JSON response directly back to the frontend.

---

## 6. Chatbot Microservice (FastAPI + LangChain + Groq)

File: `chatbot-service/main.py`

### 6.1 Endpoints

- `GET /health` → `{ "status": "ok", "service": "chatbot-service" }`
- `POST /chat`
  - Request model `ChatRequest` (Pydantic):
    - `message: str`
    - `user_summary: str | None`
  - Response model `ChatResponse`:
    - `reply: str`

### 6.2 LLM Integration (Groq + LangChain)

- Loads environment:
  - `GROQ_API_KEY` – required.
  - `GROQ_MODEL` – optional, default `"mixtral-8x7b-32768"`.
- Creates LLM client:

```python
llm = ChatGroq(
    api_key=api_key,
    model=os.getenv("GROQ_MODEL", "mixtral-8x7b-32768"),
    temperature=0.4,
)
```

- Builds `system_prompt`:
  - Friendly, beginner‑focused DSA mentor.
  - Explains step‑by‑step and avoids heavy jargon.
  - Incorporates `user_summary` to adjust difficulty.
- Constructs messages:

```python
messages = [
    SystemMessage(content=system_prompt),
    HumanMessage(content=payload.message),
]
```

- Calls `llm.invoke(messages)` and returns `result.content` as `reply`.

If `GROQ_API_KEY` is missing, it returns a fallback message indicating misconfiguration instead of failing.

---

## 7. Frontend (Next.js + NextAuth + Tailwind)

### 7.1 Layout and Styling

File: `frontend/src/app/layout.tsx`

- Uses a global dark background:
  - `body` has `min-h-screen bg-slate-950 text-slate-50`.
- Wraps children in `SessionProvider` (NextAuth) so auth state is accessible across pages.
- Global CSS: `frontend/src/app/globals.css` (Tailwind setup).

### 7.2 Landing Page

File: `frontend/src/app/page.tsx`

- Simple hero section:
  - Title: “DSA Tracker with AI Mentor”.
  - Description of features.
  - Calls to action:
    - `Log in` → `/auth/login`
    - `Sign up` → `/auth/register`

### 7.3 Auth Pages

#### 7.3.1 NextAuth Route

File: `frontend/src/app/api/auth/[...nextauth]/route.ts`

- **Credentials provider**:
  - Accepts `email` and `password`.
  - Calls backend `POST /auth/login`.
  - If login succeeds, returns `user + backendToken` for JWT session.
- Session strategy: `"jwt"`.
- Callbacks:
  - `jwt` stores `backendToken`.
  - `session` exposes `backendToken` on `session`.

#### 7.3.2 Register Page

File: `frontend/src/app/auth/register/page.tsx`

- Client component.
- Submits `POST` request directly to backend `/auth/register` using `fetch`.
- On success, redirects to `/auth/login`.
- Displays error message on failure.

#### 7.3.3 Login Page

File: `frontend/src/app/auth/login/page.tsx`

- Client component.
- Uses `signIn("credentials", { redirect: false })`.
- On success, redirects to `/dashboard`.
- Displays errors when credentials are invalid.

### 7.4 Navbar

File: `frontend/src/components/Navbar.tsx`

- Client component with:
  - **Back button**: `router.back()` – returns to previous route.
  - **Brand text**: “DSA Tracker”.
  - **Navigation links**:
    - `/dashboard` – main stats page.
    - `/problems` – dedicated problems management page (you can extend this).
    - `/chat` – AI mentor page.
  - **Logout button**:
    - Calls `signOut({ callbackUrl: "/" })` to clear NextAuth session and return to landing.
- Uses `usePathname()` to highlight the active nav link.
- Styled with Tailwind, sticky at top with blurred background.

Used in:

- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/chat/page.tsx`

### 7.5 Dashboard Page

File: `frontend/src/app/dashboard/page.tsx`

- Uses `useSession` from NextAuth to get user + `backendToken`.
- On load (when authenticated):
  - Calls backend `GET /problems` with header:

```http
Authorization: Bearer <backendToken>
```

- Displays:
  - **Stat cards**:
    - Total problems.
    - Total solved problems.
  - **Recent problems list** (up to 10).
- Handles:
  - Loading state (`status === "loading"`).
  - Unauthenticated state with a friendly message.
- Wrapped in the global `Navbar`.

### 7.6 Chat Page (AI Mentor)

File: `frontend/src/app/chat/page.tsx`

- Uses `useSession` to get `backendToken`.
- Maintains local `messages` state:
  - `{ role: "user" | "assistant", content: string }`.
- On send:
  - Pushes user message to `messages`.
  - Calls backend `POST /chatbot` with `Authorization: Bearer <backendToken>`:

```json
{ "message": "<user message>" }
```

  - Appends assistant reply (`data.reply`) to `messages`.
- UI:
  - Chat bubble layout for user and assistant messages.
  - Helper text when there is no conversation yet.
  - Loading status text “AI is thinking…” when awaiting response.
- Also wrapped in `Navbar`.

---

## 8. Environment Variables

### 8.1 Backend (`backend/.env`)

```env
PORT=4000
MONGO_URI=your-mongodb-uri-here
JWT_SECRET=your-long-random-secret
FRONTEND_URL=http://localhost:3000
CHATBOT_URL=http://localhost:8000/chat
```

### 8.2 Chatbot Service (`chatbot-service/.env`)

```env
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=mixtral-8x7b-32768
```

### 8.3 Frontend (`frontend/.env.local`)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

## 9. Running the Project (All Servers)

> Assumes you are in the root folder: `dsatrackercursor/`.

### 9.1 Install Dependencies

Run once:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../chatbot-service
pip install -r requirements.txt
```

(On Windows, use PowerShell or Command Prompt; ensure Python 3 and Node.js are installed.)

### 9.2 Setup MongoDB and Environment Variables

**IMPORTANT**: Before starting the backend, you must:

1. **Create `backend/.env` file** (copy from template below or create manually):
   ```env
   PORT=4000
   MONGO_URI=your-mongodb-uri-here
   JWT_SECRET=your-long-random-secret-here
   FRONTEND_URL=http://localhost:3000
   CHATBOT_URL=http://localhost:8000/chat
   ```

2. **Choose ONE MongoDB option**:

   **Option A: MongoDB Atlas (Cloud - Recommended)**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account and cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string (format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dsa-tracker?retryWrites=true&w=majority`)
   - Replace `<username>` and `<password>` with your database user credentials
   - Paste into `MONGO_URI` in `backend/.env`

   **Option B: Local MongoDB**
   - Install MongoDB Community Edition from [mongodb.com/download](https://www.mongodb.com/try/download/community)
   - Start MongoDB service:
     - **Windows**: MongoDB should start automatically as a service, or run `mongod` in a terminal
     - **macOS**: `brew services start mongodb-community` (if installed via Homebrew)
     - **Linux**: `sudo systemctl start mongod` or `sudo service mongod start`
   - Verify it's running: `mongosh` or `mongo` should connect
   - Use `MONGO_URI=mongodb://localhost:27017/dsa-tracker` in `backend/.env`

3. **Generate JWT_SECRET**:
   ```bash
   # In Node.js/PowerShell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste into `JWT_SECRET` in `backend/.env`

**Error Fix**: If you see `MongooseServerSelectionError: connect ECONNREFUSED`, it means:
- MongoDB is not running (if using local), OR
- `MONGO_URI` is incorrect/missing in `backend/.env`
- Solution: Create `backend/.env` with correct `MONGO_URI` and ensure MongoDB is running

### 9.3 Start Backend API

```bash
cd backend
npm run dev
```

- Starts Express API on `http://localhost:4000`.
- Verifications:
  - `GET http://localhost:4000/health` → `{ "status": "ok", "service": "backend-api" }`.

### 9.4 Start Chatbot Microservice

```bash
cd chatbot-service
uvicorn main:app --reload --port 8000
```

- Starts FastAPI on `http://localhost:8000`.
- Verifications:
  - `GET http://localhost:8000/health` → `{ "status": "ok", "service": "chatbot-service" }`.
  - Ensure `GROQ_API_KEY` is set, otherwise `/chat` will return a configuration message.

### 9.5 Start Frontend (Next.js)

```bash
cd frontend
npm run dev
```

- Starts Next.js dev server on `http://localhost:3000`.
- Visit:
  - `/` – landing page.
  - `/auth/register` – create account.
  - `/auth/login` – log in and be redirected to `/dashboard`.
  - `/dashboard` – view stats.
  - `/chat` – talk to AI mentor (requires login and backend+chatbot running).

---

## 10. Example Flows in Detail

### 10.1 New User Registration

1. User visits `/auth/register` on the frontend.
2. Fills `name`, `email`, `password` and submits.
3. Frontend sends `POST` to `BACKEND_URL/auth/register`.
4. Backend validates via `zod`, hashes password with `bcryptjs`, creates `User` in MongoDB.
5. Frontend redirects to `/auth/login`.

### 10.2 Login and Session

1. User opens `/auth/login`.
2. On submit, NextAuth credentials provider calls backend `/auth/login`.
3. Backend verifies credentials via `bcrypt.compare`.
4. Backend returns `{ user, token }`.
5. NextAuth stores `backendToken` inside JWT and exposes it on `session`.
6. Any protected frontend page (e.g., `/dashboard`, `/chat`) reads `backendToken` from `useSession()` and attaches it as `Authorization: Bearer <backendToken>` for backend requests.

### 10.3 Adding a Problem with Metadata Extraction

1. User goes to the problems UI (you can build this around `/problems` and `/problems/fetch-metadata`).
2. Pastes a LeetCode or GfG URL.
3. Frontend calls `POST /problems/fetch-metadata` (authorized) with `{ url }`.
4. Backend fetches HTML with `axios`, parses with `cheerio`, detects platform and extracts:
   - Title.
   - Difficulty (where available).
   - Tags array (currently placeholder, extendable).
5. Frontend receives metadata and auto‑fills a form.
6. User can adjust fields and submit `POST /problems` to create a `Problem` document.

### 10.4 Chatting with the AI Mentor

1. User navigates to `/chat` (after login).
2. Types a question (or pastes code) and presses send.
3. Frontend:
   - Shows user message in local state.
   - Sends `POST /chatbot` with `{ message }` and `Authorization: Bearer <backendToken>`.
4. Backend:
   - Validates body.
   - Uses `req.userId` from JWT.
   - Builds `user_summary` from `Problem` and `Session` models (solved counts, difficulty distribution, session counts).
   - Calls chatbot microservice `/chat` with `axios`.
5. Chatbot service:
   - Loads `GROQ_API_KEY` and model.
   - Builds a system prompt injecting `user_summary`.
   - Feeds messages into `ChatGroq` LLM via LangChain.
   - Returns a tailored, beginner‑friendly explanation.
6. Backend returns `{ reply }` to frontend.
7. Frontend appends assistant reply to the chat UI.

---

## 11. Extensibility Ideas

- Add a full **problems page** with:
  - Filters by topic, difficulty, status.
  - Editing notes and `solvedAt`.
- Implement **streak tracking**:
  - Compute streaks based on `Session.date` or `Problem.solvedAt`.
  - Show longest streak & current streak on dashboard.
- Add **RAG / document retrieval** in chatbot:
  - Index common DSA notes or user’s own notes.
  - Use LangChain retrievers to ground responses.
- Support more **platform scrapers**:
  - Codeforces, CodeChef, AtCoder, etc.

This repository is intentionally structured to look like a production‑grade, **microservice‑aware**, full‑stack project, suitable for portfolio and learning. Feel free to customize UI, flows, and LLM provider as needed.

---

## 12. Recent Updates & Changes

### UI/UX Improvements (Latest)
- **Color Scheme**: Changed to clean **white and green** color combination throughout the entire website
  - White backgrounds with green accents (`#10b981` / `green-500`)
  - Improved readability and modern aesthetic
- **Simplified Problem Addition**: 
  - Removed `status`, `source`, and `notes` fields from add problem form
  - Streamlined form focuses on essential fields: URL, Title, and Difficulty
  - Problems default to "unsolved" status and source is auto-detected from URL
- **Notes Feature**: 
  - Added "Notes" button for each problem in the dashboard list
  - Clicking opens a modal to add/edit notes for that specific problem
  - Notes are saved via `PATCH /problems/:id` endpoint
- **Clickable Problems**: 
  - Problems in the dashboard list are now clickable
  - Clicking a problem opens the actual problem URL in a new tab
  - Hover effects indicate interactivity

### Backend Enhancements
- **Problem Notes Update**: Added `PATCH /problems/:id` endpoint to update problem notes
- **Improved Scraping**: Enhanced metadata extraction with regex-based title extraction and better error handling

### Frontend Components
- **Updated Theme**: All pages (landing, auth, dashboard, chat) now use consistent white/green theme
- **Better UX**: Improved modals, buttons, and form styling with green accents
- **Responsive Design**: Maintained responsive layout across all screen sizes


