from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="RECRUITER")
    department = Column(String(100), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    location = Column(String(100), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    current_role = Column(String(100), nullable=True)
    total_experience_years = Column(Integer, default=0)
    headline = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    skills = Column(JSON, default=list) # List of skills
    education = Column(JSON, default=dict)
    experience = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)cd frontend
    employment_type = Column(String(50), default="Full-time")
    min_salary = Column(Float, nullable=True)
    max_salary = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=False)
    preferred_skills = Column(JSON, default=list)
    min_experience_years = Column(Integer, default=0)
    education_requirement = Column(String(100), nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

class CandidateMatch(Base):
    __tablename__ = "candidate_matches"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    overall_match_score = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    education_score = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)
    strengths = Column(JSON, default=list)
    missing_requirements = Column(JSON, default=list)
    pipeline_stage = Column(String(50), default="APPLIED")
    matched_at = Column(DateTime, default=datetime.utcnow)
