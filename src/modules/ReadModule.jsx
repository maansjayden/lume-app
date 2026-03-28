import { useState } from 'react';
import { callGemini } from '../utils/gemini.js';
import { speak } from '../utils/tts.js';
import { PROMPTS } from '../prompts.js';

function ReadModule({ isActive }) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState("");

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setProcessing(true);
    setResult("Analyzing document...");

    try {
      const base64 = await fileToBase64(file);
      const text = await callGemini(PROMPTS.READ, base64);
      setResult(text);
      speak(text);
    } catch (error) {
      console.error("Read Error:", error);
      setResult("Error reading document.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isActive) return null;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000",
      color: "#FFF",
      padding: "20px",
      textAlign: "center"
    }}>
      <input 
        type="file" 
        accept="image/*,application/pdf" 
        id="file-upload" 
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      
      <label 
        htmlFor="file-upload"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "4px dashed #5A1A8A",
          borderRadius: "20px",
          padding: "40px",
          boxSizing: "border-box"
        }}
      >
        <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
          {processing ? "PROCESSING..." : "TAP ANYWHERE TO UPLOAD DOCUMENT"}
        </span>
      </label>

      {result && (
        <div style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "rgba(90, 26, 138, 0.2)",
          borderRadius: "10px",
          maxHeight: "40vh",
          overflowY: "auto"
        }}>
          {result}
        </div>
      )}
    </div>
  );
}

export default ReadModule;
