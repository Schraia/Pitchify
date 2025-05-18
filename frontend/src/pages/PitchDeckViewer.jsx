import { Rnd } from "react-rnd";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles/PitchDeckViewer.css";
import { nanoid } from "nanoid";

const PitchDeckViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragtextbox, setdragTextbox] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [selectedTextboxId, setSelectedTextboxId] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const canvasRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const themes = {
    default: {
      name: "Default",
      background: "#ffffff",
      textColor: "#000000",
      borderColor: "#cccccc",
    },
    dark: {
      name: "Dark Mode",
      background: "#1e1e1e",
      textColor: "#ffffff",
      borderColor: "#444",
    },
    ocean: {
      name: "Ocean Blue",
      background: "#e0f7fa",
      textColor: "#01579b",
      borderColor: "#4dd0e1",
    },
    sunset: {
      name: "Sunset",
      background: "#ffe0b2",
      textColor: "#bf360c",
      borderColor: "#ff7043",
    },
    forest: {
      name: "Forest",
      background: "#e8f5e9",
      textColor: "#1b5e20",
      borderColor: "#81c784",
    },
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        canvasRef.current &&
        !canvasRef.current.contains(event.target)
      ) {
        setSelectedTextboxId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!deck) return;
    const saveData = {
      deckId: id,
      theme: selectedTheme,
      textboxes: dragtextbox,
      currentSlide,
    };
    localStorage.setItem(`pitch-deck-${id}`, JSON.stringify(saveData));
  }, [selectedTheme, dragtextbox, currentSlide]);
  
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:3000/api/pitch-decks/${id}`)
      .then((res) => {
        const savedData = localStorage.getItem(`pitch-deck-${id}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setSelectedTheme(parsed.theme || "default");
          setdragTextbox(parsed.textboxes || {});
          setCurrentSlide(parsed.currentSlide || 0);
        }
        setDeck(res.data);
      })
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


  if (!deck) return null;

  const { pitchTitle, slides = [] } = deck;
  const allSlides = [{ title: pitchTitle, content: "", presenterNotes: "" }, ...slides];
  const slide = allSlides[currentSlide];

  const handleSave = () => {
    setIsSaving(true);

    const saveData = {
      deckId: id,
      theme: selectedTheme,
      textboxes: dragtextbox,
      currentSlide,
    };

    localStorage.setItem(`pitch-deck-${id}`, JSON.stringify(saveData));

    setTimeout(() => {
      setIsSaving(false);
      alert("Your changes has been saved.");
    }, 500);
  };

  return (
    <div className="results-container">
      <div className="theme-panel">
        <h3>Themes</h3>
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            className={`theme-btn ${selectedTheme === key ? "active" : ""}`}
            onClick={() => setSelectedTheme(key)}
          >
            {theme.name}
          </button>
        ))}
      </div>
      <div ref={canvasRef} className="slide-canvas" style={{
        backgroundColor: themes[selectedTheme].background,
        color: themes[selectedTheme].textColor,
        borderColor: themes[selectedTheme].borderColor,
      }}>
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
            className={`rnd-textbox ${selectedTextboxId === box.id ? "selected" : ""}`}
            onClick={() => setSelectedTextboxId(box.id)}
            onDragStop={(e, d) => {
              setSelectedTextboxId(box.id);
              setdragTextbox((prev) => {
                const updated = prev[`slide-${currentSlide}`].map((b) =>
                  b.id === box.id ? { ...b, x: d.x, y: d.y } : b
                );
                return { ...prev, [`slide-${currentSlide}`]: updated };
              });
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setSelectedTextboxId(box.id);
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
            {selectedTextboxId === box.id && (
              <button
                className="delete-btn"
                onClick={() => {
                  setdragTextbox((prev) => {
                    const updated = prev[`slide-${currentSlide}`].filter((b) => b.id !== box.id);
                    return { ...prev, [`slide-${currentSlide}`]: updated };
                  });
                  setSelectedTextboxId(null);
                }}
              >
                ❌
              </button>
            )}
            <textarea
              className="rnd-textarea"
              value={box.text}
              style={{ color: themes[selectedTheme].textColor }}
              onClick={() => setSelectedTextboxId(box.id)}
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
        <button
          className="add-text-btn"
          onClick={() => {
            const newBox = {
              id: nanoid(),
              x: 50,
              y: 50,
              text: "New Text",
              width: 200,
              height: 60,
            };
            const key = `slide-${currentSlide}`;
            setdragTextbox((prev) => ({
              ...prev,
              [key]: [...(prev[key] || []), newBox],
            }));
          }}
        >
          + Add Text Box
        </button>
        {slide.presenterNotes && (
          <button
            className="toggle-notes-btn"
            onClick={() => setShowNotes((prev) => !prev)}
          >
            {showNotes ? "Hide" : "Show"} Presenter Notes
          </button>
        )}
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "💾 Save"}
        </button>
      </div>

      {showNotes && slide.presenterNotes && (
        <div className="presenter-notes">
          <strong>Presenter Notes:</strong> {slide.presenterNotes}
        </div>
      )}


    </div>
  );
};

export default PitchDeckViewer;
