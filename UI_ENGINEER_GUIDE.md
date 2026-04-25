# UI Engineer Guide — For Web LLM Handoff

This document tells you **exactly which files to copy** when you want a web LLM (ChatGPT, Claude, etc.) to improve a specific part of the UI.

---

## Project Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS v4** with custom theme (`frontend/src/index.css`)
- **React Router v7** (`frontend/src/App.jsx`)
- **Lucide React** icons (no custom icon deps)
- **Framer Motion** for animations (used sparingly)
- **Axios** for API calls
- **React Hot Toast** for notifications
- **i18next** for internationalization

---

## File Bundles for Web LLM

When asking a web LLM to improve UI, **always include these base files** plus the specific page/component files:

### Base Files (include for ANY UI request)
```
frontend/src/index.css          ← Tailwind theme, colors, animations
frontend/src/App.jsx            ← Routes definition
frontend/src/components/layout/Layout.jsx   ← Page shell (Navbar + Footer + main)
frontend/src/components/layout/Navbar.jsx   ← Top navigation
```

---

## 1. AgriBot Chat Page (`/chat`)

**Goal:** Redesign chat layout, message bubbles, input bar, welcome screen.

**Files to send:**
```
Base Files (above) +
frontend/src/pages/AgriBot.jsx
```

**What this page does:**
- Full-screen ChatGPT-style chat interface
- Streams SSE responses from `POST http://localhost:8000/api/chat/stream`
- Supports image upload + text messages
- Welcome screen with suggestion chips
- Auto-resizing textarea input

**Key state:**
- `messages[]` — `{ id, type: 'user'|'bot', content, image?, timestamp, isStreaming?, error? }`
- `inputMessage` — current text input
- `selectedImage` — `{ file, preview, base64 }`
- `isLoading` — send in progress

**If LLM changes data structures, also update:**
- Nothing else (self-contained page)

---

## 2. History Page (`/history`)

**Goal:** Redesign stat cards, list layout, filters, empty states.

**Files to send:**
```
Base Files (above) +
frontend/src/pages/History.jsx
```

**What this page does:**
- Fetches prediction history from `GET /api/predictions/history?limit=50`
- Shows 3 stat cards (Total, Diseases, Healthy)
- Filter tabs: All / Diseases / Healthy
- Clickable list items with diagnosis, confidence, date, treatment preview

**Key state:**
- `predictions[]` — API response array
- `filter` — "all" | "disease" | "healthy"
- `loading` / `error`

**If LLM changes data structures, also update:**
- Nothing else (self-contained page)

---

## 3. Prediction Page (`/predict`)

**Goal:** Redesign upload panel, result cards, loading states, diagnosis display.

**Files to send:**
```
Base Files (above) +
frontend/src/pages/Prediction.jsx
```

**What this page does:**
- Drag-and-drop or click-to-upload image
- Shows preview with reset button
- "Detect Disease" button sends to `POST /api/predict`
- Results panel shows: crop type, disease name, confidence, treatment plan
- Loading spinner with branded animation

**Key state:**
- `selectedFile` / `preview` — image upload
- `loading` — analysis in progress
- `result` — `{ class, confidence, is_disease, treatment }`
- `error` — display error message

**If LLM changes result display, also check:**
- `frontend/src/components/prediction/` — reusable result panels (optional)

---

## 4. Home Page (`/`)

**Goal:** Redesign hero, feature grid, scan CTA, footer.

**Files to send:**
```
Base Files (above) +
frontend/src/pages/Home.jsx
frontend/src/components/home/HomeHero.jsx
frontend/src/components/home/FeatureHighlights.jsx
frontend/src/components/home/ScanExperienceSection.jsx
frontend/src/components/home/ResultsStage.jsx
```

**What this page does:**
- Marketing landing with hero image + CTA buttons
- Feature highlight section
- Embedded scan/upload experience
- Results display when prediction completes

