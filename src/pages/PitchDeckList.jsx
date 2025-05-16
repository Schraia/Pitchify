import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const PitchDeckList = () => {
  const [pitchDecks, setPitchDecks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDecks = Object.keys(localStorage)
      .filter((key) => key.startsWith("pitch_"))
      .map((key) => {
        const data = JSON.parse(localStorage.getItem(key));
        return { id: key.replace("pitch_", ""), ...data };
      });
    setPitchDecks(storedDecks);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Saved Pitch Decks</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {pitchDecks.map((pitch) => (
          <div
            key={pitch.id}
            onClick={() => navigate(`/pitch-decks/${pitch.id}`)}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              cursor: "pointer",
              width: "200px",
            }}
          >
            <h3>{pitch.id || "NO ID"}</h3>
            <h3>{pitch.pitchTitle || "Untitled Pitch"}</h3>
            <p>{pitch.refinedProblem?.slice(0, 50)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PitchDeckList;
