# KVY TECH - Document Verification Workflow

## What I Built
This is a full-stack monorepo containing a complete, working prototype of the Document Verification Workflow. It includes:
- **Express + Prisma Backend:** Handles secure file uploads via Multer, stores document metadata, and exposes REST APIs for Sellers and Admins.
- **React + Vite Frontend:** A premium UI built with Tailwind CSS v4, featuring a Seller Dashboard (for uploading and polling status) and an Admin Dashboard (for reviewing inconclusive documents).
- **Simulated Async Verification Worker:** A standalone Node.js background process (`backend/src/worker.ts`) that polls the database for `PENDING` verifications and randomly assigns them `VERIFIED`, `REJECTED`, or `INCONCLUSIVE` statuses after a realistic delay (2-5 seconds).
- **PostgreSQL Database Integration:** Connected via Prisma ORM for robust state management.
- **S3 Upload Service:** The backend is configured to push uploaded documents securely to an AWS S3 bucket using the AWS SDK v3.

### Demo authentication (not production-grade)
The app uses a **demo login** flow for local and staging demos:
- **POST `/api/auth/login`** accepts `{ "email", "password" }`, checks the user exists in the database and that the password matches a single shared demo secret (`DEMO_AUTH_PASSWORD`, default `demo`), then returns a short-lived **signed access token** (HMAC) and user profile.
- **GET `/api/auth/me`** returns the current user when the client sends `Authorization: Bearer <token>`.
- Seller and admin API routes require a valid Bearer token with the matching **role** (`SELLER` vs `ADMIN`). The frontend stores the token in `sessionStorage` and attaches it on every API request.

This is **not** a replacement for production auth (OAuth2, password hashing, refresh tokens, CSRF strategy for cookies, etc.). It exists so you can walk through the product without spoofing headers manually.

### What is partially working / descoped:
- **Real-time Notifications:** WebSockets are descoped in favor of simple client-side polling (every 5-10 seconds) on the frontend.
- **S3 Fallback:** If S3 bucket credentials are not provided in the `.env`, the system safely falls back to returning a mocked S3 path so the rest of the workflow can still be tested locally without AWS credentials.

## What I'd Build Next (If I had 2 more hours)
1. **Presigned URL Uploads:** Instead of uploading files *through* the Express backend (which bottlenecks memory/bandwidth for large files), I would generate presigned S3 URLs on the backend and have the React frontend upload directly to S3.
2. **Proper Message Queue:** I would replace the naive `worker.ts` database polling loop with Redis + BullMQ for true durable job execution, retry logic, and exponential backoff.
3. **Admin Document Viewer:** I would add an S3 `GetObject` presigned URL endpoint so admins can securely click and view the actual uploaded PDF/Image in their browser before making a decision.
4. **End-to-End Tests:** I'd use Playwright to script a full automated flow: User uploads -> Worker marks Inconclusive -> Admin logs in -> Admin approves.

## How to Run It

### Prerequisites
- Node.js (v18+)
- A PostgreSQL Database (e.g., Supabase, Neon, or local Postgres)

### 1. Backend Setup
1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://your_postgres_url_here"

   # Demo auth (optional — defaults shown)
   DEMO_AUTH_PASSWORD="demo"
   # Use a long random string in any shared/staging environment:
   AUTH_SECRET="at-least-16-characters-long"

   # Optional AWS Keys for real uploads:
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your_access_key"
   AWS_SECRET_ACCESS_KEY="your_secret_key"
   AWS_S3_BUCKET_NAME="your_bucket"
   ```
3. Push the schema and seed the database:
   ```bash
   npx prisma db push
   npm run seed
   ```
4. Start the Express API server:
   ```bash
   npm run dev
   ```
5. **In a separate terminal**, start the mock background worker:
   ```bash
   cd backend
   npm run worker
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   npm install
   ```
2. (Optional) If the API is not on `http://localhost:3001`, create `frontend/.env`:
   ```env
   VITE_API_BASE_URL="http://localhost:3001/api"
   ```
   For a deployed API, set this to your public base URL including `/api`, with no trailing slash.
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

### Demo accounts (after `npm run seed`)
| Role   | Email                 | Password                          |
|--------|------------------------|-----------------------------------|
| Seller | `seller@example.com`   | `demo` (or your `DEMO_AUTH_PASSWORD`) |
| Admin  | `admin@example.com`    | same as above                     |

1. Open **Sign in** and log in as the seller or admin.
2. After login you are redirected to **Seller** or **Admin** portal based on role. Navigation only shows the portal that matches your role.
3. **Seller:** upload a document; status moves through automated verification.
4. **Worker terminal:** you will see attempts picked up and completed.
5. **Admin:** when a document is `INCONCLUSIVE`, sign in as admin and approve or reject from the queue.

### Production / shared hosting notes
- Set **`AUTH_SECRET`** to a long random value (minimum 16 characters). The server will refuse to mint tokens without it when `NODE_ENV=production`.
- Keep **`DEMO_AUTH_PASSWORD`** private; it is one shared password for all demo users.
- Configure CORS appropriately if the frontend and API are on different origins (narrow `origin` instead of open `*` if you add credentials later).
