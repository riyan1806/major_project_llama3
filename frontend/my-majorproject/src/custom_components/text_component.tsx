import React from 'react'
import PropTypes from 'prop-types'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
const Text_component = props => {

    const [inputText, setInputText] = useState("");

    const handleInputChange = (e) => {
    setInputText(e.target.value);
    };
    
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
    </div>
  )
}

Text_component.propTypes = {

}

export default Text_component
