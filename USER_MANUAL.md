# AgriVision User Manual

This manual provides the essential commands and steps to run, develop, and maintain the AgriVision crop disease detection prototype.

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (3.12 recommended)
- **Node.js 18+** & **npm**
- **Git**

### Installation

1. **Clone the project:**
   ```bash
   git clone <repository_url>
   cd "CSE499 Prototype"
   ```

2. **Backend Setup:**
   ```bash
   # Create and activate virtual environment
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate

   # Install dependencies
   pip install fastapi uvicorn ultralytics langgraph pillow numpy python-dotenv requests
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

---

## 🛠️ Execution Commands

### Running Locally (Development)

**Start Backend (FastAPI):**
```bash
# From the root directory
& ".venv/Scripts/python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
- API will be available at: `http://127.0.0.1:8000`
- API Documentation (Swagger): `http://127.0.0.1:8000/docs`

**Start Frontend (Vite):**
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- App will be available at: `http://127.0.0.1:5173`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```
- The optimized static files will be in `frontend/dist`.

---

## 🔬 Testing & Verification

### Health Check
```powershell
Invoke-WebRequest -Uri http://127.0.0.1:8000/api/health
```

### Manual Prediction Test (Python)
```python
import requests
url = "http://127.0.0.1:8000/api/predict"
with open("path/to/leaf.jpg", "rb") as f:
    r = requests.post(url, files={"image": f})
print(r.json())
```

### Knowledge Base Search
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/rag/query -Body '{"question": "How to treat potato blight?"}' -ContentType "application/json"
```

---

## 📁 System Architecture

- **Backend:** FastAPI (Python) + YOLOv8 (Inference).
- **Workflow:** LangGraph for agentic routing between crop classifier and disease specialists.
- **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons + Framer Motion.
- **Data:** SQLite for local treatment knowledge storage.
- **Models:** YOLO `.pt` files located in the `Models/` directory.

---

## 🧪 Linting & Standards

**Frontend:**
```bash
cd frontend
npm run lint
```
