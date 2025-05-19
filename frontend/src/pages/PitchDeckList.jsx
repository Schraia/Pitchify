import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const PitchDeckList = () => {
  const [pitchDecks, setPitchDecks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      setPitchDecks([]);
      return;
    }
    axios.get('http://127.0.0.1:3000/api/pitch-decks', {
      params: { username }
    })
      .then(res => setPitchDecks(res.data.pitchDecks))
      .catch(() => setPitchDecks([]));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm("Are you sure you want to delete this pitch deck?")) return;
    try {
      await axios.delete(`http://127.0.0.1:3000/api/pitch-decks/${id}`);
      setPitchDecks((prev) => prev.filter(deck => deck.id !== id));
    } catch {
      alert("Failed to delete pitch deck.");
    }
  };

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
              position: "relative",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "#b71c1c",
                background: "transparent",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                fontWeight: "bold",
                fontSize: "1.2rem",
                cursor: "pointer",
                zIndex: 2,
                lineHeight: "1",
                padding: 0,
              }}
              onClick={(e) => handleDelete(pitch.id, e)}
              title="Delete Pitch Deck"
            >
              ×
            </button>
            <h3>{pitch.pitchTitle || "Untitled Pitch"}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PitchDeckList;
