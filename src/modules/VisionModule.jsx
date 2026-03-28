import { useEffect, useRef, useState } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function VisionModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startCamera(videoRef.current).catch(err => console.error("Camera error:", err));
    } else {
      stopCamera(videoRef.current);
    }
  }, [isActive]);

  const handleCapture = async () => {
    if (processing) return;
    setProcessing(true);
    setResult("Processing...");

    try {
      const rawFrame = captureFrame(videoRef.current);
      const compressed = await compressImage(rawFrame, 0.6);
      const text = await callGemini(PROMPTS.VISION, compressed);
      setResult(text);
      speak(text);
    } catch (error) {
      console.error("Vision Error:", error);
      setResult("Error processing image.");
    } finally {
      setProcessing(false);
    }
  };

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
          opacity: 0.4,
          position: "absolute",
          top: 0,
          left: 0
        }}
      />
      
      <div style={{
        marginTop: "auto",
        padding: "20px",
        zIndex: 2,
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        borderTop: "4px solid #1A6B8A",
        minHeight: "100px",
        color: "#FFF",
        fontSize: "1.2rem",
        textAlign: "center"
      }}>
        {processing ? "Processing..." : result || "Tap or shake to see"}
      </div>
    </div>
  );
}

export default VisionModule;
