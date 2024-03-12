"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import TextToSpeechButton from "@/custom_components/tts";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Table1 from "@/custom_components/table1";
import AudioPlayer from "@/custom_components/audio";

export default function CardWithForm() {
  const [input, setInput] = useState("text");
  const [inputText, setInputText] = useState("");
  const [selectedOption, setSelectedOption] = useState("captioning");
  const [audioFile, setAudioFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [summarizationResult, setSummarizationResult] = useState("");
  const [audio_result, setAudioResult] = useState("");
  const [pdf_result, setPdfResult] = useState("");
  const [image_result1 , setImageResult1] = useState("");
  const [generatedText, setGeneratedText] = useState(null);
  const [image_result2 , setImageResult2] = useState("");
  const [error, setError] = useState("");
  const [audioSrc,setAudioSrc] = useState("");

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleInputTypeChange = (selectedType) => {
    setInput(selectedType);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event);
    if (selectedOption === "captioning"){
        setImageResult1(null)
    }
    if (selectedOption === "classification"){
      setImageResult2(null)
  }
  };

  const handleAudioChange = (e) => {
    const selectedFile = e.target.files[0];
  
    if (selectedFile) {
      setAudioFile(selectedFile);
      setAudioSrc(selectedFile);
    }
  };

  const handlePdfChange = (e) => {
    const selectedFile = e.target.files[0];
  
    if (selectedFile) {
      setPdfFile(selectedFile);
    }
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

  const handleSummarize = async () => {
    try {
      const formData = new FormData();
      formData.append("text", inputText);

      const response = await fetch(`http://localhost:5000/summarize/text`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSummarizationResult(result.result);
        setError("");
      } else {
        setSummarizationResult("");
        setError(result.error || "An error occurred");
      }
    } catch (error) {
      setSummarizationResult("");
      setError("An error occurred");
    }
  };

  const handleAudioSummarize = async () => {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
  
      const response = await fetch(`http://localhost:5000/summarize/audio`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setAudioResult(result.result);
        setError('');
      } else {
        setAudioResult('');
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      setAudioResult('');
      setError('An error occurred');
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
        const image_result1 = await response.json();
        setImageResult1(image_result1);
        setGeneratedText(image_result1.result[0]?.generated_text);
        console.log(image_result1)
        setError(null);
      } else {
        const errorText = await response.text();
        setImageResult1(null);
        setError(`Image captioning failed: ${errorText}`);
      }
    } catch (error) {
      setImageResult1(null);
      setError("An error occurred");
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
        setImageResult2(result);
        setError(null);
      } else {
        const errorText = await response.text();
        setImageResult2(null);
        setError(`Image classification failed: ${errorText}`);
      }
    } catch (error) {
      setImageResult2(null);
      setError("An error occurred");
    }
  };
  const handleOCR = async () => {
    try {
        const formData = new FormData();
        formData.append("pdf_file", pdfFile);

        const response = await fetch("http://localhost:5000/extract_text", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        console.log(result);

        if (response.ok) {
            const extractedText = result.text;

            const summarizationFormData = new FormData();
            summarizationFormData.append("text", extractedText);

            const summarizationResponse = await fetch("http://localhost:5000/summarize/text", {
                method: "POST",
                body: summarizationFormData,
            });

            const summarizationResult = await summarizationResponse.json();

            if (summarizationResponse.ok) {
                console.log(summarizationResult);
                setPdfResult(summarizationResult.result);
                setError("");
            } else {
                setError(summarizationResult.error || "An error occurred");
            }
        } else {
            setError(result.error || "An error occurred");
        }
    } catch (error) {
        setError("An error occurred");
    }
};

  const tags = image_result2?.result?.tags;
  
  function countWords(text) {
    // Remove leading and trailing whitespaces
    text = String(text).trim();
  
    // Split the text into an array of words
    let words = text.split(/\s+/);
  
    // Filter out empty strings (e.g., multiple whitespaces)
    words = words.filter(word => word.length > 0);
  
    // Return the number of words
    return words.length;
  }
  

  return (
    <main className="justify-center items-center h-screen flex m-0 overflow-y-auto bg-slate-200">
      <Card className="w-full h-screen overflow-y-scroll py-10 ">
        <CardHeader>
          <CardTitle className="text-4xl">AI Summarization </CardTitle>
          <CardDescription>Summarization in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4 py-2">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="inputType">Input Type</Label>
                <Select onValueChange={handleInputTypeChange} value={input}>
                  <SelectTrigger id="inputType">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                {input === "text" && (
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="name">Text Input</Label>
                    <Textarea
                      id="name"
                      placeholder="Type here"
                      value={inputText}
                      onChange={handleInputChange}
                    />
                    <div className="flex flex-row space-x-10">
                    <p>Character Count: {inputText.length}</p>
                    <p className="">
                      Word Count: {countWords(inputText)}
                    </p>
                    </div>
                  </div>
                )}
                {input === "audio" && (
                  <div className="flex flex-col space-y-2 pt-3">
                    <Label htmlFor="name">Upload Audio File:</Label>
                    <Input type="file" accept=".mp3" onChange={handleAudioChange} />
                {audioSrc && (
                    <div>
                      <h1>Audio Preview:</h1>
                      <AudioPlayer audioSrc={audioSrc} />
                    </div>
                )}
                  </div>
                )}
                 {input === "pdf" && (
                  <div className="flex flex-col space-y-2 pt-3">
                    <Label htmlFor="name">Upload PDF File:</Label>
                    <Input type="file" accept=".pdf" onChange={handlePdfChange} />
                  </div>
                )}
                {input === "image" && (
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="inputImageType">Select Image Task</Label>
                    <Select
                      onValueChange={handleOptionChange}
                      value={selectedOption}
                    >
                      <SelectTrigger id="inputImageType">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="captioning">Captioning</SelectItem>
                        <SelectItem value="classification">
                          Classification
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Label htmlFor="name">Upload Image:</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imageUrl && (
                      <div>
                        <h2>Image Preview:</h2>
                        <img
                          src={imageUrl}
                          alt="Selected Image"
                          className="w-1/5 items-center h-fit
                          "
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="grid w-full items-center gap-4 py-2">
          {input ==="text" && (
           <Button className="w-fit" onClick={handleSummarize}>
            Summarize
            </Button>
          )}
          {input ==="audio" && (
           <Button className="w-fit" onClick={handleAudioSummarize}>
            Summarize
            </Button>
          )}
          {input ==="pdf" && (
           <Button className="w-fit" onClick={handleOCR}>
            Summarize
            </Button>
          )}
          {input ==="image" && selectedOption === "captioning" && (
           <Button className="w-fit" onClick={handleImageCaptioning}>
            Summarize
            </Button>
          )}
          {input ==="image" && selectedOption === "classification" && (
           <Button className="w-fit" onClick={handleImageClassification}>
            Summarize
            </Button>
          )}
          <div>
            {summarizationResult && input==="text" &&  (
              <div className="">
                <h2 className="justify-center py-2">Summarization Result:</h2>
                <Textarea className="pt-5 h-[200px] ">
                  {summarizationResult}
                </Textarea>
                <div className="flex flex-row space-x-4">
                    <p className="py-2">Summary Character Count: {summarizationResult.length}</p>
                    <p className="py-2">
                      Summary Word Count: {countWords(summarizationResult)}
                    </p>
                </div>
                <TextToSpeechButton summarizedText={summarizationResult}/>      
              </div>
            )} 
              {pdf_result && input==="pdf" &&  (
              <div className="">
                <h2 className="justify-center py-2">Summarization Result:</h2>
                <Textarea className="pt-5 h-[200px] ">
                  {pdf_result}
                </Textarea>
                <div className="flex flex-row space-x-4">
                    <p className="py-2">Summary Character Count: {pdf_result.length}</p>
                    <p className="py-2">
                      Summary Word Count: {countWords(pdf_result)}
                    </p>
                </div>
                <TextToSpeechButton summarizedText={pdf_result}/>      
              </div>
            )}
            {audio_result && input==="audio" &&  (
              <div className="">
                <h2 className="justify-center py-2">Summarization Result:</h2>
                <Textarea className="pt-5 h-[200px] ">
                  {audio_result}
                </Textarea>
                <div className="flex flex-row space-x-4">
                    <p className="py-2">Summary Character Count: {audio_result.length}</p>
                    <p className="py-2">
                      Summary Word Count: {countWords(audio_result)}
                    </p>
                </div>
                <TextToSpeechButton summarizedText={audio_result}/>      
              </div>
            )}
             {image_result1 && input==="image" &&  (
              <div className="">
                <h2 className="justify-center py-2">Summarization Result:</h2>
                <Label className="pt-5 h-[200px] c">
                  {generatedText.slice(0,1).toUpperCase() + generatedText.slice(1, generatedText.length)}
                </Label>   
              </div>
            )}
            {image_result2 && input==="image" &&   (
              <div className="">
                <h2 className="justify-center py-2">Summarization Result:</h2>
                <Table1 jsonResponse={image_result2}/>
              </div>
            )}    
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
