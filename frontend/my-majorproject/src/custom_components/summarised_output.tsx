"use client";

import React from 'react'
import PropTypes from 'prop-types'
import { useState } from 'react'
import TextToSpeechButton from './tts'
import { Textarea } from '@/components/ui/textarea'


const summarised_output = props => { 
  const [summarizationResult, setSummarizationResult] = useState("");
    const [error, setError] = useState("");

    function countWords(text) {
        // Remove leading and trailing whitespaces
        text = text.trim();
      
        // Split the text into an array of words
        let words = text.split(/\s+/);
      
        // Filter out empty strings (e.g., multiple whitespaces)
        words = words.filter(word => word.length > 0);
      
        // Return the number of words
        return words.length;
      }
       
  return (
    <div>
        <div>
            {summarizationResult && (
              <div className="">
                <h2 className="justify-center py-2">Summarization Result:</h2>
                <Textarea disabled className="pt-5 h-[200px] ">
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
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
    </div>
  )
}

summarised_output.propTypes = {
 
}

export default summarised_output
