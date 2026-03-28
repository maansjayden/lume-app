export const PROMPTS = {
  VISION: "Describe what you see in this image in one or two short, clear sentences for a person who is visually impaired. Include the emotional context. CRITICAL: If you detect any danger, such as people fighting, arguing, or aggressive behavior, state exactly what is happening immediately and clearly as your first priority (e.g., 'People are fighting in front of you').",
  SCAN: "Extract and read the most important text or labels from this image. If food or drink is present, identify it and state any possible allergens (e.g., dairy, nuts, gluten, etc.), even if no text is found.",
  NAVIGATE: "Provide a one or two-sentence direct alert. 1) State traffic light status. 2) Mention the path's clarity or immediate obstacles. 3) CRITICAL: If danger like fighting or arguing is detected, report it immediately and exactly (e.g., 'People are fighting ahead, stay back'). Keep it brief and avoid unnecessary detail.",
  READ: "Provide a comprehensive but clear summary of the text in this document. Use plain language and simplify the text for cognitive accessibility and dyslexia support."
};
