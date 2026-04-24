# 🌾 AgriVision - AI-Powered Crop Disease Detection

A modern full-stack web application that uses artificial intelligence to detect crop diseases from images and provide treatment recommendations.

## ✨ Features

### Phase 1 (Implemented) ✅
- **LangGraph Router Agent**: Orchestrates image classification → disease detection → Gemini AI treatment → database storage
- **Smart Prediction Pipeline**: Automatic disease detection with confidence scores
- **AI Treatment Recommendations**: Gemini-powered treatment plans for detected diseases
- **Prediction History**: SQLite database stores all predictions with treatments
- **Modern Frontend**: React + Vite + Tailwind CSS + Framer Motion animations
- **Responsive Design**: Mobile-first approach with smooth animations

### Coming Soon
- Multi-language support (English, Bengali, Spanish, Hindi)
- Offline mode with PWA capabilities
- User authentication system
- Analytics dashboard
- Document knowledge base for RAG
- Expert consultation features

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangGraph** - Agentic workflow orchestration
- **SQLAlchemy + SQLite** - Async database layer
- **Google Gemini AI** - Treatment recommendation engine
- **PyTorch + Ultralytics** - ML model inference (ready for integration)
- **Pydantic Settings** - Configuration management

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - API client
- **Lucide React** - Icons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/RaiyaanReza/AgriVision_Web.git
cd AgriVision_Web
git checkout qwen-coder
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your Gemini API key

# Initialize database and start server
python -c "from services.database import init_db; import asyncio; asyncio.run(init_db())"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on: http://localhost:8000
API Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

## 📁 Project Structure

```
AgriVision_Web/
├── backend/
│   ├── agents/           # LangGraph router agent
│   │   └── router_agent.py
│   ├── models/           # SQLAlchemy models
│   │   ├── database.py
│   │   └── models.py
│   ├── services/         # Business logic
│   │   └── database.py
│   ├── config.py         # Configuration
│   ├── main.py           # FastAPI app
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/   # Reusable components
│       │   ├── common/
│       │   ├── layout/
│       │   └── sections/
│       ├── pages/        # Route pages
│       │   ├── Prediction.jsx
│       │   └── History.jsx
│       ├── services/     # API services
│       └── hooks/        # Custom hooks
│
└── README.md
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with DB & AI status |
| POST | `/api/predict` | Upload image for disease prediction |
| GET | `/api/predictions/history` | Get paginated prediction history |
| GET | `/api/predictions/{id}` | Get specific prediction details |
| GET | `/api/user/preferences` | Get user preferences |
| PUT | `/api/user/preferences/{id}` | Update user preferences |

## 🤖 How It Works

1. **Upload Image**: User uploads a crop leaf image via the frontend
2. **Classification**: LangGraph agent routes to classifier model
3. **Disease Detection**: System determines if disease is present
4. **Treatment Generation**: If diseased, Gemini AI generates treatment plan
5. **Database Storage**: All results automatically saved to SQLite
6. **Results Display**: Frontend shows diagnosis with confidence and treatment

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite+aiosqlite:///./agrivision.db
DEBUG=True
PORT=8000
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## 📊 Database Schema

- **predictions**: Stores all image predictions with metadata
- **treatments**: AI-generated treatment plans linked to predictions
- **user_preferences**: User settings (language, theme, offline mode)
- **documents**: Knowledge base documents for future RAG implementation

## 🧪 Testing

```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm test
```

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- PlantVillage dataset for crop disease images
- Google Gemini for AI capabilities
- LangChain/LangGraph for agent orchestration
- FastAPI community

---

Built with ❤️ for sustainable agriculture
