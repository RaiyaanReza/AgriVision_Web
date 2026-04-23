# AgriVision Project Context

AgriVision is a crop disease detection prototype that combines a YOLO-based diagnosis pipeline with a React frontend and a FastAPI backend. The project now also includes a lightweight SQLite-backed treatment knowledge base scaffold so document upload and RAG-style retrieval can be demonstrated locally without external API keys.

## 🏗️ Project Architecture
- **Phase 1: Crop Classification** - A YOLO26-cls classification model detects the type of crop in the image.
- **Phase 2: Agentic Routing** - Using LangGraph, a `router_agent` checks the confidence of the crop detection. If confidence < 0.6, it halts the pipeline with an error. If >= 0.6, it routes to the specific disease model.
- **Phase 3: Disease Detection** - A crop-specific YOLO26-cls model (e.g., Potato, Rice, Corn) is loaded dynamically to detect the specific disease or health status.
- **Phase 4: API & Frontend** - A FastAPI backend serves prediction, document, and RAG-ready endpoints, while a React (Vite) frontend provides the user interface.
- **Phase 5: Knowledge Base Scaffold** - Treatment files can now be stored in SQLite, queried through a local retrieval endpoint, and later upgraded to LangChain/LLM-backed responses when API keys are added.

## 📁 File Structure & Specific Paths

### 🧬 Core Backend (Python 3.10+)
- `backend/main.py`: FastAPI application entry point, CORS, startup DB init, and API routes for health, prediction, documents, and RAG querying.
- `backend/config.py`: Configuration for confidence thresholds and model path mappings.
- `backend/schemas/response.py`: Pydantic models for API request/response validation.
- `backend/services/image_processor.py`: PIL-based image validation, resizing (640x640), and preprocessing.
- `backend/services/knowledge_base.py`: SQLite-backed document storage and local retrieval logic for treatment knowledge queries.
- `backend/models/crop_classifier.py`: YOLO wrapper for the base `Crops Classifier` model.
- `backend/models/disease_models.py`: `DiseaseModelRegistry` class for dynamic loading of specialized crop models.

### 🤖 AI Agents (LangGraph)
- `backend/agents/state.py`: `WorkflowState` (TypedDict) defining the image, crop_result, disease_result, and route_decision.
- `backend/agents/router_agent.py`: `crop_classifier_node` - Logic for determining if the crop is valid and routing next.
- `backend/agents/disease_agent.py`: `disease_detector_node` - Logic for invoking the registry and running disease inference.
- `backend/agents/workflow.py`: `StateGraph` definition, node registration, conditional edges, and the `run_workflow` runner.

### 🧠 Model Weights (.pt)
- `Models/Crops Classifier/best.pt`: Initial classifier (detects: Rice, Potato, Corn, Brassica, etc.)
- `Models/Brassica/best.pt`: Specific disease model for Brassica.
- `Models/Corn/best.pt`: Specific disease model for Corn.
- `Models/Potato/best.pt`: Specific disease model for Potato.
- `Models/Rice/best.pt`: Specific disease model for Rice.

### 🖼️ Test Assets
- `Models/Test Images/`: Exhaustive directory categorized by [Crop]__[Disease] containing sample .jpg files for verification.

### 🎨 Frontend (React + Vite)
- `frontend/src/App.jsx`: Route shell that lazy-loads `Home`, `Treatments`, `History`, and `About`.
- `frontend/src/main.jsx`: React mount point.
- `frontend/src/index.css`: Tailwind CSS entry point with the darker green theme tokens.
- `frontend/src/App.css`: Present but currently empty.
- `frontend/src/pages/Home.jsx`: Main diagnosis page with premium gradient hero, feature cards, upload/result workflow, and lightweight motion transitions.
- `frontend/src/pages/Treatments.jsx`: Knowledge base management page with document search, upload modal, and RAG query UI.
- `frontend/src/pages/History.jsx`: Local session history view for previous scan results.
- `frontend/src/components/prediction/ImageUploadZone.jsx`: Upload area with improved grid-like presentation, preview handling, and processing overlay motion.
- `frontend/src/components/documents/DocumentUploadForm.jsx`: Upload form for PDF/JSON/TXT knowledge documents plus metadata.
- `frontend/src/services/documentService.js`: Frontend service layer for `/documents` and `/rag/query`, with local fallback behavior if backend endpoints are unavailable.
- `frontend/package.json`: Frontend dependency list.

## ✅ Current Frontend Readiness
- The frontend is functional and componentized under `src/pages/`, `src/components/`, `src/hooks/`, and `src/services/`.
- The homepage has already been upgraded with a darker green gradient style and smooth but lightweight motion.
- The image upload area has been improved so preview and processing states look cleaner and more modern.
- The Treatments page supports document upload and query UI against the backend knowledge base.
- The History page is active and visually aligned with the updated theme.

## 🚀 Execution Commands
- **Backend (recommended on this machine):** `& "E:\CSE499 Prototype\backend\venv\Scripts\python.exe" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000`
- **Frontend:** `cd frontend; npm run dev -- --host 0.0.0.0 --port 5173`

## 🛠️ API Interface
- **GET /api/health**
  - Output: `{ "status": "ok" }`
- **POST /api/predict**
  - Input: `multipart/form-data` with field `image`
  - Output: `PredictResponse` (JSON) containing `success`, `crop_result`, and `disease_result` (with boxes).
- **GET /api/documents**
  - Output: list of uploaded treatment knowledge documents from SQLite.
- **POST /api/documents**
  - Input: `multipart/form-data` with fields `file`, `title`, `crop_type`, `disease_name`, `content`, `tags`
  - Output: stored document record.
- **DELETE /api/documents/{doc_id}**
  - Output: deletion confirmation JSON.
- **POST /api/rag/query**
  - Input: JSON with `question`, optional `cropType`/`crop_type`, and optional `disease_name`
  - Output: ranked local retrieval results and source document references.

## 🗄️ Current Knowledge Base Status
- SQLite persistence is implemented via `backend/services/knowledge_base.py`.
- Uploaded documents can be stored and queried without any external API key.
- JSON/TXT-style content is extractable today; PDF upload is accepted, with placeholder extraction behavior ready for future parser integration.
- The current retrieval mode is local and deterministic, intended as a safe bridge to future LangChain + LLM integration.
- The database is local-only and ignored by git via `.gitignore`.

## 💡 Important Context for LLMs
- The workflow state includes a PIL `Image` object which is not serializable by default LangGraph checkpointers.
- `CROP_NAME_MAPPING` in `config.py` or `router_agent.py` may be used to align YOLO class labels with folder-based model keys.
- All backend imports use **Relative Imports** (e.g., `from ..config import ...`).
- The frontend is no longer a single-file UI; design changes should target the relevant page/component instead of assuming everything lives in `App.jsx`.
- The backend is intentionally kept runnable without cloud dependencies; future LLM integration should be additive and must not break local fallback behavior.
