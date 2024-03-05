import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';


const TextToSpeechButton = ({ summarizedText }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [state,setState] = useState("");
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

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

  useEffect(() => {
    if (utterance) {
      utterance.rate = speed;
    }
  }, [speed, utterance]);

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
        newUtterance.rate = speed;
        speechSynthesis.speak(newUtterance);
        console.log(newUtterance)
      }
      setState('Play')
      setIsSpeaking(true);
    }
  };

  const handlePause = () => {
    if (speechSynthesis) {
      speechSynthesis.pause();
      setPaused(true);
      setState('Pause')
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setPaused(false);
      setIsSpeaking(false);
      setState('Stop')
    }
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

  return (
    <div className='space-x-2 flex-row'>
      <button className="text-base border-solid w-[70px] bg-white border-black border-2 hover:bg-slate-200 disabled:bg-slate-700 disabled:text-muted text-black  rounded-sm hover:cursor-pointer" onClick={handleSpeak} disabled={isSpeaking}>
      {state === 'Pause' ? 'Resume' : '▶ Play'}
      </button>
      <button className="text-base border-solid w-[80px] bg-white border-black border-2 hover:bg-slate-200 disabled:bg-slate-700 disabled:text-muted text-black  rounded-sm hover:cursor-pointer" onClick={handlePause} disabled={!isSpeaking || paused}>
        ∥ Pause
      </button>
      <button className="text-base border-solid w-[80px] bg-white border-black border-2 hover:bg-slate-200 disabled:bg-slate-700 disabled:text-muted text-black  rounded-sm hover:cursor-pointer" onClick={handleStop} disabled={!isSpeaking}>
        ⬤ Stop
      </button>
      
      {/* <p className='pt-2'>Speed:</p>  */}
      <div className='pt-3 space-y-2 space-x-2 '>
      {/* <button className="text-base box-border h-[30px] w-[40px] bg-black disabled:bg-slate-500 hover:bg-slate-800 text-white rounded-sm hover:cursor-pointer" onClick={() => handleSpeedChange(1.0)}>
        1x
      </button>
      <button className="text-base box-border h-[30px] w-[40px] bg-black hover:bg-slate-800  disabled:bg-slate-500 text-white rounded-sm hover:cursor-pointer" onClick={() => handleSpeedChange(1.2)}>
        1.2x
      </button>
      <button className="text-base box-border h-[30px] w-[40px] bg-black hover:bg-slate-800  disabled:bg-slate-500 text-white rounded-sm hover:cursor-pointer" onClick={() => handleSpeedChange(1.4)}>
        1.4x
      </button> */}
      {/* <Slider defaultValue={[0]} max={2}  step={1}  className='w-3/4 sm:w-1/4 '/>
      <div className='flex flex-row space-x-12'>
        <p>1x</p>
        <p>1.2x</p>
        <p>1.4x</p>
      </div> */}
      </div>
    </div>
  );
};

export default TextToSpeechButton;
