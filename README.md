# AI Recruitment Copilot

### AI-Driven Smart Hiring Platform with Candidate Matching Copilot

**AI Recruitment Copilot** is a full-stack, enterprise-grade recruitment platform designed to automate resume screening, candidate-job matching, skill-gap analysis, interview question generation, AI interactive interview simulation, voice screening, and recruitment pipeline tracking.

---

## 🌟 Key Features

1. **Milestone 1: Resume Parsing & Candidate Profiling**:
   - PDF & DOCX drag-and-drop resume processor.
   - Extraction accuracy tracker (97%) with structured profile previews (Name, Contact, Education, Work History, Skills).
   - Recently processed candidate database.

2. **Milestone 2: Candidate Matching & Skill Gap Intelligence**:
   - Multi-factor compatibility scoring (30% required skills, 20% experience, 10% education, 40% semantic fit).
   - Candidate match badges (92% Match Green, 78% Match Orange, 65% Match Amber).
   - Interactive skill gap visualizer with progress bars (TensorFlow, Kubernetes, MLOps, AWS SageMaker) and learning recommendations.

3. **Milestone 3: Interview Assistance & ATS Integration**:
   - Role-tailored technical and behavioral question generator.
   - Live AI interview chatbot simulation with candidate message responses.
   - Connected ATS Integration status (Greenhouse, Lever, Workday).

4. **Milestone 4: Voice Screening & Recruitment Analytics**:
   - Live Web Audio API voice recorder with microphone controls (Start, Stop, Save).
   - Audio waveform animation, timer, transcript preview, and preliminary communication assessment score.
   - Recruitment Pipeline funnel chart (Applied 1,247 -> Screened 850 -> Interviewed 450 -> Offered 180 -> Hired 89).

5. **Recruitment Pipeline & Admin Management**:
   - Drag-and-drop Kanban hiring pipeline board across 7 stages.
   - Candidate comparison matrix table.
   - System settings & AI model key configuration.

---

## 📁 Repository Structure

```
/recruitment-copilot
├── frontend/             # React 18 + TypeScript + Vite + CSS Dashboard
├── backend/              # Python + FastAPI REST APIs & SQLAlchemy ORM
├── ai-service/           # Python + FastAPI NLP, PyMuPDF, spaCy Parsing & Matching Engine
├── database/             # Database Schemas & SQLite/PostgreSQL setup
└── docs/                 # Architectural, API, and Database Documentation
```

---

## 🚀 Quick Start & Local Execution

### 1. Run React Frontend (Dashboard & Demos)
```bash
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:5173` to explore the dashboard views immediately!

To verify production bundle build:
```bash
npm run build
```

### 2. Run Python Core Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Python FastAPI server starts at `http://localhost:8080` (Swagger UI at `http://localhost:8080/docs`).

### 3. Run Python AI Microservice
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
FastAPI server starts at `http://localhost:8000` (OpenAPI Docs at `http://localhost:8000/docs`).


---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@copilot.com` | `admin123` |
| **Recruiter** | `recruiter@copilot.com` | `recruiter123` |

---

## 📚 Documentation Links
- [System Architecture](file:///c:/Users/omkar/OneDrive/Desktop/Infosys/docs/architecture.md)
- [API Reference & OpenAPI](file:///c:/Users/omkar/OneDrive/Desktop/Infosys/docs/api.md)
- [Database Schema & ERD](file:///c:/Users/omkar/OneDrive/Desktop/Infosys/docs/database.md)
- [AI Safety & Fairness Guidelines](file:///c:/Users/omkar/OneDrive/Desktop/Infosys/docs/ai.md)
- [Production Deployment](file:///c:/Users/omkar/OneDrive/Desktop/Infosys/docs/deployment.md)
- [Security & RBAC](file:///c:/Users/omkar/OneDrive/Desktop/Infosys/docs/security.md)
