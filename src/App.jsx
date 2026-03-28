import { useState, useEffect } from 'react'
import VisionModule from './modules/VisionModule'
import ScanModule from './modules/ScanModule'
import NavigateModule from './modules/NavigateModule'
import ReadModule from './modules/ReadModule'
import { speak } from './utils/tts'

function App() {
  const [activeModule, setActiveModule] = useState('vision')

  useEffect(() => {
    speak("Welcome to LUME. Tap anywhere to describe your surroundings. Say Read to switch to document mode.");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      
      if (transcript.includes('vision') || transcript.includes('eye')) {
        setActiveModule('vision')
        speak("Switched to Vision mode")
      } else if (transcript.includes('scan')) {
        setActiveModule('scan')
        speak("Switched to Scan mode")
      } else if (transcript.includes('navigate')) {
        setActiveModule('navigate')
        speak("Switched to Navigate mode")
      } else if (transcript.includes('read')) {
        setActiveModule('read')
        speak("Switched to Read mode")
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      // Attempt to restart on certain errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        try { recognition.start() } catch (e) {}
      }
    }

    recognition.onend = () => {
      // Keep listening
      try { recognition.start() } catch (e) {}
    }

    try {
      recognition.start()
    } catch (e) {
      console.error("Failed to start recognition:", e)
    }

    return () => {
      recognition.stop()
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
      backgroundColor: "#0A0A0A",
      color: "#FFF",
      margin: 0,
      padding: 0,
      overflow: "hidden"
    }}>
      {renderModule()}
      
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
