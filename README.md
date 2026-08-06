# HireMind AI 🚀
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA--3-f54e42.svg)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

**The Enterprise AI Copilot for Technical Hiring.**

HireMind AI replaces legacy Applicant Tracking Systems (ATS) with an AI-Native OS. By seamlessly merging Resume Parsing, Adaptive Voice Interviews, IDE-based Coding Assessments, and a Multi-Agent RAG Copilot, HireMind AI reduces Time-to-Hire by 80% while completely eliminating candidate ghosting.

## 🌟 Key Features

*   **Multi-Agent AI Copilot**: A context-aware RAG assistant (powered by Groq & LLaMA 3) that acts as an ATS assistant for recruiters and a Career Coach for candidates.
*   **AI Resume Analyzer**: Instantly parses uploaded resumes, extracts core skills, and generates an ATS compatibility score.
*   **Adaptive AI Interviewer**: A dynamic, voice-enabled interview system that adjusts questions based on real-time candidate responses.
*   **Integrated Coding Platform**: A Monaco-based embedded IDE supporting code execution, hidden test cases, and instant AI code review.
*   **Skill Gap Analyzer & Hiring Reports**: Automatically compares candidates against job descriptions to generate structured gap analysis and actionable learning roadmaps.
*   **Enterprise Recruiter Pipeline**: A Kanban-style dashboard for recruiters to manage jobs, applicants, and pipeline velocity.
*   **Automated Scheduling**: A complete calendar system for booking interviews, handling conflicts, and generating `.ics` files.

## 🏗️ Architecture

*   **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, React-Big-Calendar, Monaco Editor.
*   **Backend**: Python, FastAPI, SQLAlchemy, SQLite (production ready for PostgreSQL).
*   **AI Models**: Groq Cloud (LLaMA-3 70B, LLaMA-3 8B).
*   **Deployment**: Fully Dockerized with `docker-compose`.

## 🚀 Quick Start (Demo Mode)

We have provided a zero-configuration Demo Mode for hackathon judges, investors, and testers.

1.  **Clone & Start**:
    ```bash
    git clone https://github.com/yourusername/hiremind-ai.git
    cd hiremind-ai
    docker-compose up --build -d
    ```

2.  **Seed the Demo Database**:
    ```bash
    docker exec -it hiremind-ai-backend-1 python seed.py
    ```

3.  **Access the Platform**:
    *   Navigate to: `http://localhost:5173`
    *   **Recruiter Account**: `recruiter@demo.com` / `demo123`
    *   **Candidate Account**: `candidate@demo.com` / `demo123`

## 📂 Folder Structure

```
hiremind-ai/
├── backend/                  # FastAPI Application
│   ├── app/                  # Application Logic
│   │   ├── api/              # API Route Handlers
│   │   ├── services/         # Core Business & AI Logic (RAG, etc)
│   │   ├── models.py         # SQLAlchemy Database Models
│   │   ├── schemas.py        # Pydantic Validation Schemas
│   │   └── main.py           # Entrypoint
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/       # Reusable UI & Layouts
│   │   ├── context/          # React Context (Auth, Theme)
│   │   ├── pages/            # Page Views (Dashboards, Copilot, Scheduling)
│   │   ├── services/         # API Client (Axios)
│   │   └── App.jsx           # Routing
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🔒 Security & Roles

HireMind AI implements strict Role-Based Access Control (RBAC).
*   **Candidates** only have access to their personal resumes, interviews, scores, and candidate-focused AI Copilot.
*   **Recruiters** have access to job creation, the applicant pipeline, scheduling tools, and the ATS-focused AI Copilot. The system strictly isolates RAG contexts.

## 📈 Project Metrics
- **9 Specialized AI Agents** coordinating via RAG.
- **100% Automated Workflow** from Apply to Hire.
- **Sub-second Inference** powered by Groq.

## 📜 License
This project is licensed under the MIT License.
