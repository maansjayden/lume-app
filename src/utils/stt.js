import { isLumeSpeaking } from './tts';

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export const startListening = (onModuleSwitch, onSpeech) => {
  const SpeechRecognition = getSpeechRecognition();

  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-ZA';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  let isIntentionallyStopped = false;

  recognition.onresult = (event) => {
    if (isLumeSpeaking()) {
      console.log("Lume is speaking, ignoring mic input.");
      return;
    }

    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log("STT transcript:", transcript);

    if (transcript.includes('vision mode') || transcript.includes('look around')) {
      onModuleSwitch('vision');
    } else if (
      transcript.includes('simplify mode') ||
      transcript.includes('read text') ||
      transcript === 'read' ||
      transcript.includes('read mode')
    ) {
      onModuleSwitch('simplify');
    } else if (
      transcript.includes('allergy') ||
      transcript.includes('allergies') ||
      transcript.includes('alergies') ||
      transcript.includes('scan') ||
      transcript.includes('check label')
    ) {
      // If we detect an allergy/scan command, we send it to the active module via onSpeech
      // which will be handled by handleGlobalVoice in App.jsx
      if (onSpeech) onSpeech(transcript);
    } else if (onSpeech) {
      onSpeech(transcript);
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      isIntentionallyStopped = true;
      console.error("Microphone permission denied.");
      return;
    }
    console.warn("STT error (non-fatal):", event.error);
  };

  recognition.onend = () => {
    if (!isIntentionallyStopped) {
      setTimeout(() => {
        try { recognition.start(); }
        catch (e) { console.warn("STT restart failed:", e.message); }
      }, 300);
    }
  };

  try {
    recognition.start();
    console.log("STT started.");
  } catch (e) {
    console.error("STT initial start failed:", e.message);
    return null;
  }

  return {
    stop: () => {
      isIntentionallyStopped = true;
      try { recognition.stop(); } catch (e) { /* already stopped */ }
    }
  };
};