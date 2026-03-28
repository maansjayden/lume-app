import { useState, useEffect, useRef } from 'react'
import VisionModule from './modules/VisionModule'
import ScanModule from './modules/ScanModule'
import NavigateModule from './modules/NavigateModule'
import ReadModule from './modules/ReadModule'
import { speak } from './utils/tts'
import { startListening } from './utils/stt'

function App() {
  const [activeModule, setActiveModule] = useState('vision')
  const activeModuleRef = useRef(activeModule)

  useEffect(() => {
    activeModuleRef.current = activeModule
  }, [activeModule])

  useEffect(() => {
    speak("Welcome to LUME. Tap anywhere to describe your surroundings. Say Read to switch to document mode.");
    
    const recognition = startListening((module) => {
      if (module !== activeModuleRef.current) {
        setActiveModule(module)
        speak(`Switched to ${module} mode`)
      }
    })

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
