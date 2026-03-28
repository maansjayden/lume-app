# LUME — AI-Native Accessibility Super-App

**Built for the Isazi AI for Accessibility Hackathon 2026**  
**Team:** Jayden Maans, Anita, Nstepiseng

*Built by AI Natives. Designed with the user, not for the user.*

---

## The Problem
During the hackathon, we spoke directly to an inclusivity ambassador with visual impairment. She outlined three non-negotiable barriers to her daily independence:
1. **Data Cost:** She cannot afford to burn mobile data for continuous cloud AI processing.
2. **Food Safety:** At a restaurant, she needs to scan a menu and know immediately if a dish contains hidden allergens (like nuts or dairy), not just the name of the dish.
3. **Environmental Navigation:** At a traffic light (robot), she needs to know exactly when it is safe to cross, or if there is a physical obstacle in her path.

LUME is built around her voice, not our assumptions.

## The Solution
LUME is an audio-first Progressive Web App (PWA) requiring **zero visual navigation**. The entire screen is a single tap zone, users switch modes entirely via voice commands, and shakes trigger a new capture.

### The Four Modules
* **Eye + Feel:** Point the camera, and the AI describes the scene with both practical details and emotional context (e.g., "The room feels warm and celebratory").
* **SafeScan:** Point at food or a menu to identify the dish, list ingredients, and explicitly flag severe allergens.
* **Navigate:** Point the camera at surroundings for real-time directional audio cues, specifically prioritizing traffic lights, steps, and doors.
* **Read-LUME:** Upload a complex document (like a PDF), and the AI simplifies the text into plain language for cognitive accessibility and dyslexia support.

## Tech Stack
* **Frontend:** React PWA (Vite). Fully functional in standard mobile browsers. 
* **Vision Model:** Google Gemini 2.0 Flash via REST API. Selected for speed, 1M token context, and multimodal accuracy.
* **Data Efficiency:** Client-side Canvas API image compression reduces every API payload to under 50KB.
* **Native Web APIs:** Web Speech API for Text-to-Speech and Speech-to-Text (voice routing). Device Motion API for shake-to-capture.

## Local Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file in the root directory and add your API key: `VITE_GEMINI_API_KEY=your_key_here`.
4. Run `npm run dev` and open the local network link on a mobile device to test camera and voice APIs.

## License
MIT License
