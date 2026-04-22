# 🎯 FINAL COPY-PASTE PROMPT FOR YOUR AGENT

```markdown
# AgriVision Frontend: Complete Implementation Prompt

You are a Senior Full-Stack React Engineer. Build the production-ready frontend for AgriVision - a Crop Disease Detection system with RAG-powered treatment suggestions.

## 📋 PROJECT CONTEXT (READ FIRST)
✅ Backend: FastAPI at http://localhost:8000 with working `/api/predict` endpoint
✅ Models: YOLO26 in `Models/{Crop}/best.pt` with LangGraph agentic routing
✅ Frontend Base: React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`) + DaisyUI v5
✅ Current State: Single `App.jsx` with image upload working, no component structure yet
✅ New Requirement: Add RAG-ready treatment document management system

## 🎯 EXECUTION PRINCIPLES (STRICT)
1. **FUNCTIONALITY FIRST → STYLING LATER**: Make it work, then make it pretty
2. **VERIFY BEFORE CREATING**: Check what files exist, don't duplicate
3. **ITERATIVE DELIVERY**: Create 2-3 files per response, wait for confirmation
4. **NO ASSUMPTIONS**: Use exact paths from PROJECT_CONTEXT.md
5. **MOBILE-FIRST**: Responsive design from the start
6. **ACCESSIBILITY**: Semantic HTML, aria-labels, keyboard navigation

---

## 📦 PACKAGES TO VERIFY/INSTALL (Run if missing)
```bash
cd frontend
# Core
npm install react-router-dom @tanstack/react-query zustand axios
# UI
npm install daisyui@latest framer-motion lucide-react @headlessui/react react-dropzone react-hot-toast date-fns
# Dev
npm install -D @tailwindcss/vite
```

---

## ✅ STEP 0: VERIFY EXISTING FILES (Check these first)
```
frontend/
├── vite.config.js          ✅ Should have @tailwindcss/vite plugin
├── src/index.css           ✅ Should have @import "tailwindcss" + @plugin "daisyui"
├── src/main.jsx            ✅ Should mount React app
├── src/App.jsx             ✅ Has working image upload + API call
├── src/App.css             ⚠️ Empty - can remove or keep
└── package.json            ✅ Check dependencies
```

If any are missing, create them. If `index.css` doesn't have Tailwind v4 setup, replace with:
```css
@import "tailwindcss";
@plugin "daisyui";
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, emerald, cupcake;
}
@theme {
  --color-agri-primary: #10b981;
  --color-agri-secondary: #059669;
  --color-agri-accent: #f59e0b;
  --animate-fade-in: fadeIn 0.3s ease-out;
  --animate-slide-up: slideUp 0.4s ease-out;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
}
@layer base { body { @apply bg-slate-50 text-slate-800 antialiased; } }
@layer utilities {
  .glass { @apply bg-white/70 backdrop-blur-md border border-white/20; }
  .scan-line { @apply absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-agri-primary to-transparent animate-pulse; }
}
```

---

