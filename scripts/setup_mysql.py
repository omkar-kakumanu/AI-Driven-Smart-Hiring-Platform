import os
import json
import pymysql

DB_HOST = os.getenv("MYSQL_HOST", "localhost")
DB_PORT = int(os.getenv("MYSQL_PORT", 3306))
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASS = os.getenv("MYSQL_PASSWORD", "Omkar1707mysql")
DB_NAME = os.getenv("MYSQL_DB", "recruitment_copilot")

INITIAL_JOBS = [
    {
        "id": 1,
        "title": "Senior Machine Learning Engineer",
        "department": "AI & Data Science",
        "location": "Bengaluru, Karnataka (Hybrid)",
        "employment_type": "Full-time",
        "min_salary": 2400000.0,
        "max_salary": 3800000.0,
        "description": "Architect scalable ML pipelines, LLM fine-tuning, and model deployment in cloud production environments.",
        "required_skills": ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes", "AWS SageMaker", "SQL"],
        "preferred_skills": ["NLP", "Transformers", "Docker", "FastAPI"],
        "min_experience_years": 5,
        "education_requirement": "B.Tech / M.Tech in Computer Science or Data Science",
        "status": "ACTIVE"
    },
    {
        "id": 2,
        "title": "Frontend React & UI Engineer",
        "department": "Frontend Engineering",
        "location": "Hyderabad, Telangana (Hybrid / HITEC City)",
        "employment_type": "Full-time",
        "min_salary": 1400000.0,
        "max_salary": 2200000.0,
        "description": "Build responsive, high-performance web applications using modern React, TypeScript, and state management.",
        "required_skills": ["React", "TypeScript", "JavaScript", "HTML5", "Tailwind CSS", "Redux", "REST APIs"],
        "preferred_skills": ["Next.js", "GraphQL", "Jest", "Webpack"],
        "min_experience_years": 3,
        "education_requirement": "B.Tech / B.E. in Computer Science or Information Technology",
        "status": "ACTIVE"
    },
    {
        "id": 3,
        "title": "Cloud DevOps & Security Specialist",
        "department": "Platform & Infrastructure",
        "location": "Pune, Maharashtra (Hybrid / Hinjawadi)",
        "employment_type": "Full-time",
        "min_salary": 1800000.0,
        "max_salary": 2800000.0,
        "description": "Automate Kubernetes clusters, CI/CD pipelines, and cloud infrastructure monitoring across AWS.",
        "required_skills": ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Linux", "Python"],
        "preferred_skills": ["Ansible", "Prometheus", "Grafana", "Bash"],
        "min_experience_years": 4,
        "education_requirement": "B.Tech / B.E. in Computer Science or Cloud Certification",
        "status": "ACTIVE"
    },
    {
        "id": 4,
        "title": "Backend Java & Systems Architect",
        "department": "Core Engineering",
        "location": "Gurugram, Delhi NCR (Hybrid / Cyber City)",
        "employment_type": "Full-time",
        "min_salary": 2200000.0,
        "max_salary": 3500000.0,
        "description": "Design enterprise Java Spring Boot microservices, high-throughput database systems, and distributed caches.",
        "required_skills": ["Java", "Spring Boot", "PostgreSQL", "Microservices", "Redis", "Docker", "SQL"],
        "preferred_skills": ["Kafka", "gRPC", "Kubernetes", "Elasticsearch"],
        "min_experience_years": 5,
        "education_requirement": "B.Tech in Computer Science or Software Engineering",
        "status": "ACTIVE"
    },
    {
        "id": 5,
        "title": "Full Stack Development (React/Node)",
        "department": "Product Engineering",
        "location": "Bengaluru, Karnataka (Hybrid / Electronic City)",
        "employment_type": "Full-time",
        "min_salary": 1600000.0,
        "max_salary": 2600000.0,
        "description": "Build enterprise full-stack platforms with modern React 19, Node.js, distributed databases, and cloud services.",
        "required_skills": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "REST APIs"],
        "preferred_skills": ["Next.js", "Redis", "GraphQL", "Tailwind CSS"],
        "min_experience_years": 4,
        "education_requirement": "B.Tech / M.Tech in Computer Science or equivalent",
        "status": "ACTIVE"
    }
]

