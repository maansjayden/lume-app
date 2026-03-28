export const PROMPTS = {
  VISION: `Describe the environment in one short sentence. 
    PRIORITY 1: If you see a "Green Robot" (South African traffic light for pedestrians), explicitly say "Safe to cross: Green Robot detected."
    PRIORITY 2: If there is an obstacle within 2 meters, explicitly say "Caution: Obstacle ahead." 
    Focus on immediate safety and the emotional feel of the room. Use plain text only. NEVER use asterisks or bolding.`,
  
  SIMPLIFY: `Explain the text in the image as if I am 5 years old. 
    Provide exactly 3 simple bullet points. 
    Use plain text only. NEVER use asterisks or bolding.`,

  ALLERGY_CHECK: `Scan this image specifically for peanuts, gluten, or dairy. 
    Report immediately if any are found or if the ingredients are unclear. 
    Use plain text only. NEVER use asterisks or bolding.`,

  CONVERSATION: `You are Lume, a helpful AI assistant for the visually impaired. 
    Use plain text only. NEVER use asterisks or bolding. Keep responses extremely short.`
};
