# AI-Powered ATS Client

React and Vite frontend for the applicant and recruiter workspaces. It handles
authentication, protected routing, job discovery, applicant submissions,
candidate review, and recruiter pipeline management.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

Run these through npm workspaces from the repository root when working on the
full app:

```bash
npm run dev --workspace client
npm run build --workspace client
```

## Tech Stack

- React 18
- Vite 5
- Material UI
- React Router
- TanStack React Query
- Axios

## Project Structure

- `src/api/client.js` configures the API client and auth token handling.
- `src/router.jsx` defines public and protected routes.
- `src/state/AuthContext.jsx` manages the signed-in user session.
- `src/views` contains applicant and recruiter pages.
- `src/ui` contains shared route, layout, and state components.
- `src/index.css` defines global browser and typography defaults.
- `src/styles.css` contains app-level visual styling.
- `index.html` contains document metadata and the app mount point.

## Review Tips

Use both seeded roles when checking the client locally. The applicant workspace
exercises job discovery and resume submission, while the recruiter workspace
exercises profile setup, candidate review, status changes, and analysis retry.

## UI Smoke Checks

- Confirm unauthenticated users can browse public jobs and are redirected before applying.
- Confirm applicant users can update profile skills and submit a PDF or DOCX resume.
- Confirm recruiter users can create a job, review candidates, change statuses, and open resume links.
- Confirm loading, empty, and error states render clearly on slow or failed API responses.
