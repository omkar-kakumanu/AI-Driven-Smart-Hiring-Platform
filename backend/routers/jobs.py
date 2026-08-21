from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("", response_model=schemas.ApiResponse)
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = db.query(models.Job).all()
    return schemas.ApiResponse(
        success=True,
        data=[schemas.JobResponse.from_orm(j) for j in jobs],
        message="Retrieved all jobs successfully"
    )

@router.get("/{job_id}", response_model=schemas.ApiResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
    return schemas.ApiResponse(
        success=True,
        data=schemas.JobResponse.from_orm(job),
        message="Job details retrieved successfully"
    )

@router.post("", response_model=schemas.ApiResponse, status_code=status.HTTP_201_CREATED)
def create_job(payload: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(**payload.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return schemas.ApiResponse(
        success=True,
        data=schemas.JobResponse.from_orm(db_job),
        message="Job posting created successfully"
    )

@router.put("/{job_id}", response_model=schemas.ApiResponse)
def update_job(job_id: int, payload: schemas.JobCreate, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
    
    for key, value in payload.dict().items():
        setattr(job, key, value)
    
    db.commit()
    db.refresh(job)
    return schemas.ApiResponse(
        success=True,
        data=schemas.JobResponse.from_orm(job),
        message="Job posting updated successfully"
    )

@router.delete("/{job_id}", response_model=schemas.ApiResponse)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
    
    db.delete(job)
    db.commit()
    return schemas.ApiResponse(
        success=True,
        data=None,
        message=f"Job {job_id} deleted successfully"
    )
