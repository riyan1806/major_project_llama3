import React, { useState } from 'react';
import Table from './Table';
import TextToSpeechButton from './TextToSpeechButton';

const ImageModule = () => {
  const [selectedOption, setSelectedOption] = useState('captioning');
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [result_caption, setResult_Caption] = useState(null);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [generatedText, setGeneratedText] = useState(null);


  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
  
    if (selectedFile) {
      try {
        const imageUrl = URL.createObjectURL(selectedFile);
        setImageUrl(imageUrl);
        setImageFile(selectedFile);
      } catch (error) {
        console.error("Failed to create object URL:", error);
      }
    }
  };

  const handleImageClassification = async () => {
    try {
      if (!imageFile) {
        setError("Please upload an image for classification.");
        return;
      }
  
      const formData = new FormData();
      formData.append('image_file', imageFile);
  
      const response = await fetch(`http://localhost:5000/${selectedOption}`, {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const result1 = await response.json();
        const result = JSON.stringify(result1)
        setResult(result);
        setError(null);
      } else {
        const errorText = await response.text();
        setResult_Caption(null);
        setError(`Image classification failed: ${errorText}`);
      }
    } catch (error) {
      setResult(null);
      setError("An error occurred");
    }
  };
  
  const handleImageCaptioning = async () => {
    try {
      if (!imageFile) {
        setError("Please upload an image for captioning.");
        return;
      }
  
      const formData = new FormData();
      formData.append('image_file', imageFile);
  
      const response = await fetch('http://localhost:5000/caption_image', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const result_caption = await response.json();
        setResult_Caption(result_caption);
        setGeneratedText(result_caption.result[0]?.generated_text);
        console.log(result_caption)
        setError(null);
      } else {
        const errorText = await response.text();
        setResult_Caption(null);
        setError(`Image captioning failed: ${errorText}`);
      }
    } catch (error) {
      setResult_Caption(null);
      setError("An error occurred");
    }
  };

  return (
    <div>
      <h1>Image Summarizer</h1>
      <div>
        <label>
          Choose Option:
          <select value={selectedOption} onChange={handleOptionChange}>
            <option value="captioning">Image Captioning</option>
            <option value="classification">Image Classification</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Upload Image:
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
      </div>
      {imageUrl && (
        <div>
          <h2>Image</h2>
          <img src={imageUrl} alt="Selected Image" style={{ maxWidth: '100%' }} />
        </div>
      )}
      {selectedOption === 'classification' && (
        <button onClick={handleImageClassification}>Classify Image</button>
      )}
      {selectedOption === 'captioning' && (
        <button onClick={handleImageCaptioning}>Caption Image</button>
      )}
      <div>
        <h2>Result:</h2>
        {selectedOption === 'classification' && (
          <div>
          {result && <Table jsonResponse={result}/>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>)}
          {selectedOption === 'captioning' && (
          <div>
           {result_caption &&
              result_caption.result &&
              result_caption.result.map((item, index) => (
              //  setGeneratedText(item.generated_text)
              <p key={index}>{item.generated_text}</p>
              ))}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {selectedOption === 'captioning' && (
          <TextToSpeechButton summarizedText={generatedText}/>
          )}
          </div>)}
      </div>
    </div>
  );
};

export default ImageModule;
