# Next Work: Audio Integration & Complex Improvements

## 1. Native Audio Input (STT) without API Keys
**Goal:** Allow illiterate farmers to speak symptoms or questions in Bangla without incurring API costs.
**Implementation:**
- Use the HTML5 Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`).
- Set the recognition language to `bn-BD` (Bangla - Bangladesh).
- Add a large, high-contrast microphone button in the Chat/Bot UI.
- When the user holds or taps the button, capture the transcript and automatically submit it as a chat query.

## 2. Cached Audio Output (TTS) to Save Tokens
**Goal:** Provide spoken Bangla answers while strictly avoiding repeated API limits/costs.
**Implementation:**
- Use a local/free TTS library on the backend (e.g., `gTTS` - Google Text-to-Speech) which doesn't require authenticated API tokens.
- Whenever a disease is detected, generate the Bangla audio for its "Treatment Plan".
- Save the `.mp3` file in `backend/data/audio/` using the disease ID as the filename.
- Add an `audio_url` field to `treatments.json`.
- When the frontend receives a detection result, it will show an audio play button that streams the cached `.mp3` directly from the backend, costing 0 LLM/TTS tokens for all subsequent requests.

## 3. PWA Offline Sync (Complex but Effective)
**Goal:** Farmers often have poor internet in the fields. The app should still function minimally.
**Implementation:**
- Enhance the current Service Worker to aggressively cache the UI shell and `treatments.json`.
- Allow the user to capture an image offline. Save the image to IndexedDB.
- Queue a background sync job. When the internet returns, the background sync automatically uploads the image to the `/api/predict` endpoint and notifies the user of the result.

## 4. On-Device Lightweight Classification (Future Enhancement)
**Goal:** Completely eliminate backend dependency for major crop diseases.
**Implementation:**
- Convert the YOLO/PyTorch `.pt` models to TensorFlow.js or ONNX format.
- Load the models directly in the React frontend.
- Run the inference on the mobile device's CPU/GPU.
- This immediately gives the result without needing server endpoints, though it will require optimizing model sizes to <15MB.