**Key hooks used:**
- `usePrediction()` — handles image upload + API call
- `useDiseaseSolution()` — fetches treatment after prediction

**If LLM changes scan flow, also update:**
- `frontend/src/hooks/usePrediction.js`
- `frontend/src/hooks/useDiseaseSolution.js`

---

## 5. Layout / Navbar / Footer (Global)

**Goal:** Redesign navigation, theme toggle, language switcher, footer.

**Files to send:**
```
frontend/src/index.css
frontend/src/App.jsx
frontend/src/components/layout/Layout.jsx
frontend/src/components/layout/Navbar.jsx
frontend/src/components/layout/Footer.jsx
frontend/src/store/useAppStore.js   ← theme state
frontend/src/store/languageStore.js ← language state
```

**What these control:**
- `Navbar.jsx` — Fixed top nav with scroll-aware background blur
- `Footer.jsx` — Site-wide footer
- `Layout.jsx` — Wraps all pages, applies theme class to `<html>`
- Theme toggle switches `dark` class on `document.documentElement`

---

## 6. Theme / Design Tokens

**Goal:** Change colors, spacing, typography globally.

**Files to send:**
```
frontend/src/index.css
```

**Current theme values:**
```css
--color-agri-primary: #0f766e
--color-agri-secondary: #065f46
--color-agri-accent: #34d399
--color-agri-bg: #f0f7f5
--color-agri-bg-dark: #0f172a
```

**Dark mode pages now use direct colors (not theme vars):**
- Background: `#0d1117` (GitHub dark)
- Card background: `#161b22`
- Border: `border-gray-800/60`
- Accent: `emerald-500`, `emerald-600`

---

## API Contracts (for context)

Include this snippet when asking LLMs to redesign pages that consume data:

### Prediction Result
```json
{
  "status": "success",
  "data": {
    "class": "Brassica - Cauliflower__Bacterial_Spot",
    "confidence": 0.98,
    "is_disease": true,
    "treatment": "string with markdown-like bullets"
  }
}
```

### History Item
```json
{
  "id": 1,
  "image_path": "uploads/upload_2026... .jpg",
  "predicted_class": "Potato - Potato__Late_Blight",
  "confidence": 0.865,
  "is_disease": true,
  "created_at": "2026-04-25T05:35:16",
  "treatment": {
    "treatment_text": "...",
    "source": "Gemini AI"
  }
}
```

### Chat Stream
SSE format:
```
data: {"chunk": "some text"}
data: {"chunk": " more text"}
data: [DONE]
```

---

## Quick Reference: What to Copy for Each Request

| You want to improve... | Copy these files |
|------------------------|------------------|
| Chat UI | `Layout.jsx`, `Navbar.jsx`, `AgriBot.jsx`, `index.css` |
| History UI | `Layout.jsx`, `Navbar.jsx`, `History.jsx`, `index.css` |
| Prediction UI | `Layout.jsx`, `Navbar.jsx`, `Prediction.jsx`, `index.css` |
| Home landing | `Layout.jsx`, `Navbar.jsx`, `Home.jsx`, `HomeHero.jsx`, `FeatureHighlights.jsx`, `ScanExperienceSection.jsx`, `ResultsStage.jsx`, `index.css` |
| Navbar / nav | `Layout.jsx`, `Navbar.jsx`, `Footer.jsx`, `useAppStore.js`, `index.css` |
| Global theme | `index.css`, `Layout.jsx` |

---

## Notes for LLMs

1. **Do NOT change API URLs** — keep `http://localhost:8000/api/...`
2. **Do NOT add new npm packages** unless explicitly asked
3. **Keep Tailwind classes** — no inline styles
4. **Preserve React hooks** — `useState`, `useEffect`, `useRef`, `useNavigate`
5. **Preserve data shapes** — if you change how `result` or `messages` are rendered, keep the original structure
6. **Lucide icons only** — import from `lucide-react`
7. **Dark mode first** — most pages now use `#0d1117` background unconditionally