INITIAL_CANDIDATES = [
    {
        "id": 1,
        "full_name": "Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "phone": "+1 (555) 019-2831",
        "location": "Bengaluru, Karnataka",
        "linkedin_url": "https://linkedin.com/in/sarah-johnson-ml",
        "github_url": "https://github.com/sarah-j-ai",
        "portfolio_url": "https://sarahjohnson.dev",
        "current_role": "Senior Machine Learning Engineer",
        "total_experience_years": 5,
        "headline": "Senior ML Engineer with 5 years experience in Python, TensorFlow, PyTorch, MLOps",
        "avatar_url": "",
        "skills": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Data Analysis", "AWS SageMaker", "Docker"],
        "education": {"degree": "MS Computer Science", "institution": "Stanford University", "year": 2021},
        "experience": [
            {"company": "Apex AI Labs", "role": "Senior ML Engineer", "years": 3, "highlights": "Engineered scalable LLM pipelines and automated feature stores."}
        ]
    },
    {
        "id": 2,
        "full_name": "Alex Chen",
        "email": "alex.chen@example.com",
        "phone": "+1 (555) 482-9910",
        "location": "Hyderabad, Telangana",
        "linkedin_url": "https://linkedin.com/in/alexchen-fe",
        "github_url": "https://github.com/alexchen-dev",
        "portfolio_url": "https://alexchen.design",
        "current_role": "Frontend React Developer",
        "total_experience_years": 4,
        "headline": "Frontend Engineer specialized in React, TypeScript, Redux, and modern UI",
        "avatar_url": "",
        "skills": ["React", "TypeScript", "JavaScript", "Redux", "HTML5", "Tailwind CSS", "REST APIs"],
        "education": {"degree": "BS Computer Science", "institution": "UT Austin", "year": 2022},
        "experience": [
            {"company": "PixelCraft Systems", "role": "Frontend Engineer", "years": 4, "highlights": "Built low-latency real-time dashboards in React."}
        ]
    },
    {
        "id": 3,
        "full_name": "Emily Rodriguez",
        "email": "emily.rodriguez@example.com",
        "phone": "+1 (555) 731-4029",
        "location": "Pune, Maharashtra",
        "linkedin_url": "https://linkedin.com/in/emily-rodriguez-devops",
        "github_url": "https://github.com/erodriguez-cloud",
        "portfolio_url": "",
        "current_role": "DevOps & Security Specialist",
        "total_experience_years": 6,
        "headline": "DevOps Architect experienced in Kubernetes, Docker, AWS, Terraform",
        "avatar_url": "",
        "skills": ["Kubernetes", "Docker", "AWS", "Terraform", "CI/CD", "Linux", "Python", "Cybersecurity"],
        "education": {"degree": "BS Computer Science", "institution": "University of Washington", "year": 2020},
        "experience": [
            {"company": "CloudNative Security", "role": "Lead DevOps Engineer", "years": 6, "highlights": "Managed multi-region AWS EKS infrastructure with zero downtime."}
        ]
    },
    {
        "id": 4,
        "full_name": "Marcus Vance",
        "email": "marcus.vance@example.com",
        "phone": "+1 (555) 839-2011",
        "location": "Gurugram, Delhi NCR",
        "linkedin_url": "https://linkedin.com/in/marcusvance-java",
        "github_url": "https://github.com/marcusvance",
        "portfolio_url": "",
        "current_role": "Backend Systems Architect",
        "total_experience_years": 5,
        "headline": "Enterprise Java Architect specializing in Spring Boot and Microservices",
        "avatar_url": "",
        "skills": ["Java", "Spring Boot", "PostgreSQL", "Microservices", "Redis", "Docker", "SQL", "REST APIs"],
        "education": {"degree": "BS Software Engineering", "institution": "Columbia University", "year": 2021},
        "experience": [
            {"company": "Fintech Core Global", "role": "Backend Architect", "years": 5, "highlights": "Built distributed payment reconciliation engine processing $10M/day."}
        ]
    },
    {
        "id": 5,
        "full_name": "Elena Rostova",
        "email": "elena.rostova@example.com",
        "phone": "+1 (555) 902-3341",
        "location": "Chennai, Tamil Nadu",
        "linkedin_url": "https://linkedin.com/in/elena-rostova-data",
        "github_url": "https://github.com/erostova",
        "portfolio_url": "",
        "current_role": "Data Engineer & Pipeline Specialist",
        "total_experience_years": 4,
        "headline": "Data Engineer focused on Apache Spark, Snowflake, Airflow, and BigQuery",
        "avatar_url": "",
        "skills": ["Python", "SQL", "Apache Spark", "Snowflake", "Airflow", "Data Modeling", "PostgreSQL"],
        "education": {"degree": "MS Data Analytics", "institution": "Carnegie Mellon", "year": 2022},
        "experience": [
            {"company": "DataStream Solutions", "role": "Data Engineer", "years": 4, "highlights": "Built real-time streaming pipeline processing 50M events daily."}
        ]
    }
]

