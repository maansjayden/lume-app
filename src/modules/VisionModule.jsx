import { useEffect, useRef, useState } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak, isLumeSpeaking } from '../utils/tts.js';
import { startListening } from '../utils/stt.js';
import { PROMPTS } from '../prompts.js';

function VisionModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const [tapped, setTapped] = useState(false);
  const processingRef = useRef(false);
  const videoRef = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const lastSpokenRef = useRef("");
  const listeningRef = useRef(null);

  useEffect(() => {
    processingRef.current = processing;
  }, [processing]);

  const handleUserQuestion = async (transcript) => {
    console.log("User question received:", transcript);
    
    if (processingRef.current || isLumeSpeaking()) {
      console.log("Ignoring: processing=", processingRef.current, "speaking=", isLumeSpeaking());
      return;
    }
    
    setProcessing(true);
    processingRef.current = true;
    speak("Analyzing your question.");
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: true } }));

    try {
      const frame = videoRef.current;
      if (!frame || frame.readyState !== 4) {
        speak("Camera is not ready. Please try again.");
        console.log("Camera not ready");
        return;
      }

      const rawFrame = captureFrame(frame);
      const compressed = await compressImage(rawFrame, 0.6);
      
      // Create a prompt that includes the user's question and image context
      // with emphasis on allergen detection for health-conscious blind users
      const userPrompt = `You are Lume, a helpful AI assistant for the visually impaired. 
The user is blind and asked: "${transcript}"
Look at the image and answer their question in one or two sentences only. Be brief and direct.

IMPORTANT: If food or drink is visible in the image, ALWAYS include potential allergens or health warnings in those same 1-2 sentences. This is critical for the user's health and safety.

Use plain text only. NEVER use asterisks or bolding.`;
      
      const text = await callGemini(userPrompt, compressed);
      console.log("Response:", text);
      speak(text);
      lastSpokenRef.current = text;
    } catch (error) {
      console.error("Vision Question Error:", error);
      speak("Sorry, I could not analyze that. Please try again.");
    } finally {
      setProcessing(false);
      processingRef.current = false;
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: false } }));
    }
  };

  useEffect(() => {
    if (isActive) {
      console.log("Vision Mode activated - starting camera and listener");
      startCamera(videoRef.current).catch(err => {
        console.error("Camera error:", err);
        speak("Camera failed to start. Please check permissions.");
      });
      // Continuous monitoring for safety (every 5 seconds instead of 4 for more breathing room)
      monitoringIntervalRef.current = setInterval(performSafetyCheck, 5000);
      
      // Voice guidance for visually impaired users
      speak("Vision mode active. You can ask me questions about what the camera sees. For example, say what is in front of me, or describe that object. I will analyze the camera and answer.");
      
      // Start listening for user questions in Vision Mode
      console.log("Starting listener...");
      listeningRef.current = startListening(() => {}, handleUserQuestion);
      console.log("Listener started:", listeningRef.current);
    } else {
      console.log("Vision Mode deactivated - stopping camera and listener");
      stopCamera(videoRef.current);
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
      
      // Stop listening when Vision Mode becomes inactive
      if (listeningRef.current) {
        try {
          listeningRef.current.stop();
          listeningRef.current = null;
        } catch (e) {
          console.error("Error stopping listener:", e);
        }
      }
    }
    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
      if (listeningRef.current) {
        try {
          listeningRef.current.stop();
        } catch (e) {
          console.error("Error stopping listener:", e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const performSafetyCheck = async () => {
    if (processingRef.current || !isActive || isLumeSpeaking()) return;
    
    setProcessing(true);
    processingRef.current = true;

    try {
      const frame = videoRef.current;
      if (!frame || frame.readyState !== 4) return;

      const rawFrame = captureFrame(frame);
      const compressed = await compressImage(rawFrame, 0.4);
      const text = await callGemini(PROMPTS.VISION, compressed);
      
      if (isLumeSpeaking()) return;

      const lowerText = text.toLowerCase();
      const isUrgent = lowerText.includes("caution") || lowerText.includes("danger") || lowerText.includes("path") || lowerText.includes("allergy");

      if (text !== lastSpokenRef.current || isUrgent) {
        if (isUrgent) {
          navigator.vibrate?.([200, 100, 200]);
          speak("Alert: " + text);
        } else {
          speak(text);
        }
        lastSpokenRef.current = text;
      }
    } catch (e) {
      console.error("Safety Check Error:", e);
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  };

  const handleCapture = async (customPrompt = PROMPTS.VISION) => {
    if (processingRef.current) return;
    
    setProcessing(true);
    processingRef.current = true;
    setTapped(true);
    setTimeout(() => setTapped(false), 150);
    
    // Audio feedback confirming action
    speak("Analyzing.");
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
      lastSpokenRef.current = text;
    } catch (error) {
      console.error("Vision Error:", error);
      speak("Sorry, analysis failed. Please try again.");
    } finally {
      setProcessing(false);
      processingRef.current = false;
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