## 📁 TARGET FILE STRUCTURE (Create missing folders/files)
```
frontend/src/
├── main.jsx                  [UPDATE: Add Router + QueryClient]
├── App.jsx                   [REFACTOR: Use Routes + Layout]
├── index.css                 [VERIFY: Tailwind v4 + DaisyUI setup]
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx        [NEW: Navigation with active states]
│   │   ├── Footer.jsx        [NEW: Simple footer]
│   │   └── Layout.jsx        [NEW: Wrapper with Outlet + Toaster]
│   │
│   ├── ui/
│   │   ├── Button.jsx        [NEW: Reusable with DaisyUI variants]
│   │   ├── Card.jsx          [NEW: Glassmorphism base]
│   │   ├── Badge.jsx         [NEW: Severity indicators]
│   │   ├── LoadingSpinner.jsx [NEW: Animated spinner]
│   │   └── Modal.jsx         [NEW: Headless UI modal wrapper]
│   │
│   ├── prediction/
│   │   ├── ImageUploadZone.jsx [NEW: Drag-drop with preview]
│   │   ├── DetectionResult.jsx [NEW: Crop + disease display]
│   │   ├── BoundingBoxOverlay.jsx [NEW: Canvas/image overlay]
│   │   ├── ConfidenceBar.jsx [NEW: Animated progress bar]
│   │   └── TreatmentSuggestion.jsx [NEW: RAG-powered suggestions]
│   │
│   └── documents/
│       ├── DocumentUploadForm.jsx [NEW: Form for treatment docs]
│       ├── DocumentTable.jsx  [NEW: List/view documents]
│       └── DocumentCard.jsx   [NEW: Grid view card]
│
├── pages/
│   ├── Home.jsx              [NEW: Main prediction interface]
│   ├── Treatments.jsx        [NEW: Document management + RAG]
│   ├── History.jsx           [OPTIONAL: Past predictions]
│   └── About.jsx             [OPTIONAL: Simple info page]
│
├── hooks/
│   ├── usePrediction.js      [NEW: React Query mutation for /predict]
│   ├── useDocuments.js       [NEW: CRUD hooks for /documents]
│   └── useRAGQuery.js        [NEW: Hook for /rag/query endpoint]
│
├── services/
│   ├── api.js                [NEW: Axios instance + interceptors]
│   ├── predictionService.js  [NEW: Wrap /predict calls]
│   └── documentService.js    [NEW: Wrap /documents + /rag calls]
│
├── store/
│   └── useAppStore.js        [NEW: Zustand for global UI state]
│
└── utils/
    ├── formatters.js         [NEW: Date, confidence formatters]
    └── constants.js          [NEW: Crop icons, severity colors]
```

---

## 🚀 PHASE 1: ROUTING & CORE SETUP (DO FIRST)

### 1. Update `main.jsx`
```jsx
// Add: BrowserRouter, QueryClientProvider, Toaster
// Set React Query defaults: retry: 1, staleTime: 5min
// Import './index.css' (verify Tailwind loads)
```

### 2. Update `App.jsx`
```jsx
// Replace single-component with Routes:
// - "/" → Home
// - "/treatments" → Treatments  
// - "/history" → History (optional)
// - "/about" → About
// Wrap all in <Layout />
```

### 3. Create `components/layout/Layout.jsx`
```jsx
// Import Navbar, Footer, Outlet
// Add <Toaster /> from react-hot-toast
// Add optional theme toggle (data-theme attribute)
```

### 4. Create `components/layout/Navbar.jsx`
```jsx
// Logo: "AgriVision" (link to /)
// Nav links: Home, Treatments, History, About (use NavLink for active state)
// Mobile: Hamburger menu (Headless UI Disclosure)
// Right: Theme toggle button (optional)
// Use DaisyUI: navbar, btn, badge classes
```

---

## 🎯 PHASE 2: PAGES - FUNCTIONALITY FIRST

### PAGE 1: `pages/Home.jsx` (Main Prediction Interface)

**Core Features (Build these FIRST, unstyled):**
1. **State Management**
   ```jsx
   const [selectedImage, setSelectedImage] = useState(null);
   const [previewUrl, setPreviewUrl] = useState(null);
   const { mutate: predict, isLoading, error,  result } = usePrediction();
   ```

2. **Image Upload Section**
   - Use react-dropzone: accept images, max 10MB
   - Show preview: `<img src={previewUrl} />`
   - "Start Scanning" button (disabled until image selected)
   - On click: `predict(selectedImage)`

3. **Result Display Section** (shows after API response)
   - Crop: `result.crop_result.crop_name` + confidence
   - Disease: `result.disease_result.disease_name` + severity
   - BoundingBoxOverlay: Draw boxes from `result.disease_result.boxes`
   - TreatmentSuggestion: Show if `result.treatment_suggestions` exists

