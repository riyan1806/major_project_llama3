import React, { useRef, useEffect } from 'react';

const AudioPlayer = ({ audioSrc }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.src = URL.createObjectURL(audioSrc);
    }
  }, [audioSrc]);

 

  return (
    <div>
      <audio ref={audioRef} controls>
        Your browser does not support the audio element.
      </audio>
  
    </div>
  );
};

export default AudioPlayer;
