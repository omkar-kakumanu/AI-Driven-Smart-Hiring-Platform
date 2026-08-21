from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])

@router.get("", response_model=schemas.ApiResponse)
def get_all_candidates(db: Session = Depends(get_db)):
    candidates = db.query(models.Candidate).all()
    return schemas.ApiResponse(
        success=True,
        data=[schemas.CandidateResponse.from_orm(c) for c in candidates],
        message="Retrieved all candidates successfully"
    )

@router.get("/{candidate_id}", response_model=schemas.ApiResponse)
def get_candidate_by_id(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found")
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
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(db_candidate),
        message="Candidate profile created successfully"
    )

@router.put("/{candidate_id}", response_model=schemas.ApiResponse)
def update_candidate(candidate_id: int, payload: schemas.CandidateCreate, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found")
    
    for key, value in payload.dict().items():
        setattr(candidate, key, value)
    
    db.commit()
    db.refresh(candidate)
    return schemas.ApiResponse(
        success=True,
        data=schemas.CandidateResponse.from_orm(candidate),
        message="Candidate profile updated successfully"
    )

@router.delete("/{candidate_id}", response_model=schemas.ApiResponse)
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail=f"Candidate with ID {candidate_id} not found")
    
    db.delete(candidate)
    db.commit()
    return schemas.ApiResponse(
        success=True,
        data=None,
        message=f"Candidate {candidate_id} deleted successfully"
    )
