import { useState, useEffect, useRef } from 'react'
import VisionModule from './modules/VisionModule'
import ScanModule from './modules/ScanModule'
import NavigateModule from './modules/NavigateModule'
import ReadModule from './modules/ReadModule'
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

  const isLumeThinkingRef = useRef(isLumeThinking)
  useEffect(() => {
    isLumeThinkingRef.current = isLumeThinking
  }, [isLumeThinking])

  const handleConversation = async (transcript) => {
    if (isLumeThinkingRef.current) return
    
    const lower = transcript.toLowerCase()
    // Only respond if "Lume" is mentioned or if it's a direct question
    if (lower.includes('lume') || lower.includes('hey') || lower.includes('help') || lower.includes('what') || lower.includes('how')) {
      setIsLumeThinking(true)
      try {
        const response = await callGemini(`${PROMPTS.CONVERSATION}\n\nUser said: ${transcript}`)
        speak(response)
      } catch (err) {
        console.error("Conversation Error:", err)
      } finally {
        setIsLumeThinking(false)
      }
    }
  }

  useEffect(() => {
    speak("Welcome to LUME. I am listening. Say help if you need guidance.");
    
    const recognition = startListening(
      (module) => {
        if (module !== activeModuleRef.current) {
          setActiveModule(module)
          speak(`Switched to ${module} mode`)
        }
      },
      handleConversation
    )

    return () => {
      if (recognition) recognition.stop()
    }
  }, [])

  const renderModule = () => {
    switch (activeModule) {
      case 'vision':
        return <VisionModule isActive={activeModule === 'vision'} />
      case 'scan':
        return <ScanModule isActive={activeModule === 'scan'} />
      case 'navigate':
        return <NavigateModule isActive={activeModule === 'navigate'} />
      case 'read':
        return <ReadModule isActive={activeModule === 'read'} />
      default:
        return <VisionModule isActive={activeModule === 'vision'} />
    }
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
      {renderModule()}

      {isLumeThinking && (
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "8px 15px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: "bold",
          zIndex: 100,
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255, 255, 255, 0.3)"
        }}>
          LUME IS THINKING...
        </div>
      )}
      
      <nav style={{
        display: "flex",
        height: "60px",
        backgroundColor: "#111",
        borderTop: "1px solid #333"
      }}>
        {['vision', 'scan', 'navigate', 'read'].map(mod => (
          <button 
            key={mod}
            onClick={() => {
              setActiveModule(mod)
              speak(`Switched to ${mod} mode`)
            }}
            style={{
              flex: 1,
              backgroundColor: activeModule === mod ? "#222" : "transparent",
              color: activeModule === mod ? "#FFF" : "#888",
              border: "none",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              fontWeight: "bold",
              letterSpacing: "1px"
            }}
          >
            {mod}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
