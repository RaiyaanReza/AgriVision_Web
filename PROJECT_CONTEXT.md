# AgriVision Project Context (Updated: 2026-04-24)

AgriVision is a crop disease detection prototype with:
- FastAPI backend for prediction, document management, and RAG querying
- YOLO-based crop + disease workflow with LangGraph routing
- React + Vite frontend with modular pages/components
- SQLite local knowledge base for treatment documents
- Optional Gemini-backed RAG answer generation when API keys are configured

## Verified Runtime Status

### Backend
- Entry: backend/main.py
- Server command:
  - & "e:/CSE499 Prototype/.venv/Scripts/python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
- Health endpoint verified:
  - GET /api/health -> 200 {"status":"ok"}

### Models and Prediction
- Verified with real sample images and explicit MIME upload
- Prediction endpoint verified:
  - POST /api/predict -> 200 with success=true
- Observed successful inference examples:
  - Brassica sample image routed to Potato model with disease output
  - Potato sample image detected with disease output
  - Rice sample image detected with disease output

### Documents and RAG
- SQLite knowledge base initialized and working
- Verified endpoints:
  - POST /api/documents/import -> created records
  - GET /api/documents -> returns stored docs
  - DELETE /api/documents/{id} -> deletion confirmed
  - POST /api/rag/query with llm=false -> local retrieval results
  - POST /api/rag/query with llm=true -> Gemini answer generated after dependency fix

### Gemini / API Key Path
- Environment has GEMINI_API_KEY_* variables in .env
- Critical fix applied in venv dependencies:
  - Installed python-dotenv (for loading .env)
  - Installed google-genai (Gemini client)
- Result:
  - LLM path now returns llm.enabled=true and non-empty answer text

## Frontend Status

### Build and Lint
- Lint command:
  - npm run lint
- Build command:
  - npm run build
- Build succeeds and produces production bundle in frontend/dist

### Modularization Update Applied
The frontend was already componentized, and was further modularized by extracting page-level blocks:

- New home components:
  - frontend/src/components/home/HomeHero.jsx
  - frontend/src/components/home/FeatureHighlights.jsx
  - frontend/src/components/home/ScanWorkflowCard.jsx

- New treatments components:
  - frontend/src/components/treatments/KnowledgeStatusBanner.jsx
  - frontend/src/components/treatments/RAGQuerySection.jsx

- Refactored pages:
  - frontend/src/pages/Home.jsx
  - frontend/src/pages/Treatments.jsx

This reduces page complexity and makes feature sections easier to maintain/test independently.

## Test Script Update

test_models.py was updated to be a more reliable integration smoke test:
- Uses real existing image paths
- Sends explicit image MIME type for /api/predict
- Validates health, prediction, document import/list, and RAG (LLM enabled)

## Current Folder Structure Guidance

Current structure is good and close to feature-oriented design. Recommended direction:

- Keep backend split by domain:
  - backend/agents for orchestration logic
  - backend/models for model wrappers/registry
  - backend/services for infrastructure adapters (RAG, DB, image IO)
  - backend/schemas for API contracts

- Keep frontend split by UI surface + behavior:
  - src/pages for route-level composition only
  - src/components/<feature> for reusable visual blocks
  - src/hooks for server-state and workflow hooks
  - src/services for API clients only
  - src/store for shared UI/app state
  - src/utils for pure helpers/constants

Optional next modularization step:
- Introduce src/features/<feature-name>/ to co-locate feature-specific components, hooks, and helper constants.

## Known Notes

- Legacy test calls without MIME type will fail predict endpoint validation by design.
- Crop label mapping in backend/config.py currently includes fallback mappings (for example Solanacea -> Potato, Wheat -> Rice), so some class outputs are intentionally remapped.
- Knowledge base currently uses deterministic local retrieval with optional Gemini answer generation layered on top.
