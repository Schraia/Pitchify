import { useState } from "react";
import { generatePitchDeck } from "../lib/gemini";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function MainPage() {
  const [idea, setIdea] = useState("");
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!idea.trim()) return alert("Please enter your idea");

    try {
      const pitchData = await generatePitchDeck(idea);
      const id = uuidv4();
      console.log("Generated pitch ID:", id);
      localStorage.setItem(`pitch_${id}`, JSON.stringify(pitchData));
      navigate(`/pitch-decks/${id}`);
    } catch (err) {
      console.error("Gemini error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Enter Your Idea</h1>
      <textarea
        rows={6}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Describe your idea here..."
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <button onClick={handleGenerate}>Generate Pitch</button>
    </div>
  );
}
