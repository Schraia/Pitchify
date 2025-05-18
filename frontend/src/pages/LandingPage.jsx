import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./styles/webstyle.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (username) {
      navigate("/main");
    }
  }, [username, navigate]);

  return (
    <body className="landContainer">
        <div className="titleContainer">
        <h1 className="titleText">Pitchify</h1>
        <p style={{fontSize:28}}>
          Turn your raw idea into a full AI-generated pitch deck <br/> with editable slides, scripts, and themes.
        </p>
        <div className="btnContainer">
          <button className="pinkBtn" onClick={() => navigate("/login")} style={{ marginRight: "0.5rem" }}>
            Login
          </button>
          <button className="blackBtn" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>
    </body>
  );
}
