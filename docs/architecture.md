# AI Recruitment Copilot - System Architecture

## Overview
AI Recruitment Copilot is an enterprise-grade full-stack recruitment automation and decision-support platform designed to streamline resume screening, candidate-job matching, skill-gap intelligence, role-specific interview question generation, interactive AI interview simulations, and preliminary voice screenings.

```
                  +-----------------------------------+
                  |   React 18 + Vite + Tailwind CSS  |
                  |     (Enterprise Web Dashboard)    |
                  +-----------------+-----------------+
                                    |
                                    v REST / WebSocket
                  +-----------------+-----------------+
                  |      Python 3.11 FastAPI Core     |
                  |      (Core REST API & ORM Engine) |
                  +--------+----------------+---------+
                           |                |
             SQLAlchemy    |                | HTTP REST
                           v                v
                  +--------+----+  +--------+--------+
                  | SQLite /    |  | Python 3.11     |
                  | PostgreSQL  |  | FastAPI NLP &   |
                  +-------------+  | Matching Engine |
                                   +-----------------+
```

## Layered System Topology
1. **Frontend Layer (`/frontend`)**:
   - Single Page Application (SPA) built with React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, and Recharts.
   - Built-in Web Audio API recorder for live voice screening simulation.
   - Dynamic tab layout rendering 4 core milestones (Resume Upload, Candidate Matching, Interview Assistance, Dashboard & Voice Screening).

2. **Backend Services (`/backend`)**:
   - Python 3.11 & FastAPI clean architecture (`Routers` -> `Models` -> `Schemas` -> `Database`).
   - SQLAlchemy ORM engine for database models and schema management.
   - CORS middleware enabled for front-end integration.

3. **AI / NLP Microservice (`/ai-service`)**:
   - Python 3.11 + FastAPI microservice powering resume parsing, semantic embedding calculations, weighted skill-gap identification, and role-tailored interview question generation.

4. **Database Storage (`/database`)**:
   - Relational database storing core entities with foreign keys, indexes, and JSON column support.
