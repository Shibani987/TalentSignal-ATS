# Demo resumes

Use `Bad_Resume_ATS_Test.pdf` to verify low-quality ATS feedback. It is intentionally generic and should produce practical improvement suggestions around weak keywords, missing metrics, vague bullets, and limited project evidence.

## Suggested QA Pass

1. Sign in as the seeded applicant account and open a published job.
2. Submit `Bad_Resume_ATS_Test.pdf` as the resume attachment.
3. Confirm the applicant sees the submission complete without exposing the private file path.
4. Sign in as the seeded recruiter account and open the candidate detail view.
5. Confirm the analysis highlights weak keyword coverage, vague experience, and missing measurable impact.
6. Retry analysis from the recruiter view to verify the same resume remains available after upload.

## Expected Signal

This resume is meant to exercise the negative-feedback path, not the happy path
for a strong candidate. A healthy result should produce a low or moderate match
score and specific improvement guidance rather than failing extraction or
returning generic advice.

## Reviewer Notes

When using this file during demos, record the job title, final match score, and
top three recommendations. Those notes make it easier to compare deterministic
demo analysis with live provider output when AI credentials are enabled later.
