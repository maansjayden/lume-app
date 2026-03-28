import { useState, useEffect, useRef } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function SimplifyModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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
    if (processing || !isActive) return;

    setProcessing(true);
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: true } }));

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
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: false } }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: { active: true } }));

    try {
      const base64 = await fileToBase64(file);
      const text = await callGemini(PROMPTS.SIMPLIFY, base64);
      speak(text);
    } catch (error) {
      console.error("Simplify Upload Error:", error);
    } finally {
      setProcessing(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
