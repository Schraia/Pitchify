import { Rnd } from "react-rnd";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./styles/PitchDeckViewer.css";
import { nanoid } from "nanoid";

const PitchDeckViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [textBoxes, setTextBoxes] = useState([]);
  const [dragtextbox, setdragTextbox] = useState({});

  useEffect(() => {
    axios.get(`http://127.0.0.1:3000/api/pitch-decks/${id}`)
      .then(res => setDeck(res.data))
      .catch(() => {
        alert("Pitch deck not found.");
        navigate("/decks");
      });
  }, [id, navigate]);

  useEffect(() => {
    if (!deck) return;

    const currentSlideKey = `slide-${currentSlide}`;

    if (!dragtextbox[currentSlideKey]) {
      const contentBox = allSlides[currentSlide]?.content
        ? [{
          id: nanoid(),
          x: 100,
          y: 100,
          text: allSlides[currentSlide].content,
          width: 300,
          height: 100,
        }]
        : [];

      const titleBox = allSlides[currentSlide]?.title
        ? [{
          id: nanoid(),
          x: 50,
          y: 30,
          text: allSlides[currentSlide].title,
          width: 300,
          height: 60,
        }]
        : [];

      const newBoxes = [...titleBox, ...contentBox];

      setdragTextbox(prev => ({
        ...prev,
        [currentSlideKey]: newBoxes
      }));
    }
  }, [deck, currentSlide]);

  const handleAddTextBox = () => {
    const newTextBox = {
      id: Date.now(),
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      text: "Edit me!",
    };
    setTextBoxes((prev) => [...prev, newTextBox]);
  };

  const updateText = (id, value) => {
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, text: value } : box))
    );
  };

  if (!deck) return null;

  const { pitchTitle, slides = [] } = deck;
  const allSlides = [{ title: pitchTitle, content: "", presenterNotes: "" }, ...slides];
  const slide = allSlides[currentSlide];

  return (
    <div className="results-container">
      <div className="slide-canvas">
        {dragtextbox[`slide-${currentSlide}`]?.map((box) => (
          <Rnd
            key={box.id}
            default={{
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            }}
            bounds="parent"
            className="rnd-textbox"
            onDragStop={(e, d) => {
              setdragTextbox((prev) => {
                const updated = prev[`slide-${currentSlide}`].map((b) =>
                  b.id === box.id ? { ...b, x: d.x, y: d.y } : b
                );
                return { ...prev, [`slide-${currentSlide}`]: updated };
              });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setdragTextbox((prev) => {
                const updated = prev[`slide-${currentSlide}`].map((b) =>
                  b.id === box.id
                    ? {
                      ...b,
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      ...position,
                    }
                    : b
                );
                return { ...prev, [`slide-${currentSlide}`]: updated };
              });
            }}
          >
            <textarea
              className="rnd-textarea"
              value={box.text}
              onChange={(e) => {
                setdragTextbox((prev) => {
                  const updated = prev[`slide-${currentSlide}`].map((b) =>
                    b.id === box.id ? { ...b, text: e.target.value } : b
                  );
                  return { ...prev, [`slide-${currentSlide}`]: updated };
                });
              }}
            />
          </Rnd>
        ))}
      </div>

      <div className="navigation">
        <button onClick={() => setCurrentSlide((p) => Math.max(p - 1, 0))} disabled={currentSlide === 0}>
          Previous
        </button>
        <span>
          Slide {currentSlide + 1} of {allSlides.length}
        </span>
        <button onClick={() => setCurrentSlide((p) => Math.min(p + 1, allSlides.length - 1))} disabled={currentSlide === allSlides.length - 1}>
          Next
        </button>
        <button onClick={handleAddTextBox} style={{ marginLeft: "1rem" }}>
          ➕ Add Text Box
        </button>
      </div>

      {slide.presenterNotes && (
        <div className="presenter-notes">
          <strong>Presenter Notes:</strong> {slide.presenterNotes}
        </div>
      )}
    </div>
  );
};

export default PitchDeckViewer;
