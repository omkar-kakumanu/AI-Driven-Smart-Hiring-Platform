from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])

def find_candidate(db: Session, identifier: str) -> Optional[models.Candidate]:
    """Find a candidate by integer ID, string ID ('cand-1'), or email."""
    clean_id = str(identifier).strip()
    if clean_id.startswith("cand-"):
        num_str = clean_id.replace("cand-", "")
        if num_str.isdigit():
            c = db.query(models.Candidate).filter(models.Candidate.id == int(num_str)).first()
            if c:
                return c
    elif clean_id.isdigit():
        c = db.query(models.Candidate).filter(models.Candidate.id == int(clean_id)).first()
        if c:
            return c
    
    # Try email lookup
    c = db.query(models.Candidate).filter(models.Candidate.email.ilike(clean_id)).first()
    if c:
        return c
        
    return None

def sync_candidate_skills_table(db: Session, candidate_id: int, skills: List[str], exp_years: int = 1):
    """Synchronize relational candidate_skills table so MySQL Workbench views reflect updates."""
    try:
        db.query(models.CandidateSkill).filter(models.CandidateSkill.candidate_id == candidate_id).delete()
        for s in skills:
            clean_s = str(s).strip()
            if clean_s:
                db.add(models.CandidateSkill(
                    candidate_id=candidate_id,
                    skill_name=clean_s,
                    skill_category="TECHNICAL",
                    proficiency_level="ADVANCED",
                    years_of_experience=max(1, exp_years)
                ))
        db.commit()
    except Exception as e:
        print(f"[WARN] Failed to sync candidate_skills table: {e}")

@router.get("", response_model=schemas.ApiResponse)
def get_all_candidates(db: Session = Depends(get_db)):
    candidates = db.query(models.Candidate).all()
    return schemas.ApiResponse(
        success=True,
        data=[schemas.CandidateResponse.from_orm(c) for c in candidates],
        message="Retrieved all candidates successfully"
    )

@router.get("/{candidate_id}", response_model=schemas.ApiResponse)
def get_candidate_by_id(candidate_id: str, db: Session = Depends(get_db)):
    candidate = find_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID or Email '{candidate_id}' not found")
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(candidate),
        message="Candidate profile retrieved"
    )

@router.post("", response_model=schemas.ApiResponse, status_code=status.HTTP_201_CREATED)
def create_candidate(payload: schemas.CandidateCreate, db: Session = Depends(get_db)):
    db_candidate = models.Candidate(**payload.dict())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    
    if db_candidate.skills:
        sync_candidate_skills_table(db, db_candidate.id, db_candidate.skills, db_candidate.total_experience_years or 1)
        
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(db_candidate),
        message="Candidate profile created successfully"
    )

@router.put("/{candidate_id}", response_model=schemas.ApiResponse)
def update_candidate(candidate_id: str, payload: schemas.CandidateCreate, db: Session = Depends(get_db)):
    candidate = find_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID or Email '{candidate_id}' not found")
    
    for key, value in payload.dict().items():
        setattr(candidate, key, value)
    
    db.commit()
    db.refresh(candidate)
    
    if candidate.skills:
        sync_candidate_skills_table(db, candidate.id, candidate.skills, candidate.total_experience_years or 1)
        
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(candidate),
        message="Candidate profile updated successfully"
    )

@router.put("/{candidate_id}/skills", response_model=schemas.ApiResponse)
def update_candidate_skills(candidate_id: str, payload: schemas.CandidateSkillsUpdate, db: Session = Depends(get_db)):
    """Allow recruiter or admin to update all skills for a candidate in MySQL."""
    candidate = find_candidate(db, candidate_id)
    if not candidate and payload.email:
        candidate = find_candidate(db, payload.email)
    
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate_id}' not found in database")
    
    clean_skills = [s.strip() for s in payload.skills if str(s).strip()]
    candidate.skills = clean_skills
    db.commit()
    db.refresh(candidate)
    
    # Synchronize candidate_skills table for MySQL Workbench views
    sync_candidate_skills_table(db, candidate.id, clean_skills, candidate.total_experience_years or 1)
    
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(candidate),
        message=f"Skills for candidate '{candidate.full_name}' updated successfully in MySQL"
    )

@router.post("/{candidate_id}/skills", response_model=schemas.ApiResponse)
def add_skill_to_candidate(candidate_id: str, payload: schemas.CandidateAddSkillRequest, db: Session = Depends(get_db)):
    """Recruiter endpoint to add a single skill to candidate."""
    candidate = find_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate_id}' not found in database")
    
    new_skill = payload.skill.strip()
    current_skills = list(candidate.skills or [])
    if new_skill and not any(s.lower() == new_skill.lower() for s in current_skills):
        current_skills.append(new_skill)
        candidate.skills = current_skills
        db.commit()
        db.refresh(candidate)
        sync_candidate_skills_table(db, candidate.id, current_skills, candidate.total_experience_years or 1)
        
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(candidate),
        message=f"Skill '{new_skill}' added to candidate '{candidate.full_name}'"
    )

@router.delete("/{candidate_id}/skills/{skill_name}", response_model=schemas.ApiResponse)
def remove_skill_from_candidate(candidate_id: str, skill_name: str, db: Session = Depends(get_db)):
    """Recruiter endpoint to remove a skill from candidate."""
    candidate = find_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate_id}' not found in database")
    
    target_skill = skill_name.strip().lower()
    current_skills = [s for s in (candidate.skills or []) if s.lower() != target_skill]
    candidate.skills = current_skills
    db.commit()
    db.refresh(candidate)
    sync_candidate_skills_table(db, candidate.id, current_skills, candidate.total_experience_years or 1)
    
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(candidate),
        message=f"Skill '{skill_name}' removed from candidate '{candidate.full_name}'"
    )

@router.delete("/{candidate_id}", response_model=schemas.ApiResponse)
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    candidate = find_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID '{candidate_id}' not found")
    
    db.delete(candidate)
    db.commit()
    return schemas.ApiResponse(
        success=True,
        data=None,
        message=f"Candidate '{candidate.full_name}' deleted successfully"
    )