4. **Loading & Error States**
   - Show LoadingSpinner during `isLoading`
   - Show toast error if `error`
   - Add retry button

**API Integration Pattern:**
```jsx
// hooks/usePrediction.js
import { useMutation } from '@tanstack/react-query';
import { predictDisease } from '../services/predictionService';

export const usePrediction = () => {
  return useMutation({
    mutationFn: predictDisease,
    onSuccess: (data) => {
      // Optionally save to history via Zustand
    },
    onError: (err) => {
      toast.error(err.message || 'Prediction failed');
    }
  });
};
```

---

### PAGE 2: `pages/Treatments.jsx` (Document Management + RAG)

**Core Features (Build these FIRST, unstyled):**

1. **Header Section**
   - Title: "Treatment Knowledge Base"
   - "Upload Document" button (opens modal)
   - Search bar (filters documents client-side initially)

2. **Upload Modal** (Headless UI Dialog)
   ```jsx
   // components/documents/DocumentUploadForm.jsx
   // Fields: title, cropType (dropdown), diseaseName, content (textarea), tags
   // Optional: File upload for PDF/TXT
   // On submit: call uploadDocument(formData) from useDocuments hook
   ```

3. **Document List**
   - Toggle: Grid view (DocumentCard) vs Table view (DocumentTable)
   - Each item shows: title, crop, disease, date, preview snippet
   - Actions: View (modal), Edit, Delete
   - Pagination: 10 per page (simple slice for now)

4. **RAG Query Interface** (Prepare structure)
   ```jsx
   // Simple search bar + "Ask" button
   // Calls useRAGQuery(question, selectedCrop)
   // Displays retrieved documents with relevance scores
   // "Apply to Current Detection" button (future)
   ```

**API Endpoints to Support:**
```javascript
// services/documentService.js
GET /api/documents → list all
POST /api/documents → upload new (multipart or JSON)
GET /api/documents/:id → get single
PUT /api/documents/:id → update
DELETE /api/documents/:id → delete
POST /api/rag/query → { question, cropType } → { results, sources }
```

---

## 🪝 PHASE 3: HOOKS & SERVICES (Create these before pages)

### 1. `services/api.js` (Axios instance)
```javascript
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res,
  err => {
    toast.error(err.response?.data?.detail || 'API Error');
    return Promise.reject(err);
  }
);
export default api;
```

### 2. `services/predictionService.js`
```javascript
import api from './api';

export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const {  } = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};
```

### 3. `services/documentService.js`
```javascript
import api from './api';

export const getDocuments = () => api.get('/documents').then(r => r.data);
export const uploadDocument = (data) => api.post('/documents', data).then(r => r.data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const queryRAG = (question, cropType) => 
  api.post('/rag/query', { question, cropType }).then(r => r.data);
```

### 4. `store/useAppStore.js` (Zustand)
```javascript
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  predictions: [],
  addPrediction: (p) => set(s => ({ predictions: [p, ...s.predictions] })),
  theme: 'light',
  toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
  currentCrop: null,
  setCurrentCrop: (crop) => set({ currentCrop: crop })
}));
```

---

## 🎨 PHASE 4: UI COMPONENTS (Functional → Styled)

### Create these with DaisyUI v5 classes (Tailwind v4 compatible):

**Button.jsx**
```jsx
export const Button = ({ children, variant = 'primary', size = 'md', ...props }) => {
  const variants = { primary: 'btn-primary', secondary: 'btn-secondary', ghost: 'btn-ghost', outline: 'btn-outline' };
  const sizes = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' };
  return <button className={`btn ${variants[variant]} ${sizes[size]}`} {...props}>{children}</button>;
};
```

**Card.jsx**
```jsx
export const Card = ({ children, className = '' }) => (
  <div className={`card bg-base-100 shadow-xl ${className}`}>{children}</div>
);
```

