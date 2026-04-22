# AgriVision Project Context

AgriVision is a Crop Disease Detection prototype that uses a multi-agent LangGraph workflow and YOLOv8 models for precise agricultural diagnostics.

## 🏗️ Project Architecture
- **Phase 1: Crop Classification** - A YOLOv8 classification model detects the type of crop in the image.
- **Phase 2: Agentic Routing** - Using LangGraph, a `router_agent` checks the confidence of the crop detection. If confidence < 0.6, it halts the pipeline with an error. If >= 0.6, it routes to the specific disease model.
- **Phase 3: Disease Detection** - A crop-specific YOLOv8 model (e.g., Potato, Rice, Corn) is loaded dynamically to detect the specific disease or health status.
- **Phase 4: API & Frontend** - A FastAPI backend serves the workflow, and a React (Vite) frontend provides the user interface.

## 📁 File Structure & Specific Paths

### 🧬 Core Backend (Python 3.10+)
- `backend/main.py`: FastAPI application entry point, CORS, and `/api/predict` endpoint.
- `backend/config.py`: Configuration for confidence thresholds and model path mappings.
- `backend/schemas/response.py`: Pydantic models for API request/response validation.
- `backend/services/image_processor.py`: PIL-based image validation, resizing (640x640), and preprocessing.
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
- `frontend/src/App.jsx`: Main UI component with React-Dropzone and Axios integration. The upload panel now exposes an explicit `Start Scanning` action once an image is selected.
- `frontend/src/main.jsx`: React mount point.
- `frontend/src/index.css`: Tailwind CSS entry point.
- `frontend/src/App.css`: Present but currently empty.
- `frontend/package.json`: Frontend dependency list.

## ✅ Current Frontend Readiness
- The frontend is functional and connected to the backend endpoint at `POST /api/predict`.
- The UI is still implemented as a single `App.jsx` file rather than a componentized `src/components/` tree.
- There is no existing component scaffold to paste design fragments into yet, so future design work can either stay inside `App.jsx` or be split into components next.

## 🚀 Execution Commands
- **Backend:** `uvicorn backend.main:app --reload --port 8000` (ensure `backend/venv` is activated)
- **Frontend:** `cd frontend; npm run dev`

## 🛠️ API Interface
- **POST /api/predict**
  - Input: `multipart/form-data` with field `image`
  - Output: `PredictResponse` (JSON) containing `success`, `crop_result`, and `disease_result` (with boxes).

## 💡 Important Context for LLMs
- The workflow state includes a PIL `Image` object which is not serializable by default LangGraph checkpointers.
- `CROP_NAME_MAPPING` in `config.py` or `router_agent.py` may be used to align YOLO class labels with folder-based model keys.
- All backend imports use **Relative Imports** (e.g., `from ..config import ...`).
- The frontend currently uses a flat layout in `App.jsx`; if a componentized structure is desired, it should be scaffolded explicitly before copying in design-only outputs.
