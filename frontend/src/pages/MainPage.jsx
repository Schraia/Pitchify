import { useState } from "react";
import { generatePitchDeck } from "../lib/gemini";
import { useNavigate } from "react-router-dom";
import { FiPower } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export default function MainPage() {
  const [idea, setIdea] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return alert("Please enter your idea");

    const username = localStorage.getItem('username');
    if (!username) return alert("You must be logged in to save a pitch deck.");

    try {
      const pitchData = await generatePitchDeck(idea);
      // Save to backend
      const res = await axios.post('http://127.0.0.1:3000/api/pitch-decks', {
        username,
        pitch: pitchData
      });
      const id = res.data.deck_id;
      // Optionally, you can still save locally for offline use
      // localStorage.setItem(`pitch_${id}`, JSON.stringify(pitchData));
      navigate(`/pitch-decks/${id}`);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return ( 
    <div className="mainscreens">
      <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <FiPower
        style={{fontSize:35,color:"#FF047D"}}
        onClick={handleLogout}
        />
      </div>
      <h1 style={{fontSize: 48,}}>Enter Your Idea</h1>
      <textarea
        rows={6}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Describe your idea here..."
      />
      <div>
          <button className="pinkBtn" onClick={handleGenerate}>Generate Pitch</button>
      </div>
    </div>
    </div>
  );
}
