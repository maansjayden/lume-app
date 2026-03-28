import { useEffect, useRef, useState } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';
import { compressImage } from '../utils/compress.js';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function NavigateModule({ isActive }) {
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
      const text = await callGemini(PROMPTS.NAVIGATE, compressed);
      setResult(text);
      speak(text);
    } catch (error) {
      console.error("Navigation Error:", error);
      setResult("Error analyzing path.");
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
          opacity: 0.6,
          position: "absolute",
          top: 0,
          left: 0
        }}
      />

      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        padding: "20px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
        zIndex: 10,
        pointerEvents: "none"
      }}>
        <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#FFD700" }}>NAVIGATE MODE</h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem", opacity: 0.9 }}>
          Analyzing path and safety. Tap or shake to update.
        </p>
      </div>
      
      <div style={{
        marginTop: "auto",
        padding: "30px 20px",
        zIndex: 2,
        backgroundColor: "rgba(10, 10, 10, 0.9)",
        borderTop: "6px solid #FFD700",
        minHeight: "150px",
        color: "#FFF",
        fontSize: "1.4rem",
        fontWeight: "bold",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: "1.3"
      }}>
        {processing ? (
          <div style={{ color: "#FFD700" }}>ANALYZING PATH...</div>
        ) : (
          result || "TAP TO CHECK YOUR PATH"
        )}
      </div>
    </div>
  );
}

export default NavigateModule;
