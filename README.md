<div align="center">
  <img src="frontend/public/logo.png" alt="EduMind Logo" width="300"/>

  # EduMind AI
  **The Intelligent AI-Powered Learning Platform**

  An adaptive, highly personalized AI tutoring system built with Next.js, FastAPI, and LangGraph.

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![LangChain](https://img.shields.io/badge/LangGraph-AI_Agents-blue?style=for-the-badge)](https://python.langchain.com/docs/langgraph/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
</div>

## ✨ Overview

**EduMind** is a state-of-the-art educational platform designed to act as a personal, 24/7 AI teacher. It doesn't just answer questions—it actively guides the student's learning journey using a sophisticated multi-agent AI architecture. 

The platform continually adapts to the user by:
1. 🧠 **Teaching Concepts**: Breaking down complex topics tailored to the student's level.
2. 📝 **Generating Quizzes**: Dynamically creating targeted assessments based on uploaded materials.
3. 🎯 **Evaluating Answers**: Grading responses intelligently, not just with simple keyword matching.
4. 🔍 **Detecting Weaknesses**: Mapping out knowledge gaps in real-time.
5. 🔄 **Adapting Difficulty**: Calibrating the learning curve for optimal retention.

## 🛠️ Technology Stack

**Frontend Architecture (Modern React):**
- **Framework**: Next.js 15 (App Router)
- **UI & Styling**: React, Tailwind CSS, custom glass-morphism designs
- **Components**: ShadCN UI, Recharts (Data Visualization)
- **Authentication**: Supabase Auth

**Backend Engine (High-Performance Python):**
- **Framework**: FastAPI (Asynchronous Python)
- **Agent Orchestration**: LangGraph (Directed Acyclic Graphs for AI flows)
- **AI Models**: Google Gemini 2.5 Flash, LangChain
- **Vector Database**: ChromaDB (RAG for document processing)
- **Relational DB**: PostgreSQL via Supabase (SQLAlchemy Async)

## 🤖 The AI Multi-Agent Engine

EduMind is powered by a highly intelligent **LangGraph** orchestration system that operates like a real classroom:

* **The Orchestrator (Path Planner)** -> Analyzes the student's state and decides the next pedagogical step (Teach, Quiz, or Evaluate).
* **The Tutor** -> Explains concepts using analogies and adapts based on previously identified weaknesses.
* **The Quiz Master** -> Synthesizes uploaded PDFs/DOCXs and generates structured, syllabus-aligned JSON quizzes.
* **The Assessor (Evaluator)** -> Grades the student's answers, extracts precise weaknesses, and updates the mastery database.

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\Activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=sqlite+aiosqlite:///./edumind.db # Or your Supabase connection string
```

Start the Python server:
```bash
uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## 📦 Database Migration (Supabase)

If you are deploying this to production using Supabase PostgreSQL:
1. Obtain your PostgreSQL connection string from your Supabase Dashboard (Settings -> Database).
2. Ensure `asyncpg` is installed in your python environment.
3. Update the `DATABASE_URL` in your backend `.env` file: 
   `postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`
4. Apply the Alembic migrations to build the schema:
   ```bash
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```

---
*Designed & Built for modern education.*
