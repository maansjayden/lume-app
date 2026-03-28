# LUME — AI-Native Accessibility Super-App

**Built for the Isazi AI for Accessibility Hackathon 2026**  
**Team:** Jayden Maans, Anita, Nstepiseng

*Built by AI Natives. Designed with the user, not for the user.*

---

## The Solution
LUME is an audio-first Progressive Web App (PWA) requiring **zero visual navigation**. The entire screen is a single tap zone, users switch modes via voice commands, and shakes trigger a new capture.

### The Two Core Modules
*   **VISION (Default):** 
    *   **Continuous Monitoring:** Scans the environment every 4 seconds for safety.
    *   **Green Robot Priority:** Specifically identifies South African pedestrian traffic lights ("Green Robots") and announces "Safe to cross."
    *   **Obstacle Safety:** Provides haptic vibrations and voice alerts if obstacles are detected within 2 meters.
    *   **Allergy Mode:** Activated by voice ("Hey Lume, check for allergies"), Gemini scans for peanuts, gluten, or dairy.
*   **SIMPLIFY:**
    *   **Explain Like I'm 5:** Captured text or uploaded documents (PDFs/Images) are summarized into exactly 3 simple bullet points for cognitive accessibility.
    *   **Voice Activated:** Responds to "Hey Lume, simplify this."

### Global UX Features
*   **Busy Processing:** Lume immediately responds with "Lume is thinking..." to provide auditory feedback during API calls.
*   **Shake to Scan:** A physical shake gesture triggers a scan in both modules.
*   **Audio Transitions:** A "whoosh" sound effect provides feedback when switching between modules.

## Tech Stack
* **Frontend:** React PWA (Vite).
* **Vision Model:** Google Gemini 2.0 Flash via REST API.
* **Data Efficiency:** Client-side Canvas API image compression reduces every API payload to under 50KB.
* **Native Web APIs:** Web Speech API (TTS/STT), Device Motion API (Shake), and Vibration API (Haptics).

## Local Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file in the root directory: `VITE_GEMINI_API_KEY=your_key_here`.
4. Run `npm run dev`.

## License
MIT License
