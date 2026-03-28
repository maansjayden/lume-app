export const PROMPTS = {
  VISION: `Describe the immediate environment in one short, clear sentence.
    1. OBJECTS: Identify what you see directly in front of the camera (e.g., "a wooden table", "a person standing", "a doorway").
    2. SPATIAL: Mention the distance or position if relevant (e.g., "about two meters away", "to your left").
    3. SAFETY: If there is an immediate obstacle that could cause a trip or collision, say "Caution: [Object] is in your path."
    4. TRAFFIC: Only if looking at a street, mention "Green Robot" if a pedestrian crossing light is green.
    5. FOOD: Briefly identify food or menus and mention common allergens if visible.
    Be objective. If you see nothing specific, describe the general space (e.g., "an open room"). 
    Avoid generic phrases like "The road is clear" unless you are actually on a road.
    Use plain text only. NEVER use asterisks or bolding.`,
  
  SIMPLIFY: `Summarize the text found in this image or document into exactly three short, simple bullet points. 
    Focus on the most important information. 
    Use very simple language suitable for someone with cognitive disabilities.
    If no clear text is found, say "No readable text detected."
    Use plain text only. NEVER use asterisks or bolding.`,

  ALLERGY_CHECK: `Scan this image specifically for peanuts, gluten, or dairy. 
    Report immediately if any are found or if the ingredients are unclear. 
    Use plain text only. NEVER use asterisks or bolding.`,

  CONVERSATION: `You are Lume, a helpful AI assistant for the visually impaired. 
    Use plain text only. NEVER use asterisks or bolding. Keep responses extremely short.`
};
