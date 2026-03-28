import { useState, useEffect, useRef } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function SimplifyModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const [tapped, setTapped] = useState(false);
  const processingRef = useRef(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    processingRef.current = processing;
  }, [processing]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (isActive && videoElement) {
      startCamera(videoElement).catch(err => {
        console.error("Camera Error:", err);
        speak("Simplify camera failed. Please check permissions.");
      });
    }

    return () => {
      if (videoElement) {
        stopCamera(videoElement);
      }
    };
  }, [isActive]);

  const handleCapture = async () => {
    if (processingRef.current || !isActive) return;

    setProcessing(true);
    processingRef.current = true;
    setTapped(true);
    setTimeout(() => setTapped(false), 150);
    speak("Simplifying.");
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: true, quiet: true } }));

    try {
      const frame = videoRef.current;
      if (!frame || frame.readyState !== 4) {
        await startCamera(frame);
      }

      const rawFrame = captureFrame(frame);
      const compressed = await compressImage(rawFrame, 0.7); // Higher quality for text
      const text = await callGemini(PROMPTS.SIMPLIFY, compressed);
      speak(text);
    } catch (error) {
      console.error("Simplify Error:", error);
      speak("Sorry, I couldn't simplify that image.");
    } finally {
      setProcessing(false);
      processingRef.current = false;
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: false } }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);
    processingRef.current = true;
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: true } }));

    try {
      speak("Processing " + (file.type === 'application/pdf' ? "PDF document" : "image") + ".");
      const base64 = await fileToBase64(file);
      // For PDFs, we send the base64 to callGemini which handles the application/pdf mime type
      const prompt = file.type === 'application/pdf' 
        ? "Summarize this document into 3 simple bullet points for cognitive accessibility:" 
        : PROMPTS.SIMPLIFY;
      
      const text = await callGemini(prompt, base64);
      speak(text);
    } catch (error) {
      console.error("Simplify Upload Error:", error);
      speak("Sorry, I couldn't simplify that file.");
    } finally {
      setProcessing(false);
      processingRef.current = false;
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: false } }));
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    const handleCommand = (e) => {
      if (e.detail === 'SIMPLIFY_THIS' && isActive) {
        handleCapture();
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
      onClick={handleCapture}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: "#000",
        color: "#FFF",
        overflow: "hidden",
        cursor: "pointer"
      }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.6
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
        SIMPLIFY
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
        TAP OR SHAKE TO SIMPLIFY TEXT
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current.click();
        }}
        aria-label="Upload document"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          backgroundColor: "rgba(0, 150, 255, 0.6)",
          color: "white",
          border: "2px solid #0096FF",
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 25,
          backdropFilter: "blur(10px)"
        }}
        title="Upload Document"
      >
        📄
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*,application/pdf" 
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default SimplifyModule;
