export const PROMPTS = {
  VISION: `Analyze the environment in one short, clear sentence. 
    1. OBSTACLES: Identify SPECIFIC objects (e.g., "a chair", "a parked car", "a person walking"). If the path is clear, say "The road is clear."
    2. SAFETY: If there is immediate danger, explicitly say "Caution: [Object] is very close." 
    3. TRAFFIC: Explicitly say "Safe to cross: Green Robot detected" only if you see a South African pedestrian green light.
    4. FOOD: If food or a menu is visible, identify the food type, list possible common allergens (peanuts, gluten, dairy), and provide any safety warnings.
    Use plain text only. NEVER use asterisks or bolding.`,
  
  SIMPLIFY: `Rewrite the text from this image to be more accessible for someone with cognitive disabilities. 
    Focus on replacing complex, technical, or difficult words with simpler synonyms. 
    Ensure the resulting text is 100% accurate and includes all details from the original document. 
    Maintain the original meaning and flow while making the vocabulary easier to understand. 
    Use plain text only. NEVER use asterisks or bolding.`,

  ALLERGY_CHECK: `Scan this image specifically for peanuts, gluten, or dairy. 
    Report immediately if any are found or if the ingredients are unclear. 
    Use plain text only. NEVER use asterisks or bolding.`,

  CONVERSATION: `You are Lume, a helpful AI assistant for the visually impaired. 
    Use plain text only. NEVER use asterisks or bolding. Keep responses extremely short.`
};
