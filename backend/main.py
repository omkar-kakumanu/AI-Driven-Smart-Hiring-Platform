import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import candidates, jobs

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Recruitment Copilot - Python Core Backend",
    description="Python FastAPI REST microservice handling candidate management, job postings, recruitment workflows, and database ORM.",
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

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "recruitment-copilot-python-backend",
        "framework": "FastAPI + SQLAlchemy",
        "database": "SQLite / PostgreSQL Ready"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
