import React, { useState } from 'react';
import {TextToSpeechButton} from './Components';
import {TextModule} from './Components';
import {ImageModule} from './Components'
import './App.css';

function App() {
  const [inputType, setInputType] = useState('text');
  const [inputText, setInputText] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [summarizationResult, setSummarizationResult] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleSummarize = async () => {
    try {
      const formData = new FormData();
      formData.append('text', inputText);

      if (inputType === 'audio') {
        formData.append('audio_file', audioFile);
      }

      const response = await fetch(`http://localhost:5000/summarize/${inputType}`, {
        method: 'POST',
        body: formData,
      });


      const result = await response.json();

      if (response.ok) {
        setSummarizationResult(result.result);
        setError('');
      } else {
        setSummarizationResult('');
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      setSummarizationResult('');
      setError('An error occurred');
    }
  };

  return (
    <div className="relative sm:-8 p-4 bg-[#13131a] min-h-screen flex flex-row"> 
      <h1>{inputType === 'text' ? 'Text' : 'Audio'} Summarizer</h1>
      <div>
        <label>
          Input Type:
          <select value={inputType} onChange={(e) => setInputType(e.target.value)}>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
          </select>
        </label>
      </div>
      {inputType === 'text' && (
        <div>
          <label>
            Input Text:
            <textarea value={inputText} onChange={handleInputChange} />
          </label>
        </div>
      )}
      {inputType === 'audio' && (
        <div>
          <label>
            Upload Audio File:
            <input type="file" accept=".mp3" onChange={handleAudioChange} />
          </label>
        </div>
      )}
      
      <button onClick={handleSummarize}>Summarize</button>
      <div>
        <h2>Summarization Result:</h2>
        {summarizationResult && <p>{summarizationResult}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <TextToSpeechButton summarizedText={summarizationResult} />
      </div>
      <ImageModule/>
    </div>
  );
}

export default App;

