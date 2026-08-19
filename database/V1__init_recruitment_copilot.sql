-- AI Recruitment Copilot Migration V1

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_RECRUITER'), ('ROLE_HIRING_MANAGER') ON DUPLICATE KEY UPDATE name=name;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    department VARCHAR(100),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    min_salary DECIMAL(10, 2),
    max_salary DECIMAL(10, 2),
    description TEXT NOT NULL,
    required_skills JSON NOT NULL,
    preferred_skills JSON,
    min_experience_years INT NOT NULL,
    education_requirement VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS candidates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(30),
    location VARCHAR(100),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    current_role VARCHAR(100),
    total_experience_years INT DEFAULT 0,
    headline TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    raw_text LONGTEXT,
    parsing_status VARCHAR(50) DEFAULT 'PROCESSING',
    parsed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_category VARCHAR(50), -- TECHNICAL, SOFT, DOMAIN, TOOL
    proficiency_level VARCHAR(30), -- BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    years_of_experience INT DEFAULT 1,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_experiences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    company VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    responsibilities TEXT,
    technologies_used JSON,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_educations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    degree VARCHAR(100) NOT NULL,
    institution VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(100),
    graduation_year INT,
    gpa VARCHAR(20),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidate_job_matches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    overall_match_score DECIMAL(5,2) NOT NULL,
    skill_score DECIMAL(5,2) NOT NULL,
    experience_score DECIMAL(5,2) NOT NULL,
    education_score DECIMAL(5,2) NOT NULL,
    semantic_score DECIMAL(5,2) NOT NULL,
    strengths JSON,
    missing_requirements JSON,
    concerns JSON,
    pipeline_stage VARCHAR(50) DEFAULT 'APPLIED',
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_candidate_job (candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS skill_gaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    missing_skills JSON NOT NULL,
    matching_skills JSON NOT NULL,
    partially_matching_skills JSON,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    interview_type VARCHAR(50) DEFAULT 'AI_SIMULATION',
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    overall_score DECIMAL(5,2),
    summary TEXT,
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interview_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL, -- TECHNICAL, BEHAVIORAL, SITUATIONAL
    difficulty VARCHAR(30) NOT NULL, -- EASY, MEDIUM, HARD
    question TEXT NOT NULL,
    expected_key_points JSON,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS voice_screenings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    audio_file_url VARCHAR(500),
    transcript LONGTEXT,
    clarity_score DECIMAL(5,2),
    relevance_score DECIMAL(5,2),
    overall_screening_score DECIMAL(5,2),
    assessment_summary TEXT,
    screened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ats_integrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'CONNECTED',
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Demo Users
INSERT INTO users (full_name, email, password_hash, role_id, department)
VALUES
('Admin User', 'admin@copilot.com', '$2a$10$e8wFp1E0jQ7G8.N1Q.N1QeY9u8k8A7f1m6v8.g4z2.X5P1M5s7y.u', 1, 'Engineering'),
('Recruiter Sarah', 'recruiter@copilot.com', '$2a$10$e8wFp1E0jQ7G8.N1Q.N1QeY9u8k8A7f1m6v8.g4z2.X5P1M5s7y.u', 2, 'Talent Acquisition')
ON DUPLICATE KEY UPDATE email=email;
