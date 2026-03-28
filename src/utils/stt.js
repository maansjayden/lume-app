import { isLumeSpeaking } from './tts';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const startListening = (onModuleSwitch, onSpeech) => {
  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  let isIntentionallyStopped = false;

  recognition.onresult = (event) => {
    if (isLumeSpeaking()) return;

    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    
    // Check for specific mode switches
    if (transcript.includes('vision mode') || transcript.includes('look around')) {
      onModuleSwitch('vision');
    } else if (transcript.includes('simplify mode') || transcript.includes('read text')) {
      onModuleSwitch('read');
    } else if (onSpeech) {
      onSpeech(transcript);
    }
  };

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed') {
      isIntentionallyStopped = true;
      console.error("Speech recognition permission denied.");
    }
    console.error("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    if (!isIntentionallyStopped) {
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to restart recognition:", e);
      }
    }
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Failed to start recognition:", e);
  }

  // Return an object that has a stop method
  return {
    stop: () => {
      isIntentionallyStopped = true;
      recognition.stop();
    }
  };
};
