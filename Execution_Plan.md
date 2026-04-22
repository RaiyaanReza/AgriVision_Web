# 1. Project Tree

```text
.
├── backend/
│   ├── app/
│   │   ├── __init__.py               # Initialization of the backend application package
│   │   ├── main.py                   # FastAPI application factory and entry point
│   │   ├── api/
│   │   │   ├── __init__.py           # API router initialization
│   │   │   ├── dependencies.py       # Dependency injection (e.g., model loaders, singletons)
│   │   │   ├── endpoints.py          # API route handlers for image processing requests
│   │   ├── core/
│   │   │   ├── __init__.py           # Core configuration package
│   │   │   ├── config.py             # Pydantic BaseSettings for environment variables
│   │   │   ├── exceptions.py         # Custom global exception classes and handlers
│   │   │   ├── logger.py             # Structured logging configuration
│   │   ├── models/
│   │   │   ├── __init__.py           # Data models package
│   │   │   ├── domain.py             # LangGraph state schema (TypedDict) definitions
│   │   │   ├── schemas.py            # Pydantic v2 schemas for API requests/responses
│   │   ├── services/
│   │   │   ├── __init__.py           # Business logic package
│   │   │   ├── inference.py          # YOLO model wrapper and bounding box parsing
│   │   │   ├── workflow.py           # LangGraph state machine definition and compilation
│   │   │   ├── nodes.py              # LangGraph individual node functions (crop, disease)
│   ├── tests/
│   │   ├── conftest.py               # Pytest fixtures and test client setup
│   │   ├── test_api.py               # Integration tests for FastAPI endpoints
│   │   ├── test_workflow.py          # Unit tests for LangGraph routing logic
│   ├── requirements.txt              # Production dependency locks
│   ├── .env.example                  # Template for backend environment variables
├── frontend/
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # Node.js dependencies and npm scripts
│   ├── vite.config.js                # Vite build and development configuration
│   ├── tailwind.config.js            # Tailwind CSS theme and content paths
│   ├── postcss.config.js             # PostCSS configuration for Tailwind
│   ├── src/
│   │   ├── main.jsx                  # React application mount point
│   │   ├── App.jsx                   # Root component and layout definitions
│   │   ├── components/
│   │   │   ├── ImageUploader.jsx     # Drag-and-drop file upload component
│   │   │   ├── ResultsOverlay.jsx    # Canvas overlay for drawing bounding boxes
│   │   │   ├── DiseaseInfoPanel.jsx  # Display panel for prediction confidence and text
│   │   │   ├── ErrorBoundary.jsx     # Catch-all component for React rendering errors
│   │   │   ├── ui/                   # Reusable atomic UI components (buttons, loaders)
│   │   ├── hooks/
│   │   │   ├── useAnalysis.js        # Custom hook for managing API state and fetch logic
│   │   ├── utils/
│   │   │   ├── api.js                # Axios/fetch wrapper with interceptors
│   │   │   ├── canvas.js             # Utility functions for bounding box coordinate math
│   │   ├── assets/                   # Static assets (images, icons)
├── Models/                           # Pre-trained YOLOv8 weights
│   ├── Crops Classifier/best.pt      # Primary model to route the image
│   ├── {CropName}/best.pt            # Specialized disease models (Brassica, Corn, etc.)
├── .gitignore                        # Global ignore rules for git
├── README.md                         # Comprehensive documentation for setup and deployment
```

# 2. File-by-File Specifications

## Backend Specifications

**`backend/app/main.py`**
*   **Purpose:** Initializes FastAPI app, registers CORS middleware, includes API routers, sets up global exception handlers.
*   **State:** Stateless at the app level.
*   **Error Handling:** Attaches handlers for `RequestValidationError` and custom domain exceptions.

**`backend/app/api/endpoints.py`**
*   **Classes/Functions:** `analyze_image(file: UploadFile, workflow: CompiledGraph = Depends(...))`
*   **I/O:** Receives `multipart/form-data`, returns `AnalysisResponse` schema.
*   **Error Handling:** Raises `HTTPException` for invalid file types or unreadable images.

**`backend/app/core/config.py`**
*   **Classes/Functions:** `Settings(BaseSettings)`
*   **Types:** Pydantic v2 configuration schema.
*   **Responsibilities:** Loads `MODEL_DIR`, `ALLOWED_ORIGINS`, `CONFIDENCE_THRESHOLD`.

