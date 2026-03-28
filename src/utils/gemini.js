import { speak } from './tts';

export async function callGemini(prompt, imageBase64 = null) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    speak("Lume is not configured. API key is missing.");
    throw new Error("API Key is missing");
  }

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const parts = [{ text: prompt }];

  if (imageBase64) {
    let mimeType = "image/jpeg";
    let cleanBase64 = imageBase64;

    if (imageBase64.startsWith("data:")) {
      const p = imageBase64.split(";base64,");
      mimeType = p[0].split(":")[1];
      cleanBase64 = p[1];
    }
    
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: cleanBase64
      }
    });
  }

  const body = {
    contents: [{ parts }]
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      const msg = errorData?.error?.message || "Unknown API Error";
      speak("Lume encountered an error. Please try again.");
      throw new Error(msg);
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    // Strip all asterisks (*) to prevent TTS from speaking them
    return rawText.replace(/\*/g, '').trim();

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      speak("Request timed out. Please try again.");
      throw new Error("Request timed out after 40 seconds");
    } else {
      speak("Network error. Please check your connection.");
      throw error;
    }
  }
}
