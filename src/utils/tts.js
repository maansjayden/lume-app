let isSpeaking = false;

export function speak(text, onEnd) {
  if (!text || text.trim() === "") return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slightly slower for better clarity
  utterance.pitch = 1.0;
  
  utterance.onstart = () => {
    isSpeaking = true;
  };

  utterance.onend = () => {
    isSpeaking = false;
    if (onEnd) onEnd();
  };

  utterance.onerror = (event) => {
    console.error("SpeechSynthesis error:", event);
    isSpeaking = false;
  };

  window.speechSynthesis.speak(utterance);
}

export function isLumeSpeaking() {
  return isSpeaking || window.speechSynthesis.speaking;
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
  isSpeaking = false;
}
