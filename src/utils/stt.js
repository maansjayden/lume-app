import { speak } from './tts';

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

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    
    if (transcript.includes('vision') || transcript.includes('eye') || transcript.includes('around') || transcript.includes('see')) {
      onModuleSwitch('vision');
    } else if (transcript.includes('scan') || transcript.includes('label') || transcript.includes('food') || transcript.includes('item')) {
      onModuleSwitch('scan');
    } else if (transcript.includes('navigate') || transcript.includes('robot') || transcript.includes('traffic') || transcript.includes('street') || transcript.includes('walk')) {
      onModuleSwitch('navigate');
    } else if (transcript.includes('read') || transcript.includes('text') || transcript.includes('document') || transcript.includes('book') || transcript.includes('page')) {
      onModuleSwitch('read');
    } else if (onSpeech) {
      onSpeech(transcript);
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
      try { recognition.start(); } catch (e) {}
    }
  };

  recognition.onend = () => {
    try { recognition.start(); } catch (e) {}
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Failed to start recognition:", e);
  }

  return recognition;
};
