# Security & RBAC Specification

## Role-Based Access Control (RBAC)
- `ROLE_ADMIN`: System configuration, user management, audit logs, model tuning.
- `ROLE_RECRUITER`: Job creation, resume uploads, candidate matching, pipeline stage updates, voice screenings.
- `ROLE_HIRING_MANAGER`: Candidate review, interview question view, feedback submission.

## Security Practices
- JWT Access Tokens (HS512 signed) with configurable expiration.
- Password hashing with BCrypt (strength 10).
- Input validation via Jakarta Validation (`@Valid`, `@NotNull`).
- CORS origin restriction.
- SQL injection protection via Spring Data JPA parameterized queries.
