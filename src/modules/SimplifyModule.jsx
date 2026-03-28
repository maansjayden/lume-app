import { useState, useEffect, useRef } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function SimplifyModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startCamera(videoRef.current).catch(err => {
        console.error("Camera Error:", err);
      });
    }

    return () => {
      if (videoRef.current) {
        stopCamera(videoRef.current);
      }
    };
  }, [isActive]);

  const handleCapture = async () => {
    if (processing || !videoRef.current) return;

    setProcessing(true);
    window.dispatchEvent(new CustomEvent('lume-thinking', { detail: true }));

    try {
      const rawFrame = captureFrame(videoRef.current);
      const compressed = await compressImage(rawFrame, 0.6);
      const text = await callGemini(PROMPTS.SIMPLIFY, compressed);
      speak(text);
    } catch (error) {
      console.error("Simplify Error:", error);
    } finally {
      setProcessing(false);
      window.dispatchEvent(new CustomEvent('lume-thinking', { detail: false }));
    }
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
    </div>
  );
}

export default SimplifyModule;
