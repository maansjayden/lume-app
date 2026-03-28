export async function startCamera(videoElement) {
  if (!videoElement) return;

  // If there's already a stream, stop it first to refresh
  if (videoElement.srcObject) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    
    videoElement.srcObject = stream;
    
    // Ensure the video plays. playsInline is crucial for iOS.
    videoElement.setAttribute('playsinline', true);
    videoElement.setAttribute('autoplay', true);
    videoElement.setAttribute('muted', true);
    
    await videoElement.play().catch(e => console.warn("Video play interrupted:", e));
    
    return stream;
  } catch (err) {
    console.error("Error accessing camera:", err);
    throw err;
  }
}

export function stopCamera(videoElement) {
  if (!videoElement || !videoElement.srcObject) return;
  
  const stream = videoElement.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());
  videoElement.srcObject = null;
}

export function captureFrame(videoElement) {
  if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    throw new Error("Camera frame not ready");
  }
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg');
}