**`backend/app/models/schemas.py`**
*   **Classes/Functions:** `BoundingBox` (x1, y1, x2, y2), `Prediction` (class_name, confidence, bbox), `AnalysisResponse` (status, crop_type, predictions, error_message).
*   **Types:** Strict Pydantic v2 models with field validators.

**`backend/app/models/domain.py`**
*   **Classes/Functions:** `AnalysisState(TypedDict)`
*   **Schema:** `image_bytes: bytes`, `detected_crop: str | None`, `crop_confidence: float`, `predictions: list[dict]`, `errors: list[str]`.

**`backend/app/services/inference.py`**
*   **Classes/Functions:** `YOLOManager` (singleton), `predict(model_path: str, image: bytes) -> list[dict]`
*   **State:** Model caching in memory to prevent reloading `.pt` files per request.
*   **Error Handling:** Captures inference failures natively, returning empty lists or throwing custom `ModelInferenceError`.

**`backend/app/services/nodes.py`**
*   **Classes/Functions:** `classify_crop(state: AnalysisState)`, `detect_disease(state: AnalysisState)`, `handle_fallback(state: AnalysisState)`
*   **I/O:** Mutates and returns partial `AnalysisState` dictionaries.
*   **Async:** Synchronous execution wrapped in `run_in_threadpool` if YOLO blocks the event loop.

**`backend/app/services/workflow.py`**
*   **Classes/Functions:** `build_graph() -> CompiledGraph`, `route_decision(state: AnalysisState) -> str`
*   **Responsibilities:** Connects `nodes.py` functions using `StateGraph`. Defines the conditional edges based on `crop_confidence`.

## Frontend Specifications

**`frontend/src/hooks/useAnalysis.js`**
*   **Classes/Functions:** `useAnalysis()`
*   **I/O:** Takes no initial arguments. Returns `{ analyze, result, loading, error, reset }`.
*   **State:** Manages `loading` (boolean), `result` (object), and `error` (string).
*   **Error Handling:** Catches network errors, non-200 responses, and updates the `error` state cleanly.

**`frontend/src/components/ImageUploader.jsx`**
*   **Classes/Functions:** `ImageUploader({ onImageSelect })`
*   **I/O:** Reads JS `File` object, passes it to parent.
*   **State:** Local state for drag-over highlighting.

**`frontend/src/components/ResultsOverlay.jsx`**
*   **Classes/Functions:** `ResultsOverlay({ imageSrc, predictions })`
*   **I/O:** Takes original image URL and bounding box array.
*   **Responsibilities:** Renders overlapping responsive `<div>` elements or an HTML5 `<canvas>` scaled accurately over the image.

**`frontend/src/utils/api.js`**
*   **Classes/Functions:** `uploadImage(file: File) -> Promise<AnalysisResponse>`
*   **Responsibilities:** Constructs `FormData`, manages timeout configurations, handles standard fetch/axios boilerplate.

# 3. Agentic Workflow Diagram (text-based)

**State Schema (`AnalysisState` TypedDict):**
*   `image_bytes` (bytes): Raw uploaded image.
*   `detected_crop` (str): Label from crop classifier (e.g., "Potato").
*   `crop_confidence` (float): Confidence score of the crop classification.
*   `disease_predictions` (list): Output of bounding boxes and diseases.
*   `status` (str): Workflow status (success, error, unrecognized_crop).

**Workflow Nodes:**
1.  **`crop_classifier_node`**: Runs Models/Crops Classifier/best.pt. Updates `detected_crop` and `crop_confidence`.
2.  **`disease_detector_node`**: Dynamically loads `Models/{detected_crop}/best.pt`. Updates `disease_predictions`.
3.  **`fallback_node`**: Registers an unrecognized crop state when confidence is too low.

**Conditional Routing (`route_decision`):**
*   **Start** $\rightarrow$ `crop_classifier_node`
*   `crop_classifier_node` $\rightarrow$ Evaluates `state["crop_confidence"]`
    *   *If confidence > threshold (e.g., 0.60) AND crop IN supported_crops:* route to `disease_detector_node`
    *   *Else:* route to `fallback_node`
*   `disease_detector_node` $\rightarrow$ **End**
*   `fallback_node` $\rightarrow$ **End**

*Async Execution:* The workflow builder utilizes LangGraph's native async capabilities (`ainvoke`). Inference blocking calls are wrapped appropriately to avoid event-loop freezing.

