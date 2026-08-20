from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    message: str = "Operation completed successfully"
    timestamp: datetime = datetime.now()

class CandidateBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    current_role: Optional[str] = None
    total_experience_years: Optional[int] = 0
    headline: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = []
    education: Optional[Dict[str, Any]] = {}
    experience: Optional[List[Dict[str, Any]]] = []

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobBase(BaseModel):
    title: str
    department: str
    location: str
    employment_type: Optional[str] = "Full-time"
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    description: str
    required_skills: List[str]
    preferred_skills: Optional[List[str]] = []
    min_experience_years: Optional[int] = 0
    education_requirement: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
