import { useState, useEffect, useRef } from 'react'
import VisionModule from './modules/VisionModule'
import SimplifyModule from './modules/SimplifyModule'
import { speak } from './utils/tts'
import { startListening } from './utils/stt'
import { callGemini } from './utils/gemini'
import { PROMPTS } from './prompts'

function App() {
  const [started, setStarted] = useState(false)
  const [activeModule, setActiveModule] = useState('vision')
  const [isLumeThinking, setIsLumeThinking] = useState(false)
  const activeModuleRef = useRef(activeModule)

  useEffect(() => {
    activeModuleRef.current = activeModule
  }, [activeModule])

  const playWhoosh = () => {
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
    } catch { console.warn("Audio context not supported") }
  }

  const switchModule = (module) => {
    if (module !== activeModuleRef.current) {
      playWhoosh()
      setActiveModule(module)
      speak(`Switched to ${module} mode`)
    }
  }

  const handleGlobalVoice = async (transcript) => {
    const lower = transcript.toLowerCase()
    
    // Check for mode switches
    if (lower.includes('switch to vision') || lower.includes('go to vision') || (lower.includes('vision') && lower.includes('mode'))) {
      switchModule('vision')
      return
    }
    if (lower.includes('switch to simplify') || lower.includes('go to simplify') || (lower.includes('simplify') && lower.includes('mode')) || lower === 'read' || lower.includes('read mode')) {
      switchModule('simplify')
      return
    }

    // Special commands
    if (lower.includes('check for allergies') || lower.includes('allergy')) {
      window.dispatchEvent(new CustomEvent('lume-command', { detail: 'ALLERGY_CHECK' }))
      return
    } else if (lower.includes('simplify this') || lower.includes('read this') || lower.includes('read it')) {
      window.dispatchEvent(new CustomEvent('lume-command', { detail: 'SIMPLIFY_THIS' }))
      return
    }

    // General Conversation / Interaction
    if (lower.includes('lume') || lower.includes('hello') || lower.includes('hi')) {
      if (lower.includes('help') || (lower.includes('what') && lower.includes('do'))) {
        speak("I am Lume. You are in " + activeModuleRef.current + " mode. You can say 'switch to simplify' or 'switch to vision'. You can also ask me to check for allergies, simplify a document, or just talk to me.")
        return
      }

      // If it's a general question or address to Lume
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: true, quiet: true } }))
      try {
        const response = await callGemini(`${PROMPTS.CONVERSATION}\nUser said: ${transcript}`)
        speak(response)
      } catch (error) {
        console.error("Conversation Error:", error)
      } finally {
        window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: false } }))
      }
    }
  }

  useEffect(() => {
    if (!started) return;

    // Welcome message requested by the user
    speak("Welcome to Lume. Tap anywhere to describe your surroundings. Say Read to switch to simplify mode.");
    
    const listener = startListening(
      (module) => { 
        if (module === 'read') switchModule('simplify');
        else if (module === 'vision') switchModule('vision');
      },
      handleGlobalVoice
    )

    return () => {
      if (listener) listener.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  const handleStart = () => {
    setStarted(true)
  }

  // Listen for "Busy Processing" signal from modules
  useEffect(() => {
    const handleThinking = (e) => {
      const isQuiet = e.detail?.quiet === true
      const isActive = e.detail === true || e.detail?.active === true

      if (isActive) {
        setIsLumeThinking(true)
        if (!isQuiet) speak("Lume is thinking...")
      } else {
        setIsLumeThinking(false)
      }
    }
    window.addEventListener('lume-thinking', handleThinking)
    return () => window.removeEventListener('lume-thinking', handleThinking)
  }, [])

  if (!started) {
    return (
      <div 
        onClick={handleStart}
        role="button"
        aria-label="Tap to start Lume"
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000",
          color: "#0096FF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          fontWeight: "bold",
          textAlign: "center",
          padding: "20px",
          boxSizing: "border-box",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        <div style={{ fontSize: "5rem", marginBottom: "20px" }}>👁️</div>
        TAP ANYWHERE TO START LUME
      </div>
    )
  }

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
          animation: "pulse 1.5s infinite",
          pointerEvents: "none"
        }}>
          LUME IS THINKING...
        </div>
      )}
      
      <nav style={{
        display: "flex",
        height: "80px",
        backgroundColor: "#000",
        borderTop: "2px solid #333",
        zIndex: 100,
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: "env(safe-area-inset-bottom)",
        marginBottom: "30px"
      }}>
        {['vision', 'simplify'].map(mod => (
          <button 
            key={mod}
            onClick={(e) => {
              e.stopPropagation()
              switchModule(mod)
            }}
            aria-label={`Switch to ${mod} mode`}
            style={{
              flex: 1,
              backgroundColor: activeModule === mod ? "#222" : "transparent",
              color: activeModule === mod ? "#0096FF" : "#888",
              border: "none",
              textTransform: "uppercase",
              fontSize: "1rem",
              fontWeight: "bold",
              letterSpacing: "2px",
              cursor: "pointer",
              minHeight: "80px",
              transition: "background-color 0.2s",
              WebkitTapHighlightColor: "transparent",
              touchAction: "manipulation"
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
