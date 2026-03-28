import { useState, useEffect, useRef } from 'react'
import VisionModule from './modules/VisionModule'
import SimplifyModule from './modules/SimplifyModule'
import { speak } from './utils/tts'
import { startListening } from './utils/stt'
import { callGemini } from './utils/gemini'
import { PROMPTS } from './prompts'

function App() {
  const [activeModule, setActiveModule] = useState('vision')
  const [isLumeThinking, setIsLumeThinking] = useState(false)
  const activeModuleRef = useRef(activeModule)

  useEffect(() => {
    activeModuleRef.current = activeModule
  }, [activeModule])

  const playWhoosh = () => {
    // Synthetic "whoosh" using SpeechSynthesis or a simple audio oscillator if needed.
    // For now, we'll use a short pitch-swept beep or just rely on the voice transition.
    // A real app would use an asset. Let's use a subtle audio context beep.
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) { console.warn("Audio context not supported") }
  }

  const switchModule = (module) => {
    if (module !== activeModuleRef.current) {
      playWhoosh()
      setActiveModule(module)
      speak(`Switched to ${module} mode`)
    }
  }

  const handleGlobalVoice = (transcript) => {
    const lower = transcript.toLowerCase()
    
    // Module switching
    if (lower.includes('vision') || lower.includes('see') || lower.includes('look')) {
      switchModule('vision')
      return
    }
    if (lower.includes('simplify') || lower.includes('text') || lower.includes('read')) {
      switchModule('simplify')
      return
    }

    // Special commands
    if (lower.includes('check for allergies') || lower.includes('allergy')) {
      window.dispatchEvent(new CustomEvent('lume-command', { detail: 'ALLERGY_CHECK' }))
    } else if (lower.includes('simplify this')) {
      window.dispatchEvent(new CustomEvent('lume-command', { detail: 'SIMPLIFY_THIS' }))
    } else if (lower.includes('lume') || lower.includes('help')) {
      speak("Lume is ready. Say 'vision' or 'simplify' to switch modes. You can also say 'check for allergies' or 'simplify this'.")
    }
  }

  useEffect(() => {
    speak("Welcome to LUME. Vision mode is active. Shake to scan your surroundings.");
    
    const recognition = startListening(
      (module) => { /* handled in handleGlobalVoice */ },
      handleGlobalVoice
    )

    return () => {
      if (recognition) recognition.stop()
    }
  }, [])

  // Listen for "Busy Processing" signal from modules
  useEffect(() => {
    const handleThinking = (e) => {
      if (e.detail === true) {
        setIsLumeThinking(true)
        speak("Lume is thinking...")
      } else {
        setIsLumeThinking(false)
      }
    }
    window.addEventListener('lume-thinking', handleThinking)
    return () => window.removeEventListener('lume-thinking', handleThinking)
  }, [])

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#000",
      color: "#FFF",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      position: "relative"
    }}>
      {activeModule === 'vision' ? (
        <VisionModule isActive={true} />
      ) : (
        <SimplifyModule isActive={true} />
      )}

      {isLumeThinking && (
        <div style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          backgroundColor: "rgba(0, 150, 255, 0.4)",
          borderRadius: "30px",
          fontSize: "1rem",
          fontWeight: "bold",
          zIndex: 100,
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(0, 150, 255, 0.6)",
          animation: "pulse 1.5s infinite"
        }}>
          LUME IS THINKING...
        </div>
      )}
      
      <nav style={{
        display: "flex",
        height: "80px",
        backgroundColor: "#000",
        borderTop: "2px solid #333"
      }}>
        {['vision', 'simplify'].map(mod => (
          <button 
            key={mod}
            onClick={() => switchModule(mod)}
            style={{
              flex: 1,
              backgroundColor: activeModule === mod ? "#222" : "transparent",
              color: activeModule === mod ? "#0096FF" : "#888",
              border: "none",
              textTransform: "uppercase",
              fontSize: "1rem",
              fontWeight: "bold",
              letterSpacing: "2px"
            }}
          >
            {mod}
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

export default App
