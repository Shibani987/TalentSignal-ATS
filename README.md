# AI-Powered Applicant Tracking System

TalentSignal ATS is a full-stack recruiting platform with separate recruiter and applicant workspaces, job publishing, resume uploads, AI-assisted analysis, candidate pipeline management, and email notifications.

## Stack

- Frontend: React, Vite, Material UI, React Router, TanStack React Query
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: bcrypt password hashing and JWT role-based authorization
- Uploads: Multer with private S3 storage when configured, local demo storage otherwise
- Resume extraction: PDF and DOCX text extraction
- AI: OpenAI when configured, deterministic demo analysis otherwise
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
- Configure `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_MODEL`
- Configure SMTP variables for status updates and interview invitations
- Run the frontend build with `npm run build --workspace client`
- Start the API with `npm start --workspace server`

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
