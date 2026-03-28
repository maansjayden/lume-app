export function speak(text, onEnd) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  if (onEnd) {
    utterance.onend = onEnd;
  }
  window.speechSynthesis.speak(utterance);
}
