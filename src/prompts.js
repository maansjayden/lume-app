export const PROMPTS = {
  VISION: `Describe exactly what is directly in front of the camera in one or two clear, objective sentences. Identify specific objects and their relative positions. 
    IMPORTANT: If food or drink is visible, you MUST identify it and state potential allergens in one short sentence. 
    Be precise and direct. Use plain text only. NEVER use asterisks or bolding.`,
  
  SIMPLIFY: `Summarize the text found in this image or document into exactly three short, simple bullet points. 
    Focus on the most important information. 
    Use very simple language suitable for someone with cognitive disabilities.
    If no clear text is found, say "No readable text detected."
    Use plain text only. NEVER use asterisks or bolding.`,

  ALLERGY_CHECK: `Identify the food or drink in this image and state possible allergens in one or two short sentences. If ingredients are unclear, say caution is required. Use plain text only. NEVER use asterisks or bolding.`,

  CONVERSATION: `You are Lume, a helpful AI assistant for the visually impaired. 
    Use plain text only. NEVER use asterisks or bolding. Keep responses extremely short.`
};
