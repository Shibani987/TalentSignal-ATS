# AI-Powered Applicant Tracking System

TalentSignal ATS is a full-stack recruiting platform with separate recruiter and applicant workspaces, job publishing, resume uploads, AI-assisted analysis, candidate pipeline management, and email notifications.

## Stack

- Frontend: React, Vite, Material UI, React Router, TanStack React Query
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: bcrypt password hashing and JWT role-based authorization
- Uploads: Multer with private S3 storage when configured, local demo storage otherwise
- Resume extraction: PDF and DOCX text extraction
- AI: OpenAI or Gemini when configured, deterministic demo analysis otherwise
- Email: Nodemailer when SMTP is configured

## Prerequisites

- Node.js 20+
- MongoDB running locally, or a MongoDB Atlas URI
- Optional AWS S3 credentials, OpenAI key, and SMTP credentials

## Environment

Copy the examples and fill in values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The app remains locally testable without AWS, OpenAI, or SMTP. Missing credentials enable clearly labeled demo behavior:

- Resumes are stored under `server/uploads`
- Resume analysis uses skill matching against extracted text
- Email sends are skipped and reported in API responses

## Local Development

```bash
npm install
npm run seed
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000/api`

Demo accounts after seeding:

- Recruiter: `recruiter@example.com` / `Password123!`
- Applicant: `applicant@example.com` / `Password123!`

## Local Setup Notes

- Run commands from the repository root so npm workspace scripts can find both apps.
- Seed data depends on `MONGODB_URI`; start MongoDB or provide an Atlas URI before running `npm run seed`.
- Keep the server and client `.env` files local. The app intentionally falls back to demo storage, deterministic resume analysis, and skipped email delivery when optional service credentials are missing.
- If port `5173` or `5000` is already in use, stop the conflicting process or update the matching Vite/API environment setting before starting the app again.

## Local Health Check

Run the backend tests and frontend production build before pushing:

```bash
npm test
npm run build
```

The test suite uses an in-memory MongoDB instance, so it does not require a local database. The frontend build validates that the applicant and recruiter workspaces compile with the current API client and routing setup.

## Verification Matrix

- API smoke: `/api/health` reports service status and demo-mode flags
- Auth: registration, current-user lookup, malformed tokens, and role-based access
- Jobs: recruiter publishing plus public search/filter behavior
- AI analysis: schema validation for job matching and resume readiness responses
- Frontend: production build catches route, query, and component integration issues

## Tests

```bash
npm test
```

The backend test suite covers authorization, recruiter job publishing, and AI analysis schema validation.

## Deployment Notes

- Set a strong `JWT_SECRET`
- Set `FRONTEND_ORIGIN` to the deployed frontend origin
- Use MongoDB Atlas or a managed MongoDB instance
- Configure S3 with private objects only; the API returns short-lived signed URLs
- Configure `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_MODEL` for OpenAI analysis
- Or configure `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and `GEMINI_MODEL` for Gemini analysis
- Configure SMTP variables for status updates and interview invitations
- Run the frontend build with `npm run build --workspace client`
- Start the API with `npm start --workspace server`

## Release Checklist

- Confirm `JWT_SECRET`, `FRONTEND_ORIGIN`, and `MONGODB_URI` are set for the target environment
- Confirm resume storage is either configured with private S3 credentials or intentionally using demo local storage
- Confirm `AI_PROVIDER` and matching model credentials are set when live AI analysis is required
- Confirm SMTP settings are present when candidate status emails should be delivered
- Run backend tests and the frontend production build from a clean checkout

## Implemented Flows

- Recruiter and applicant registration/login
- Role-specific protected dashboards
- Recruiter company profile and applicant skill profile editing
- Recruiter job creation, publishing, archiving, and private job management
- Public job board with search and filters
- Applicant application submission with PDF/DOCX validation and duplicate prevention
- Private resume storage with S3/demo fallback
- Server-side PDF/DOCX resume text extraction
- AI analysis with schema validation, success/failure state, and recruiter retry
- Recruiter candidate ranking, detail review, Kanban-compatible status pipeline, status history
- Status update emails and interview invitations with failure isolation
