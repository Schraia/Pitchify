import { useState } from "react";
import { generatePitchDeck } from "../lib/gemini";
import { useNavigate } from "react-router-dom";

export default function IdeaInputPage() {
  const [idea, setIdea] = useState("");
  const navigate = useNavigate();
  const handleGenerate = async () => {
    if (!idea.trim()) return alert("Please enter your idea");
  
    try {
      const pitchData = await generatePitchDeck(idea);
      console.log("Generated pitch deck:", pitchData);
      navigate("/results", { state: { pitchData } });  
      // TODO: save to context or navigate to /edit page with pitchData
    } catch (err) {
      console.error("Gemini error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
      <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-4 text-indigo-600">Enter Your Idea</h1>
        <p className="text-gray-600 mb-6">
          Describe your idea in a few sentences. We'll generate a pitch deck structure and script.
        </p>
        <textarea
          rows={6}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="E.g. An AI tool that helps students instantly generate project proposals..."
        ></textarea>
        <button
          onClick={handleGenerate}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Generate Pitch
        </button>
      </div>
    </div>
  );
}
