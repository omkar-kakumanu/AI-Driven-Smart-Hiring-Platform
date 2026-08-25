# API Documentation - AI Recruitment Copilot

Interactive Swagger / OpenAPI UI is accessible at: `http://localhost:8080/swagger-ui.html`

## Core Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate recruiter/admin and return JWT token.
- `POST /api/auth/register`: Register new recruitment user.
- `POST /api/auth/refresh`: Refresh JWT access token.

### Jobs (`/api/jobs`)
- `GET /api/jobs`: List all active job postings.
- `POST /api/jobs`: Create a new job requirement profile.
- `GET /api/jobs/{id}`: Fetch job details & required skills.
- `PUT /api/jobs/{id}`: Update job requirements.
- `DELETE /api/jobs/{id}`: Archive/delete job.

### Candidates (`/api/candidates`)
- `GET /api/candidates`: Retrieve candidate directory.
- `POST /api/candidates`: Create structured candidate profile.
- `GET /api/candidates/{id}`: View candidate profile, skills, education, and match scores.

### Resume & Parsing (`/api/resumes` & Python AI `/api/ai/parse-resume`)
- `POST /api/resumes/upload`: Upload PDF or DOCX resume.
- `POST /api/ai/parse-resume`: Multipart upload endpoint performing NLP entity extraction (Name, Email, Phone, Skills, Experience, Education).

### Matching & Skill Gap (`/api/matching` & Python AI `/api/ai/match`)
- `POST /api/ai/match`: Compute multi-factor weighted match score (Required skills 30%, Experience 20%, Education 10%, Semantic similarity 40%).
- `POST /api/ai/skill-gap`: Generate skill difference report and suggested learning paths.

### Interview & Voice Screening (`/api/interviews` & `/api/ai/analyze-voice`)
- `POST /api/ai/generate-questions`: Generate technical, behavioral, and situational questions.
- `POST /api/ai/analyze-voice`: Process audio screening transcript and generate preliminary communication assessment.
