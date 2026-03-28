import { useEffect, useRef, useState } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function VisionModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const monitoringIntervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startCamera(videoRef.current).catch(err => console.error("Camera error:", err));
      // Continuous monitoring for safety (every 4 seconds)
      monitoringIntervalRef.current = setInterval(performSafetyCheck, 4000);
    } else {
      stopCamera(videoRef.current);
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    }
    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    };
  }, [isActive]);

  const performSafetyCheck = async () => {
    if (processing || !isActive) return;
    try {
      const rawFrame = captureFrame(videoRef.current);
      const compressed = await compressImage(rawFrame, 0.5);
      const text = await callGemini(PROMPTS.VISION, compressed);
      
      // Safety triggers
      if (text.includes("Green Robot") || text.includes("Obstacle")) {
        if (text.includes("Obstacle")) {
          navigator.vibrate?.([200, 100, 200]); // Haptic feedback
        }
        speak(text);
      }
    } catch (e) {
      console.error("Safety Check Error:", e);
    }
  };

  const handleCapture = async (customPrompt = PROMPTS.VISION) => {
    if (processing) return;
    
    setProcessing(true);
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: true }));

    try {
      const rawFrame = captureFrame(videoRef.current);
      const compressed = await compressImage(rawFrame, 0.6);
      const text = await callGemini(customPrompt, compressed);
      speak(text);
    } catch (error) {
      console.error("Vision Error:", error);
    } finally {
      setProcessing(false);
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: false }));
    }
  };

  useEffect(() => {
    const handleCommand = (e) => {
      if (e.detail === 'ALLERGY_CHECK' && isActive) {
        handleCapture(PROMPTS.ALLERGY_CHECK);
      }
    };
    window.addEventListener('lume-command', handleCommand);
    return () => window.removeEventListener('lume-command', handleCommand);
  }, [isActive, processing]);

  useEffect(() => {
    const handleMotion = (event) => {
      const { x, y, z } = event.acceleration || {};
      const threshold = 15;
      if ((Math.abs(x) > threshold || Math.abs(y) > threshold || Math.abs(z) > threshold) && !processing && isActive) {
        handleCapture();
      }
    };

    if (isActive) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isActive, processing]);

  return (
    <div 
      onClick={() => handleCapture()}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        cursor: "pointer"
      }}
    >
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.6,
          position: "absolute",
          top: 0,
          left: 0
        }}
      />
      
      <div style={{
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: "0.9rem",
        textAlign: "center",
        pointerEvents: "none"
      }}>
        TAP OR SHAKE FOR VISION
      </div>
    </div>
  );
}

export default VisionModule;
