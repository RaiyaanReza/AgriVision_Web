# AgriVision Project Context (Updated: 2026-04-25)

AgriVision is a crop disease detection web app with:
- **FastAPI backend** for prediction, chat, document management, and RAG querying
- **YOLO-based** crop classification + disease detection with LangGraph agent routing
- **React + Vite + Tailwind CSS** frontend with modular pages/components
- **SQLite** local database for prediction history and treatment documents
- **Gemini 3.1 Flash Lite** for RAG answer generation and treatment recommendations

## Verified Runtime Status

### Backend
- Entry: `backend/main.py`
- Start: `start_backend.bat` (port 8000)
- Health: `GET /api/health` → 200

### Models
- Crop Classifier: `backend/models/Models/Crops Classifier/best.pt` (12 MB)
- Disease Models: Brassica, Corn, Potato, Rice (3–10 MB each)
- Mappings: GourdGuava→Brassica, Solanacea→Potato, Wheat→Rice

### Prediction Pipeline
- `POST /api/predict` → uploads image → crop classify → disease detect → Gemini treatment → DB save
- DB save is non-fatal: predictions succeed even if database has issues

### Chat / AgriBot
- `POST /api/chat/stream` → SSE streaming chat with optional image upload
- Uses LangGraph agent workflow with Gemini 3.1 Flash Lite

### Documents and RAG
- SQLite knowledge base for treatment documents
- `POST /api/rag/query` with `llm=true` → Gemini-generated answers from retrieved docs

## Frontend Status

### Build
- Dev: `npm run dev` (port 5173)
- Build: `npm run build`

### Pages
| Route | File | Status |
|-------|------|--------|
| `/` | `frontend/src/pages/Home.jsx` | Redesigned, full-bleed dark |
| `/dashboard` | `frontend/src/pages/Dashboard.jsx` | Basic user dashboard scaffolded |
| `/predict` | `frontend/src/pages/Prediction.jsx` | Professional upload + results UI |
| `/crops` | `frontend/src/pages/CropLibrary.jsx` | Crop knowledge base shell implemented |
| `/history` | `frontend/src/pages/History.jsx` | Redesigned: clean stats, filter tabs, list |
| `/chat` | `frontend/src/pages/AgriBot.jsx` | Redesigned: ChatGPT-style full-screen chat |
| `/settings` | `frontend/src/pages/Settings.jsx` | Settings and preferences page |
| `/about` | `frontend/src/pages/About.jsx` | Simple composed page |

### Recent UI Fixes (2026-04-25)
- Standardized UI component library (`src/components/ui/` with `Card.jsx`, `Button.jsx`)
- Expanded Information Architecture with Dashboard, Crop Library, and Settings features.
- Wired global routing (`App.jsx`) to handle the new application structure lazily.
- Preparation ongoing for PWA offline capabilities and Prediction Drag-and-Drop flow.

## Backend Structure
- `backend/agents/` — LangGraph orchestration (router_agent, chat_agent)
- `backend/models/` — YOLO model wrappers (crop_classifier, disease_models)
- `backend/services/` — DB, RAG, Gemini client, image processor
- `backend/routes/` — API routes (chat)
- `backend/main.py` — FastAPI app with predict, history, stats endpoints

## Frontend Structure
- `src/pages/` — Route-level composition
- `src/components/layout/` — Navbar, Footer, Layout shell
- `src/components/home/` — Hero, feature highlights, scan workflow, results
- `src/components/prediction/` — Detection result panels, solution cards
- `src/components/history/` — History list, cards (legacy, now inline in page)
- `src/components/about/` — About hero, content grid
- `src/hooks/` — usePrediction, useDiseaseSolution, useRAGQuery, etc.
- `src/services/` — API clients
- `src/store/` — App state (theme, language)

## URLs
- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:5173

## Graphify Knowledge Status (Updated: 2026-04-29)

The project knowledge base has been processed using the `graphify` pipeline to enable high-efficiency context retrieval.

### Status: Complete
- **AST Analysis:** Processed all Python/JS files to map code structure and dependencies.
- **Semantic Extraction:** Processed project documentation and backend/frontend logic into indexed chunks.
- **Merging & Clustering:** All fragments merged into `.graphify_graph.json` and clustered for community-based retrieval.
- **Visualization:** Full interactive graph available at `graphify-out/knowledge_graph.html`.

### Token Efficiency Note
The knowledge graph has been distilled into **Knowledge Items (KIs)** in the `antigravity/knowledge` directory.
1. **Automated Context Retrieval:** Antigravity agents now check these KIs first, drastically reducing the need to read raw source files and saving paid API tokens.
2. **Current KIs:** Architecture Overview, Agentic Workflows, Frontend Structure.

## Backend Structure
