import { useEffect, useRef, useState } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak, isLumeSpeaking } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function VisionModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const [tapped, setTapped] = useState(false);
  const processingRef = useRef(false);
  const videoRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const lastSpokenRef = useRef("");

  useEffect(() => {
    processingRef.current = processing;
  }, [processing]);

  useEffect(() => {
    if (isActive) {
      startCamera(videoRef.current).catch(err => {
        console.error("Camera error:", err);
        speak("Camera failed to start. Please check permissions.");
      });
      // Continuous monitoring for safety (every 5 seconds instead of 4 for more breathing room)
      monitoringIntervalRef.current = setInterval(performSafetyCheck, 5000);
    } else {
      stopCamera(videoRef.current);
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    }
    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const performSafetyCheck = async () => {
    if (processingRef.current || !isActive || isLumeSpeaking()) return;
    
    try {
      const frame = videoRef.current;
      if (!frame || frame.readyState !== 4) return; // HAVE_ENOUGH_DATA

      const rawFrame = captureFrame(frame);
      const compressed = await compressImage(rawFrame, 0.4); // More compression for background check
      const text = await callGemini(PROMPTS.VISION, compressed);
      
      // If we started processing a manual scan or Lume started speaking while we were waiting, skip.
      if (processingRef.current || isLumeSpeaking()) return;

      // Only speak if the information is new OR if it is a CAUTION/ALLERGY message
      const lowerText = text.toLowerCase();
      const isUrgent = lowerText.includes("caution") || lowerText.includes("danger") || lowerText.includes("path") || lowerText.includes("allergy");

      if (text !== lastSpokenRef.current || isUrgent) {
        if (isUrgent) {
          navigator.vibrate?.([200, 100, 200]);
        }
        speak(text);
        lastSpokenRef.current = text;
      }
    } catch (e) {
      console.error("Safety Check Error:", e);
    }
  };

  const handleCapture = async (customPrompt = PROMPTS.VISION) => {
    if (processingRef.current) return;
    
    setProcessing(true);
    setTapped(true);
    setTimeout(() => setTapped(false), 150);
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: true } }));

    try {
      const frame = videoRef.current;
      if (!frame || frame.readyState !== 4) {
        speak("Camera is not ready. Trying again.");
        await startCamera(frame);
      }

      const rawFrame = captureFrame(frame);
      const compressed = await compressImage(rawFrame, 0.6);
      const text = await callGemini(customPrompt, compressed);
      speak(text);
      lastSpokenRef.current = text; // Update this so the safety check doesn't repeat it immediately
    } catch (error) {
      console.error("Vision Error:", error);
    } finally {
      setProcessing(false);
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: false } }));
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
      if ((Math.abs(x) > threshold || Math.abs(y) > threshold || Math.abs(z) > threshold) && !processingRef.current && isActive) {
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
      
      {tapped && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 150, 255, 0.15)",
          zIndex: 10,
          pointerEvents: "none"
        }} />
      )}

      <div style={{
        position: "absolute", top: "20px", left: "20px",
        zIndex: 2, color: "rgba(0,150,255,0.8)",
        fontSize: "0.75rem", fontWeight: "bold",
        letterSpacing: "3px", pointerEvents: "none"
      }}>
        VISION
      </div>

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
