import React, { useState, useEffect } from 'react';

const TextToSpeechButton = ({ summarizedText }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (utterance) {
      utterance.onend = () => {
        setIsSpeaking(false);
        setPaused(false);
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance Error:', event.error);
        setIsSpeaking(false);
        setPaused(false);
      };
    }
  }, [utterance]);

  const handleSpeak = () => {
    if (speechSynthesis) {
      let newUtterance;

      if (paused) {
        // If paused, resume from the current position
        newUtterance = utterance;
        speechSynthesis.resume();
        setPaused(false);
      } else {
        // If not paused, create a new utterance
        newUtterance = new SpeechSynthesisUtterance(summarizedText);
        setUtterance(newUtterance);
        speechSynthesis.speak(newUtterance);
      }

      setIsSpeaking(true);
    }
  };

  const handlePause = () => {
    if (speechSynthesis) {
      speechSynthesis.pause();
      setPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setPaused(false);
      setIsSpeaking(false);
    }
  };

  return (
    <div>
      <button onClick={handleSpeak} disabled={isSpeaking}>
        Speak
      </button>
      <button onClick={handlePause} disabled={!isSpeaking || paused}>
        Pause
      </button>
      <button onClick={handleStop} disabled={!isSpeaking}>
        Stop
      </button>
    </div>
  );
};

export default TextToSpeechButton;