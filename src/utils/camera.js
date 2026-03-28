export async function startCamera(videoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  videoElement.srcObject = stream;
  return stream;
}

export function stopCamera(videoElement) {
  const stream = videoElement.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
  }
}

export function captureFrame(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg');
}
