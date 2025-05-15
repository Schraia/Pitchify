import React from "react";
import { useLocation } from "react-router-dom";

const PitchResults = () => {
  const location = useLocation();
  const pitchData = location.state?.pitchData;

  if (!pitchData) {
    return <div className="p-4">No pitch data found.</div>;
  }

  return (
    <div>
      <h1>{pitchData.pitchTitle}</h1>
      <p>{pitchData.refinedProblem}</p>

      <div>
        {pitchData.slides.map((slide, index) => (
          <div key={index}>
            <h2>Slide {index + 1}: {slide.title}</h2>
            <p>{slide.content}</p>
            <details>
              <summary>Presenter Notes</summary>
              <p>{slide.presenterNotes}</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PitchResults;
