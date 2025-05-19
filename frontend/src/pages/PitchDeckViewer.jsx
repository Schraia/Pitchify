import { Rnd } from "react-rnd";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles/PitchDeckViewer.css";
import { nanoid } from "nanoid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PptxGenJS from "pptxgenjs";

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
  const [slideImages, setSlideImages] = useState({});
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newImage = {
        id: nanoid(),
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        src: reader.result,
      };
      const key = `slide-${currentSlide}`;
      setSlideImages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), newImage],
      }));
    };
    reader.readAsDataURL(file);
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
      images: slideImages,
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
          setSlideImages(parsed.images || {});
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

  useEffect(() => {
    // Select all textareas in the current slide
    const textareas = document.querySelectorAll('.rnd-textarea');
    textareas.forEach(textarea => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  }, [currentSlide, dragtextbox, selectedTheme]);

  // Delete entire pitch deck
  const handleDeleteDeck = async () => {
    if (!window.confirm("Are you sure you want to delete this pitch deck? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://127.0.0.1:3000/api/pitch-decks/${id}`);
      // Remove localStorage backup if any
      localStorage.removeItem(`pitch-deck-${id}`);
      navigate("/decks");
    } catch (err) {
      alert("Failed to delete pitch deck.");
    }
  };

  // Delete current slide
  const handleDeleteSlide = () => {
    if (allSlides.length <= 1) {
      alert("You must have at least one slide.");
      return;
    }
    if (!window.confirm("Delete this slide?")) return;

    // Remove from deck.slides (not the title slide)
    const newSlides = [...slides];
    const slideIdx = currentSlide - 1; // Because 0 is the title slide
    if (slideIdx >= 0) {
      newSlides.splice(slideIdx, 1);
      setDeck({ ...deck, slides: newSlides });
      // Remove textboxes and images for this slide
      const newDragTextbox = { ...dragtextbox };
      const newSlideImages = { ...slideImages };
      delete newDragTextbox[`slide-${currentSlide}`];
      delete newSlideImages[`slide-${currentSlide}`];
      setdragTextbox(newDragTextbox);
      setSlideImages(newSlideImages);

      // Move to previous slide if last, else stay at same index
      setCurrentSlide((prev) =>
        prev >= allSlides.length - 1 ? prev - 1 : prev
      );
    }
  };

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
      images: slideImages,
      currentSlide,
    };

    localStorage.setItem(`pitch-deck-${id}`, JSON.stringify(saveData));

    setTimeout(() => {
      setIsSaving(false);
      alert("Your changes has been saved.");
    }, 500);
  };

  const handleDownloadPDF = async () => {
    if (!deck) return;
    setIsExportingPDF(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { pitchTitle, slides = [] } = deck;
    const allSlides = [{ title: pitchTitle, content: "", presenterNotes: "" }, ...slides];

    const prevSlide = currentSlide;

    let pdf = null;

    for (let i = 0; i < allSlides.length; i++) {
      setCurrentSlide(i);
      // Wait for the DOM to update
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 300));
      const input = document.getElementById("slides-pdf");
      // eslint-disable-next-line no-await-in-loop
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      if (i === 0) {
        // Create the PDF with the correct size for the first page
        pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      } else {
        pdf.addPage([canvas.width, canvas.height], "landscape");
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      }
    }

    setCurrentSlide(prevSlide);
    setIsExportingPDF(false);
    if (pdf) pdf.save(`${deck.pitchTitle || "pitchdeck"}.pdf`);
  };

  const handleDownloadPPTX = () => {
    if (!deck) return;
    const pptx = new PptxGenJS();
    const { pitchTitle, slides = [] } = deck;
    const allSlides = [{ title: pitchTitle, content: "", presenterNotes: "" }, ...slides];

    allSlides.forEach((slide, idx) => {
      const slideObj = pptx.addSlide();
      // Add title
      if (slide.title) {
        slideObj.addText(slide.title, { x: 0.5, y: 0.3, fontSize: 24, bold: true });
      }
      // Add content
      if (slide.content) {
        slideObj.addText(slide.content, { x: 0.5, y: 1.2, fontSize: 18, color: "363636", w: 8.5, h: 4 });
      }
      // Add presenter notes
      if (slide.presenterNotes) {
        slideObj.addNotes(slide.presenterNotes);
      }
      // Optionally, add images if you want (see docs)
    });

    pptx.writeFile({ fileName: `${pitchTitle || "pitchdeck"}.pptx` });
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
      <div id="slides-pdf" ref={canvasRef} className="slide-canvas" style={{
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
            {selectedTextboxId === box.id && !isExportingPDF && (
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
            {isExportingPDF ? (
              <div
                style={{
                  color: themes[selectedTheme].textColor,
                  fontSize: "1.1rem",
                  width: "100%",
                  minHeight: "40px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              >
                {box.text}
              </div>
            ) : (
              <textarea
                className="rnd-textarea"
                value={box.text}
                style={{
                  color: themes[selectedTheme].textColor,
                  resize: "none",
                  overflow: "hidden",
                  minHeight: "40px",
                  fontSize: "1.1rem",
                  width: "100%",
                  height: "auto"
                }}
                onClick={() => setSelectedTextboxId(box.id)}
                onChange={(e) => {
                  setdragTextbox((prev) => {
                    const updated = prev[`slide-${currentSlide}`].map((b) =>
                      b.id === box.id ? { ...b, text: e.target.value } : b
                    );
                    return { ...prev, [`slide-${currentSlide}`]: updated };
                  });
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
            )}
          </Rnd>
        ))}

        {slideImages[`slide-${currentSlide}`]?.map((img) => (
          <Rnd
          key={img.id}
          default={{ x: img.x, y: img.y, width: img.width, height: img.height }}
          bounds="parent"
          className={`rnd-image ${selectedTextboxId === img.id ? "selected" : ""}`}
          onClick={() => setSelectedTextboxId(img.id)}
          onDragStop={(e, d) => {
            setSelectedTextboxId(img.id);
            setSlideImages((prev) => {
              const updated = prev[`slide-${currentSlide}`].map((i) =>
                i.id === img.id ? { ...i, x: d.x, y: d.y } : i
              );
              return { ...prev, [`slide-${currentSlide}`]: updated };
            });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            setSelectedTextboxId(img.id);
            setSlideImages((prev) => {
              const updated = prev[`slide-${currentSlide}`].map((i) =>
                i.id === img.id
                  ? {
                      ...i,
                      width: ref.offsetWidth,
                      height: ref.offsetHeight,
                      ...position,
                    }
                  : i
              );
              return { ...prev, [`slide-${currentSlide}`]: updated };
            });
          }}
        >
          {selectedTextboxId === img.id && (
            <button
              className="delete-btn"
              onClick={() => {
                setSlideImages((prev) => {
                  const updated = prev[`slide-${currentSlide}`].filter((i) => i.id !== img.id);
                  return { ...prev, [`slide-${currentSlide}`]: updated };
                });
                setSelectedTextboxId(null);
              }}
            >
              ❌
            </button>
          )}
          <img
            src={img.src}
            alt="slide img"
            style={{ width: "100%", height: "100%", pointerEvents: "none", userSelect: "none" }}
            draggable={false}
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
        <input
          type="file"
          accept="image/*"
          id="image-upload"
          style={{ display: "none" }}
          onChange={(e) => handleAddImage(e)}
        />
        <button
          className="add-image-btn"
          onClick={() => document.getElementById("image-upload").click()}
        >
          🖼️ Add Image
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
        <button onClick={handleDownloadPDF}>Download as PDF</button>
        <button onClick={handleDownloadPPTX}>Download as PPTX</button>
        <button
          style={{
            background: "#ffe0b2",
            color: "#bf360c",
            border: "1px solid #bf360c",
            borderRadius: "4px",
            marginRight: "0.5rem",
            fontWeight: "bold",
          }}
          onClick={handleDeleteSlide}
          disabled={currentSlide === 0} // Don't allow deleting the title slide
        >
          🗑️ Delete Slide
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
