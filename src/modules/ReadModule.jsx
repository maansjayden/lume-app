import { useState, useEffect, useRef } from 'react';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';
import { startCamera, stopCamera, captureFrame } from '../utils/camera.js';

function ReadModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      startCamera(videoRef.current).catch(err => {
        console.error("Camera Error:", err);
        setResult("Could not start camera. Please ensure permissions are granted.");
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
    setResult("Processing view...");
    speak("Processing view...");

    try {
      const base64 = captureFrame(videoRef.current);
      const text = await callGemini(PROMPTS.READ, base64);
      setResult(text);
      speak(text);
    } catch (error) {
      console.error("Read Error:", error);
      setResult("Error processing view.");
      speak("Error processing view.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);
    setResult("Analyzing document...");
    speak("Analyzing document...");

    try {
      const base64 = await fileToBase64(file);
      const text = await callGemini(PROMPTS.READ, base64);
      setResult(text);
      speak(text);
    } catch (error) {
      console.error("Read Error:", error);
      setResult("Error reading document.");
      speak("Error reading document.");
    } finally {
      setProcessing(false);
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

  if (!isActive) return null;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      backgroundColor: "#000",
      color: "#FFF",
      overflow: "hidden"
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onClick={handleCapture}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          cursor: "pointer"
        }}
      />

      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        padding: "20px",
        background: "rgba(0,0,0,0.6)",
        pointerEvents: "none",
        zIndex: 10
      }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#5A1A8A" }}>READ MODE</h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", opacity: 0.8 }}>
          Tap screen to read what's in front of you, or use the button below to upload.
        </p>
      </div>

      {result && (
        <div 
          onClick={() => speak(result)}
          style={{
            position: "absolute",
            bottom: "80px",
            left: "20px",
            right: "20px",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            border: "2px solid #5A1A8A",
            borderRadius: "15px",
            maxHeight: "30vh",
            overflowY: "auto",
            zIndex: 20,
            cursor: "pointer",
            fontSize: "1rem",
            lineHeight: "1.4",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
          }}
        >
          {result}
        </div>
      )}

      {processing && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 30,
          backgroundColor: "rgba(90, 26, 138, 0.9)",
          padding: "20px 40px",
          borderRadius: "50px",
          fontWeight: "bold",
          letterSpacing: "2px"
        }}>
          PROCESSING...
        </div>
      )}

      <button
        onClick={() => fileInputRef.current.click()}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "25px",
          backgroundColor: "#5A1A8A",
          color: "white",
          border: "none",
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 25,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
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

export default ReadModule;
