import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>AutoPitch</h1>
      <p>
        Turn your raw idea into a full AI-generated pitch deck with editable slides, scripts, and themes.
      </p>
      <button
        onClick={() => navigate("/main")}
      >
        Get Started
      </button>
    </div>
  );
}
