# StudyPulse AI — Modern Student OS

StudyPulse AI is a high-performance, SaaS-ready platform designed for students and institutions. It combines AI coaching, smart flashcards (SRS), and collaborative task tracking into a stunning, glassmorphism-inspired interface.

## ✨ Design Philosophy

StudyPulse AI is built on a **Premium Glassmorphism** aesthetic. Every element—from the sidebar to the AI chat bubbles—utilizes:
- **Depth & Translucency**: High-quality backdrop-blur effects.
- **Vibrant Accents**: A color palette centered on Indigo, Slate, and Subtle Gradients.
- **Micro-Animations**: Smooth transitions that make the interface feel alive and responsive.

## 🚀 Features

- **AI Study Coach**: Real-time streaming chat powered by Gemini 2.5 Flash.
- **Voice Transcription**: Generate flashcards and study notes from lectures using OpenAI Whisper.
- **Smart Flashcards**: Spaced Repetition System (SRS) for maximizing retention.
- **Modern Dashboard**: Track XP, levels, and study streaks with premium glassmorphism UI.
- **Team Collaboration**: Shared courses and assignments for group study.
- **Integrated Billing**: Paddle integration for Pro and Institutional tiers.

## 🛠 Tech Stack

### Frontend
- **React 18 + Vite** (TypeScript)
- **Tailwind CSS** (Custom Glassmorphism engine)
- **Zustand** (Global state management)
- **Lucide React** (Iconography)

### Backend
- **Flask** (Python 3.10+)
- **SQLAlchemy** (PostgreSQL via Supabase)
- **Gemini 2.5 Flash** (Reasoning & Tutoring)
- **OpenAI Whisper** (Audio processing)
- **Paddle** (Subscription & Billing)

## 📦 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- API Keys: Supabase, Gemini, OpenAI, Paddle

### Quick Start
1. **Clone & Setup**:
   ```bash
   git clone <repo-url>
   cd studypulse-ai
   cp .env.example .env
   ```
2. **Launch Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python wsgi.py
   ```
3. **Launch Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📂 Project Structure
- `frontend/`: React application and design system.
- `backend/app/`: Flask blueprints, services, and models.
- `backend/tests/`: Pytest suites for API verification.
- `e2e/`: Playwright end-to-end tests.

## 📄 License
MIT License. Created for the StudyPulse AI Pakistani Founder.
