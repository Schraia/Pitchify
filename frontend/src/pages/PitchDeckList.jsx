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

  return (
    <div className='mainscreens' style={{ padding: "2rem" }}>
      <h2 className="mainFonts">Saved Pitch Decks</h2>
      <div className="prevDeckContainer">
        {pitchDecks.map((pitch) => (
          <div
            key={pitch.id}
            onClick={() => navigate(`/pitch-decks/${pitch.id}`)}
            className="previewDeck"
          >
            {/* <h3>{pitch.id || "NO ID"}</h3> */}
            <h3>{pitch.pitchTitle || "Untitled Pitch"}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PitchDeckList;
