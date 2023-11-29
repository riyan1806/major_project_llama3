import React, { useState } from 'react';
import TextToSpeechButton from './TextToSpeechButton'; 


function TextModule() {
  const [inputType, setInputType] = useState('text');
  const [inputText, setInputText] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [summarizationResult, setSummarizationResult] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSummarize = async () => {
    try {
      const formData = new FormData();
      formData.append('text', inputText);

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
    <div>
      <h1>Text Summarizer</h1>
      <div>
      </div>
        <div>
          <label>
            Input Text:
            <textarea value={inputText} onChange={handleInputChange} />
          </label>
        </div>
      <button onClick={handleSummarize}>Summarize</button>
      <div>
        <h2>Summarization Result:</h2>
        {summarizationResult && <p>{summarizationResult}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <TextToSpeechButton summarizedText={summarizationResult} />
      </div>
    </div>
  );
}

export default TextModule;
