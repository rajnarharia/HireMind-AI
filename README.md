# HireMind AI 🚀

HireMind AI is an advanced, AI-powered recruitment and interview platform designed to seamlessly connect candidates with next-generation hiring processes. The platform features an interactive Candidate Dashboard, an AI-driven Interview Studio, and a real-time Coding Environment with automated code reviews.

## 🌟 Key Features

- **Candidate Dashboard:** A sleek, premium dashboard featuring dynamic 3D hover animations, readiness distribution charts, and upcoming interview event tracking.
- **AI-Powered Coding Rounds:** A fully integrated coding environment where candidates can write and execute code. Submissions are instantly evaluated by our AI engine (powered by Groq) for correctness, time/space complexity, and code quality.
- **Interview Studio:** An intelligent, simulated interview experience where candidates receive personalized technical questions based on their resume and job profile.
- **Modern UI/UX:** Built with a sophisticated light-gray design language, featuring glassmorphism effects, smooth transitions (via Framer Motion), and responsive layouts.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (v4)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (managed via SQLAlchemy ORM)
- **Validation:** Pydantic
- **Server:** Uvicorn
- **AI Integration:** Groq API (for automated code review & interview intelligence)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup

Navigate to the backend directory and install the dependencies:
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Start the backend server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will run at `http://localhost:8000`.

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The web application will run at `http://localhost:5173`.

## 📂 Project Structure

```
HireMind-AI/
├── backend/
│   ├── app/
│   │   ├── api/          # API Controllers (coding, auth, etc.)
│   │   ├── models.py     # SQLAlchemy DB Models
│   │   ├── schemas.py    # Pydantic Schemas
│   │   ├── services/     # Core Business Logic (coding_service, llm_service)
│   │   └── main.py       # FastAPI Application Entry Point
│   ├── requirements.txt
│   └── hiremind.db       # SQLite Database
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI Components & Layouts
│   │   ├── pages/        # Application Pages (CandidateDashboard, CodingDashboard)
│   │   ├── index.css     # Global Tailwind CSS Styles
│   │   └── App.jsx       # React Router Configuration
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