# 4. API Contracts

**Endpoint:** `POST /api/v1/analyze`
*   **Description:** Uploads an image, processes it through the LangGraph agent, and returns bounding boxes and diseases.
*   **Content-Type:** `multipart/form-data`
*   **Request Schema:**
    *   `file`: Binary image file (jpeg, png, webp). limit: 10MB.

*   **Success Response (200 OK):**
    ```json
    {
      "status": "success",
      "crop_type": "Potato",
      "crop_confidence": 0.95,
      "predictions": [
        {
          "class_name": "Early_Blight",
          "confidence": 0.88,
          "bbox": {"x1": 10.5, "y1": 20.0, "x2": 150.0, "y2": 200.5}
        }
      ],
      "message": "Analysis complete."
    }
    ```

*   **Fallback Response (200 OK) - Crop Unrecognized:**
    ```json
    {
      "status": "unrecognized_crop",
      "crop_type": null,
      "crop_confidence": 0.0,
      "predictions": [],
      "message": "Crop not recognized or confidence too low. Please ensure the image is clear."
    }
    ```

*   **Error Response (4xx/5xx):**
    ```json
    {
      "error": {
        "code": "INVALID_IMAGE_FORMAT",
        "message": "Uploaded file must be a valid JPEG or PNG image."
      }
    }
    ```

**Middleware & Rates:**
*   **CORS:** Configured strictly via `ALLOWED_ORIGINS` in `.env`.
*   **Rate Limiting:** IP-based token bucket (e.g., 10 requests / minute) using a lightweight memory store or internal FastAPI dependency.

# 5. Best Practices & Config Files

**.gitignore:**
```text
# Python
__pycache__/
*.py[cod]
.venv/
env/

# Node
node_modules/
dist/
.npm

# Environment
.env

# Models
# DO NOT IGNORE the .pt files if they are part of the repo, but ignore temp runs
runs/
yolov8n.pt 

# OS
.DS_Store
Thumbs.db
```

**Environment Config Pattern:**
*   Uses Pydantic `BaseSettings` reading from `.env`.
*   `.env.example` committed to repo; `.env` generated at deployment.
*   Variables: `API_HOST`, `API_PORT`, `CORS_ORIGINS`, `DEBUG_MODE`, `MODEL_BASE_PATH`.

**Logging Strategy:**
*   Level-based tracing: `INFO` for requests/responses, `DEBUG` for LangGraph node transitions, `ERROR` with stack traces for inference failures.
*   JSON structured logging for production observability.

**Testing Structure:**
*   Backend: `pytest` using `TestClient`. Focus on API contract validation, graph state mocking, and malicious file handling.
*   Frontend: `vitest` and `@testing-library/react`. Focus on hook boundaries, UI states (loading vs error), and canvas plotting math.

**Folder Conventions & Architecture:**
*   Backend utilizes Hexagonal/Clean Architecture (Endpoints $\rightarrow$ Services $\rightarrow$ Models).
*   Frontend uses colocation of components and strict separation of side-effects (hooks) from pure UI logic (components).

# 6. Execution Priority Order

*   **Phase 1: Core Functionality (Backend + Models -> Basic API)**
    *   Setup Python environment and install FastAPI, LangGraph, Ultralytics.
    *   Create YOLO manager to load existing `.pt` weights.
    *   Define Pydantic schemas and TypedDict states.
    *   Implement LangGraph nodes and compile the workflow.
    *   Expose `/api/v1/analyze` endpoint.
    *   Test via cURL/Postman.

*   **Phase 2: UI Skeleton (Frontend Structure -> Basic Fetch)**
    *   Initialize Vite + React project.
    *   Create HTML/CSS skeleton.
    *   Implement `useAnalysis` hook and `api.js`.
    *   Create basic `ImageUploader` component and wire up the fetch request to ensure end-to-end connectivity.

*   **Phase 3: State & Results Visualization**
    *   Implement `ResultsOverlay` to draw bounding boxes mathematically scaled to the user's viewport.
    *   Implement `DiseaseInfoPanel` to display formatted confidence scores.
    *   Handle fallback states (e.g., when Crop is not recognized).

*   **Phase 4: Polish & Productionization**
    *   Implement Tailwind CSS styling, responsive grid layouts.
    *   Add loading spinners, toast notifications for errors.
    *   Wrap frontend in error boundaries.
    *   Finalize `.env` setup, logging configurations, and write the README.md usage instructions.