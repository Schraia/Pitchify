import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6">
      <h1 className="text-5xl font-bold mb-4">AutoPitch</h1>
      <p className="text-lg mb-8 max-w-xl text-center">
        Turn your raw idea into a full AI-generated pitch deck with editable slides, scripts, and themes.
      </p>
      <button
        onClick={() => navigate("/main")}
        className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow hover:scale-105 transition"
      >
        Get Started
      </button>
    </div>
  );
}
