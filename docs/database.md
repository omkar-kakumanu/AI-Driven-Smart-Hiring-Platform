# Database Schema & Entity Documentation

## Database Overview
The application uses MySQL 8.0 with Flyway SQL migrations (`V1__init_recruitment_copilot.sql`).

## Table Relations
- `users` (id, email, password_hash, role_id, department) -> `roles` (id, name)
- `jobs` (id, title, department, required_skills JSON, min_experience_years, created_by) -> `users` (id)
- `candidates` (id, full_name, email, phone, location, total_experience_years, current_role)
- `resumes` (id, candidate_id, file_name, file_path, parsing_status, raw_text) -> `candidates` (id)
- `candidate_skills` (id, candidate_id, skill_name, proficiency_level) -> `candidates` (id)
- `candidate_job_matches` (id, candidate_id, job_id, overall_match_score, skill_score, pipeline_stage) -> `candidates`, `jobs`
- `skill_gaps` (id, candidate_id, job_id, missing_skills JSON, recommendations JSON) -> `candidates`, `jobs`
- `interviews` (id, candidate_id, job_id, overall_score, status) -> `candidates`, `jobs`
- `voice_screenings` (id, candidate_id, job_id, audio_file_url, transcript, clarity_score, overall_screening_score) -> `candidates`, `jobs`
- `ats_integrations` (id, provider_name, status, last_synced_at)
