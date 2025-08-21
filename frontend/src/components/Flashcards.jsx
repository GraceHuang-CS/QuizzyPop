//Flashcards.jsx
import React, { useState } from "react";
import "../styles/cpns/Flashcards.css";

const Flashcards = ({ cards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState([]);
  if (flippedCards.length !== cards.length) {
    setFlippedCards(Array(cards.length).fill(false));
  }

  if (!cards || cards.length === 0) return null;

  const card = cards[currentCardIndex];

  const handleFlip = () => {
    const newFlipped = [...flippedCards];
    newFlipped[currentCardIndex] = !newFlipped[currentCardIndex];
    setFlippedCards(newFlipped);
  };

  const handlePrev = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentCardIndex((prev) => (prev < cards.length - 1 ? prev + 1 : prev));
  };
  return (
    <>
      <h3>Flashcards</h3>
      <div className="flashcards-container">
        <div className="flashcard-single" onClick={handleFlip}>
          {flippedCards[currentCardIndex] ? (
            <div className="flashcard-back">
              <div className="flashcard-content">{card.back}</div>
            </div>
          ) : (
            <div className="flashcard-front">
              <div className="flashcard-content">{card.front}</div>
              <div className="flashcard-label">
                Click the card to see the answer.
              </div>
            </div>
          )}
        </div>

        <div className="flashcard-navigation">
          <button onClick={handlePrev} disabled={currentCardIndex === 0}>
            ←
          </button>
          <p className="text-in">
            ({currentCardIndex + 1} / {cards.length})
          </p>
          <button
            onClick={handleNext}
            disabled={currentCardIndex === cards.length - 1}
          >
            →
          </button>
        </div>
      </div>
    </>
  );
};

export default Flashcards;