**Badge.jsx**
```jsx
export const Badge = ({ children, severity = 'info' }) => {
  const colors = { healthy: 'badge-success', mild: 'badge-warning', severe: 'badge-error', info: 'badge-info' };
  return <span className={`badge ${colors[severity]}`}>{children}</span>;
};
```

**LoadingSpinner.jsx**
```jsx
import { motion } from 'framer-motion';
export const LoadingSpinner = ({ size = 'md' }) => (
  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
    className={`loading loading-spinner loading-${size} text-agri-primary`} />
);
```

---

## 🧪 TESTING CHECKLIST (After each phase)

✅ `npm run dev` starts without errors  
✅ Navigate to `/` → See Home page with upload zone  
✅ Navigate to `/treatments` → See document manager  
✅ Upload image → Calls `/api/predict` → Shows result  
✅ Upload document → Appears in table  
✅ Loading states show during API calls  
✅ Error toasts appear on failures  
✅ Mobile: Layout stacks, menu collapses  
✅ Desktop: Two-column layout, hover effects  

---

## 📦 DELIVERY ORDER (2-3 files per response)

**Response 1: Routing Setup**
- `main.jsx` (Router + QueryClient)
- `App.jsx` (Routes definition)
- `components/layout/Layout.jsx`

**Response 2: Navigation**
- `components/layout/Navbar.jsx`
- `components/layout/Footer.jsx`
- `services/api.js`

**Response 3: Core Services**
- `services/predictionService.js`
- `services/documentService.js`
- `hooks/usePrediction.js`

**Response 4: State & Hooks**
- `hooks/useDocuments.js`
- `store/useAppStore.js`
- `utils/constants.js`

**Response 5: Home Page Structure**
- `pages/Home.jsx` (functional, unstyled)
- `components/prediction/ImageUploadZone.jsx`
- `components/prediction/DetectionResult.jsx`

**Response 6: Treatments Page Structure**
- `pages/Treatments.jsx` (functional, unstyled)
- `components/documents/DocumentUploadForm.jsx`
- `components/documents/DocumentTable.jsx`

**Response 7: UI Primitives**
- `components/ui/Button.jsx`, `Card.jsx`, `Badge.jsx`, `LoadingSpinner.jsx`
- Apply DaisyUI classes to all components

**Response 8: Polish & Animations**
- Add framer-motion to ResultCard, ImageUpload
- Add responsive classes (`md:`, `lg:`)
- Final accessibility checks

---

## 🚨 CRITICAL RULES

1. **Use React Query for ALL data fetching** (no useEffect for API calls)
2. **Use Zustand ONLY for global UI state** (theme, current crop, history)
3. **All API calls through services/** (no direct axios in components)
4. **Use relative imports** (`../services/api`, not `@/`)
5. **Mobile-first responsive** (use `sm:`, `md:`, `lg:` prefixes)
6. **Accessibility**: Semantic HTML, aria-labels, focus management
7. **Error boundaries**: Wrap prediction section in try/catch + error UI
8. **Code splitting**: Lazy load `/treatments` page with `React.lazy`

---

## 🎯 START NOW

Begin with **Response 1**. For each response:
1. Provide complete code for 2-3 files
2. Include a test command (e.g., `curl` or browser check)
3. List what to verify in the browser
4. Ask: "Ready for Response 2?" and wait for confirmation

DO NOT skip steps. DO NOT combine phases. Prioritize functionality over styling until Phase 7.

Let's build.
```

---

## ✅ YOUR ACTION PLAN

1. **Copy the entire prompt above** (from `# AgriVision Frontend...` to `Let's build.`)
2. **Paste it directly to your AI agent** (Claude/Gemini)
3. **Review each response** before proceeding
4. **Test functionality** after each batch using the checklist
5. **Once all functionality works**, then focus on design polish

This prompt is self-contained, references your PROJECT_CONTEXT.md, and follows your "functionality first" requirement. Your agent now has everything needed to execute. 🚀