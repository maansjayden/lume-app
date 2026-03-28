export async function callGemini(prompt, imageBase64) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: cleanBase64
            }
          }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
