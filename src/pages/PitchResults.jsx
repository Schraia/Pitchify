import React from "react";
import { useLocation } from "react-router-dom";

const PitchResults = () => {
  const location = useLocation();
  const pitchData = location.state?.pitchData;

  if (!pitchData) {
    return <div className="p-4">No pitch data found.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">{pitchData.pitchTitle}</h1>
      <p className="text-gray-700 text-center">{pitchData.refinedProblem}</p>

      <div className="space-y-4">
        {pitchData.slides.map((slide, index) => (
          <div key={index} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-2">Slide {index + 1}: {slide.title}</h2>
            <p className="mb-2">{slide.content}</p>
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer">Presenter Notes</summary>
              <p className="mt-1">{slide.presenterNotes}</p>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PitchResults;
