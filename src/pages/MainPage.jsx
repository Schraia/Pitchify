import { useState } from "react";
import { generatePitchDeck } from "../lib/gemini";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const [idea, setIdea] = useState("");
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!idea.trim()) return alert("Please enter your idea");
  
    try {
      const pitchData = await generatePitchDeck(idea);
      console.log("Generated pitch deck:", pitchData);
      navigate("/results", { state: { pitchData } });  

    } catch (err) {
      console.error("Gemini error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div>
      <div>
        <h1>Enter Your Idea</h1>
        <p>
          Describe your idea in a few sentences. We'll generate a pitch deck structure and script.
        </p>
        <textarea
          rows={6}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea here..."
        ></textarea>
        <button
          onClick={handleGenerate}
        >
          Generate Pitch
        </button>
      </div>
    </div>
  );
}
