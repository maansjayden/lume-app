export const PROMPTS = {
  VISION: "Describe what you see in this image in one or two short, clear sentences for a person who is visually impaired. Include the emotional context. CRITICAL: If you detect any danger, such as people fighting, arguing, or aggressive behavior, state exactly what is happening immediately and clearly as your first priority (e.g., 'People are fighting in front of you').",
  SCAN: "Extract and read the most important text or labels from this image. If food or drink is present, identify it and state any possible allergens (e.g., dairy, nuts, gluten, etc.), even if no text is found.",
  NAVIGATE: "Identify traffic lights (robots) and obstacles. If red: 'Robot is red, stay where you are.' If green: 'Robot is green, safe to cross.' For obstacles: 'Step ahead' or 'Door on left'. CRITICAL: If you detect danger like people fighting, arguing, or aggressive behavior, alert the user immediately with the exact situation (e.g., 'Aggressive argument occurring nearby'). Be extremely direct.",
  READ: "Provide a comprehensive but clear summary of the text in this document. Use plain language and simplify the text for cognitive accessibility and dyslexia support."
};
