# Production Deployment Guide

## Docker Compose One-Command Setup
To run the complete platform (Frontend, Python FastAPI Backend, Python AI Microservice) using Docker:

```bash
docker compose -f docker/docker-compose.yml up --build
```

## Production Cloud Architecture
- **Frontend**: AWS CloudFront + S3 / Vercel
- **Python Backend APIs**: AWS ECS Fargate / EKS Kubernetes cluster (Python 3.11 FastAPI)
- **Database**: AWS RDS PostgreSQL / MySQL Multi-AZ cluster or SQLite
- **AI Microservice**: AWS ECS container with GPU support or FastAPI serverless deployment
- **File Storage**: AWS S3 private bucket with IAM presigned URLs
