import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generatePitchDeck = async (rawIdea) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a startup pitch deck generator. 

Based on the raw idea below, generate a full pitch deck with 8-12 slides depending on the logical flow and complexity of the idea. Only include slides that add value — don’t force the number. 

### Input Idea: "${rawIdea}"

### Output Format (in JSON):
{
  "pitchTitle": "Catchy title for the pitch",
  "refinedProblem": "Refined and polished problem statement",
  "slides": [
    {
      "title": "Slide Title",
      "content": "Slide main content (paragraph or bullet points)",
      "presenterNotes": "Speaker notes for this slide"
    },
    ...
  ]
}

Ensure the slide flow follows a logical startup pitch sequence (Problem, Solution, Market, Product, Tech, Business Model, Team, Ask, etc.) but feel free to tailor it to the specific idea.

`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]);
  }

  throw new Error("Failed to parse Gemini output");
};
