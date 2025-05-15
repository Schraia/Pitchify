import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles/PitchResults.css"; // Make sure this path matches your project structure

const PitchResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!state || !state.pitchData) {
    navigate("/input");
    return null;
  }

  const { pitchTitle, refinedProblem, slides } = state.pitchData;

  const allSlides = [
    {
      title: pitchTitle,
      content: "",
      presenterNotes: "",
      type: "title",
    },
    {
      title: "Refined Problem",
      content: refinedProblem,
      presenterNotes: "",
      type: "problem",
    },
    ...slides.map((s) => ({
      ...s,
      type: "content",
    })),
  ];

  const slide = allSlides[currentSlide];

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleNext = () => {
    if (currentSlide < allSlides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  return (
    <div className="results-container">
      <div className="slide-canvas">
        <h2 className="slide-title">{slide.title}</h2>
        {slide.content && (
          <p className="slide-content">
            {slide.content.replace(/\*+/g, "").trim()}
          </p>
        )}
        {slide.presenterNotes && (
          <p className="slide-notes">Notes: {slide.presenterNotes}</p>
        )}
      </div>

      <div className="navigation">
        <button onClick={handlePrev} disabled={currentSlide === 0}>
          Previous
        </button>
        <span>
          Slide {currentSlide + 1} of {allSlides.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentSlide === allSlides.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PitchResults;
