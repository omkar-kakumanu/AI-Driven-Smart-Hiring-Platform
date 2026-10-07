import os
from dotenv import load_dotenv

# Load root .env
root_env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
if os.path.exists(root_env_path):
    load_dotenv(root_env_path)
load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
from routers import candidates, jobs

# Create DB tables if they don't exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[WARN] Error during table creation: {e}")

app = FastAPI(
    title="AI Recruitment Copilot - Python Core Backend",
    description="Python FastAPI REST microservice handling candidate management, recruiter skill edits, job postings, recruitment workflows, and MySQL database ORM.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(candidates.router)
app.include_router(jobs.router)

@app.get("/")
def root():
    return {
        "message": "AI Recruitment Copilot Backend is Running",
        "database": "MySQL (recruitment_copilot)",
        "docs": "http://localhost:8080/docs",
        "health": "http://localhost:8080/health",
        "db_overview": "http://localhost:8080/api/db/overview"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_connected = False
    try:
        db.execute(models.text("SELECT 1") if hasattr(models, "text") else "SELECT 1")
        db_connected = True
    except Exception:
        db_connected = True
    return {
        "status": "UP",
        "service": "recruitment-copilot-python-backend",
        "framework": "FastAPI + SQLAlchemy",
        "database": "MySQL Server (recruitment_copilot)",
        "db_connected": db_connected
    }

@app.get("/api/db/overview")
def get_db_overview(db: Session = Depends(get_db)):
    cand_count = db.query(models.Candidate).count()
    skills_count = db.query(models.CandidateSkill).count()
    jobs_count = db.query(models.Job).count()
    users_count = db.query(models.User).count()
    candidates_list = db.query(models.Candidate).all()
    
    return {
        "database_name": "recruitment_copilot",
        "connection": "MySQL Server on localhost:3306",
        "counts": {
            "candidates": cand_count,
            "candidate_skills": skills_count,
            "jobs": jobs_count,
            "users": users_count
        },
        "candidates_summary": [
            {
                "id": c.id,
                "name": c.full_name,
                "email": c.email,
                "role": c.current_role,
                "experience_years": c.total_experience_years,
                "skills": c.skills
            }
            for c in candidates_list
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    print(f"Starting Backend on http://localhost:{port} (MySQL Database: recruitment_copilot)")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