def setup_database():
    print(f"Connecting to MySQL server at {DB_HOST}:{DB_PORT} as {DB_USER}...")
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        autocommit=True
    )
    cur = conn.cursor()

    print(f"Ensuring database '{DB_NAME}' exists...")
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    cur.execute(f"USE `{DB_NAME}`;")

    print("Verifying and structuring tables...")

    # Candidates table (supports both SQLAlchemy JSON columns and full profile attributes)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS `candidates` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `full_name` VARCHAR(100) NOT NULL,
        `email` VARCHAR(100) NOT NULL UNIQUE,
        `phone` VARCHAR(30) NULL,
        `location` VARCHAR(100) NULL,
        `linkedin_url` VARCHAR(255) NULL,
        `github_url` VARCHAR(255) NULL,
        `portfolio_url` VARCHAR(255) NULL,
        `current_role` VARCHAR(100) NULL,
        `total_experience_years` INT DEFAULT 0,
        `headline` TEXT NULL,
        `avatar_url` VARCHAR(255) NULL,
        `skills` JSON NULL,
        `education` JSON NULL,
        `experience` JSON NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)

    # Ensure all columns exist in candidates
    cur.execute("SHOW COLUMNS FROM `candidates`;")
    existing_cand_cols = [r[0] for r in cur.fetchall()]
    needed_cand_cols = {
        "avatar_url": "VARCHAR(255) NULL",
        "skills": "JSON NULL",
        "education": "JSON NULL",
        "experience": "JSON NULL"
    }
    for col, col_type in needed_cand_cols.items():
        if col not in existing_cand_cols:
            cur.execute(f"ALTER TABLE `candidates` ADD COLUMN `{col}` {col_type};")
            print(f"Added column `{col}` to `candidates` table.")

    # Candidate skills relational table (for easy relational queries in MySQL Workbench)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS `candidate_skills` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `candidate_id` BIGINT NOT NULL,
        `skill_name` VARCHAR(100) NOT NULL,
        `skill_category` VARCHAR(50) DEFAULT 'TECHNICAL',
        `proficiency_level` VARCHAR(30) DEFAULT 'ADVANCED',
        `years_of_experience` INT DEFAULT 1,
        FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)

    # Jobs table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS `jobs` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(150) NOT NULL,
        `department` VARCHAR(100) NOT NULL,
        `location` VARCHAR(100) NOT NULL,
        `employment_type` VARCHAR(50) DEFAULT 'Full-time',
        `min_salary` DECIMAL(10, 2) NULL,
        `max_salary` DECIMAL(10, 2) NULL,
        `description` TEXT NOT NULL,
        `required_skills` JSON NOT NULL,
        `preferred_skills` JSON NULL,
        `min_experience_years` INT DEFAULT 0,
        `education_requirement` VARCHAR(100) NULL,
        `status` VARCHAR(50) DEFAULT 'ACTIVE',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)

    # Users table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS `users` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `full_name` VARCHAR(100) NOT NULL,
        `email` VARCHAR(100) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) DEFAULT 'RECRUITER',
        `department` VARCHAR(100) NULL,
        `avatar_url` VARCHAR(255) NULL,
        `is_active` BOOLEAN DEFAULT TRUE,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)

    cur.execute("SHOW COLUMNS FROM `users`;")
    existing_user_cols = [r[0] for r in cur.fetchall()]
    if "role" not in existing_user_cols:
        cur.execute("ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) DEFAULT 'RECRUITER';")
        print("Added column `role` to `users` table.")

    # Candidate matches table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS `candidate_matches` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `candidate_id` BIGINT NOT NULL,
        `job_id` BIGINT NOT NULL,
        `overall_match_score` DECIMAL(5,2) NOT NULL,
        `skill_score` DECIMAL(5,2) NOT NULL,
        `experience_score` DECIMAL(5,2) NOT NULL,
        `education_score` DECIMAL(5,2) NOT NULL,
        `semantic_score` DECIMAL(5,2) NOT NULL,
        `strengths` JSON NULL,
        `missing_requirements` JSON NULL,
        `pipeline_stage` VARCHAR(50) DEFAULT 'APPLIED',
        `matched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """)

    # Helper Views for MySQL Workbench
    cur.execute("""
    CREATE OR REPLACE VIEW `vw_candidate_skills_summary` AS
    SELECT 
        c.id AS candidate_id,
        c.full_name,
        c.email,
        c.current_role,
        c.total_experience_years,
        GROUP_CONCAT(cs.skill_name ORDER BY cs.skill_name SEPARATOR ', ') AS technical_skills,
        COUNT(cs.id) AS total_skills_count
    FROM candidates c
    LEFT JOIN candidate_skills cs ON c.id = cs.candidate_id
    GROUP BY c.id, c.full_name, c.email, c.current_role, c.total_experience_years;
    """)

    # Modify users role_id to be nullable if present
    cur.execute("SHOW COLUMNS FROM `users`;")
    user_cols = {r[0]: r for r in cur.fetchall()}
    if "role_id" in user_cols:
        try:
            cur.execute("ALTER TABLE `users` MODIFY COLUMN `role_id` BIGINT NULL;")
        except Exception as e:
            pass

    print("Populating initial Seed Data...")

    # Seed Users
    cur.execute("""
    INSERT INTO `users` (full_name, email, password_hash, role, role_id, department)
    VALUES 
    ('Omkar Kakumanu (Recruiter)', 'recruiter@copilot.com', '$2a$10$e8wFp1E0jQ7G8.N1Q.N1QeY9u8k8A7f1m6v8.g4z2.X5P1M5s7y.u', 'RECRUITER', 2, 'Talent Acquisition'),
    ('Admin Lead', 'admin@copilot.com', '$2a$10$e8wFp1E0jQ7G8.N1Q.N1QeY9u8k8A7f1m6v8.g4z2.X5P1M5s7y.u', 'ADMIN', 1, 'Engineering & HR')
    ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role);
    """)

    # Seed Jobs
    for j in INITIAL_JOBS:
        cur.execute("""
        INSERT INTO `jobs` 
        (id, title, department, location, employment_type, min_salary, max_salary, description, required_skills, preferred_skills, min_experience_years, education_requirement, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE 
            title=VALUES(title),
            department=VALUES(department),
            location=VALUES(location),
            min_salary=VALUES(min_salary),
            max_salary=VALUES(max_salary),
            description=VALUES(description),
            required_skills=VALUES(required_skills),
            preferred_skills=VALUES(preferred_skills),
            min_experience_years=VALUES(min_experience_years),
            education_requirement=VALUES(education_requirement),
            status=VALUES(status);
        """, (
            j["id"],
            j["title"],
            j["department"],
            j["location"],
            j["employment_type"],
            j["min_salary"],
            j["max_salary"],
            j["description"],
            json.dumps(j["required_skills"]),
            json.dumps(j["preferred_skills"]),
            j["min_experience_years"],
            j["education_requirement"],
            j["status"]
        ))

    # Seed Candidates & Candidate Skills
    for c in INITIAL_CANDIDATES:
        cur.execute("""
        INSERT INTO `candidates`
        (id, full_name, email, phone, location, linkedin_url, github_url, portfolio_url, current_role, total_experience_years, headline, avatar_url, skills, education, experience)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            full_name=VALUES(full_name),
            phone=VALUES(phone),
            location=VALUES(location),
            linkedin_url=VALUES(linkedin_url),
            github_url=VALUES(github_url),
            portfolio_url=VALUES(portfolio_url),
            current_role=VALUES(current_role),
            total_experience_years=VALUES(total_experience_years),
            headline=VALUES(headline),
            avatar_url=VALUES(avatar_url),
            skills=VALUES(skills),
            education=VALUES(education),
            experience=VALUES(experience);
        """, (
            c["id"],
            c["full_name"],
            c["email"],
            c["phone"],
            c["location"],
            c["linkedin_url"],
            c["github_url"],
            c["portfolio_url"],
            c["current_role"],
            c["total_experience_years"],
            c["headline"],
            c["avatar_url"],
            json.dumps(c["skills"]),
            json.dumps(c["education"]),
            json.dumps(c["experience"])
        ))

        # Clear existing individual skills for candidate to re-sync
        cur.execute("DELETE FROM `candidate_skills` WHERE candidate_id = %s;", (c["id"],))
        for sk in c["skills"]:
            cur.execute("""
            INSERT INTO `candidate_skills` (candidate_id, skill_name, skill_category, proficiency_level, years_of_experience)
            VALUES (%s, %s, 'TECHNICAL', 'ADVANCED', %s);
            """, (c["id"], sk, max(1, c["total_experience_years"] - 1)))

    # Seed initial candidate matches
    cur.execute("""
    INSERT INTO `candidate_matches` (candidate_id, job_id, overall_match_score, skill_score, experience_score, education_score, semantic_score, strengths, missing_requirements, pipeline_stage)
    VALUES
    (1, 1, 92.50, 95.00, 90.00, 92.00, 94.00, '["Strong Python & TensorFlow experience", "Published ML models"]', '["None"]', 'INTERVIEW_SCHEDULED'),
    (2, 2, 88.00, 90.00, 85.00, 88.00, 89.00, '["Expert React & TypeScript frontend development"]', '["None"]', 'SCREENED'),
    (3, 3, 95.00, 96.00, 94.00, 95.00, 95.00, '["Certified AWS Architect", "Extensive Terraform automated pipelines"]', '["None"]', 'OFFER_EXTENDED')
    ON DUPLICATE KEY UPDATE overall_match_score=VALUES(overall_match_score);
    """)

    print("\n[SUCCESS] Database setup & population completed successfully!")
    print(f"Database: {DB_NAME}")
    cur.execute("SELECT COUNT(*) FROM candidates;")
    print(f"Candidates Count: {cur.fetchone()[0]}")
    cur.execute("SELECT COUNT(*) FROM candidate_skills;")
    print(f"Candidate Skills Count: {cur.fetchone()[0]}")
    cur.execute("SELECT COUNT(*) FROM jobs;")
    print(f"Jobs Count: {cur.fetchone()[0]}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    setup_database()
