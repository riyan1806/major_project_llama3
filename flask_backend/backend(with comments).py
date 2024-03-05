# Import necessary libraries and modules
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer
import nltk
import requests
from pydub import AudioSegment
import os
import time
import shutil
import traceback
from werkzeug.utils import secure_filename
from flask import send_file

# Initialize Flask app
app = Flask(__name__)
CORS(app)



# Define API URLs and headers for text and audio models
API_URL_TEXT = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
HEADERS_TEXT = {"Authorization": "Bearer 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"}

API_URL_AUDIO = "https://api-inference.huggingface.co/models/openai/whisper-base"
HEADERS_AUDIO = {"Authorization": "Bearer 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"}

# Imagga API credentials and URL for image classification
API_KEY = 'acc_37f647780a956db'
API_SECRET = '4d2d0bc746303f1e13a6fe7d53237569'
IMAGGA_API_URL = 'https://api.imagga.com/v2/tags'

# API and headers for image captioning
IMGCAP_API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
IMGCAP_HEADERS = {"Authorization": "Bearer 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"}

# Function to query text model
def query_text(payload):
    response = requests.post(API_URL_TEXT, headers=HEADERS_TEXT, json=payload)
    return response.json()

# Function to query audio model
def query_audio(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL_AUDIO, headers=HEADERS_AUDIO, data=data)
    return response.json()

# Function to query image captioning model
def query_image_captioning(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(IMGCAP_API_URL, headers=IMGCAP_HEADERS, data=data)
    return response.json()

# Function to summarize text using BART model
def summarize_text(input_text):
    # Tokenize the input text and split into chunks
    sentences = nltk.tokenize.sent_tokenize(input_text)
    max_token_length = tokenizer.model_max_length
    chunks = [input_text[i:i+max_token_length] for i in range(0, len(input_text), max_token_length)]

    # Query the text summarization model for each chunk
    final_output = [query_text({"inputs": chunk}) for chunk in chunks]

    # Extract and concatenate the summary text from the model output
    result_text = "".join(item if isinstance(item, str) else item.get("summary_text", "") for sublist in final_output for item in sublist)

    if result_text.strip():
        return result_text
    else:
        return "No summary available"

# Function to summarize audio using Whisper ASR model
def summarize_audio(input_file, output_directory, segment_length_ms=25000):
    # Split the input audio file into segments
    audio_segments = split_mp3(input_file, output_directory, segment_length_ms)
    final_audio_op = []

    max_retries = 3
    retry_delay = 5  # Wait for 5 seconds between retries
    try:
        # Query the audio summarization model for each segment
        for i, segment in enumerate(audio_segments):
            for _ in range(max_retries):
                output = query_audio(segment)
                if "error" not in output:
                    final_audio_op.append(output)
                    break
                else:
                    print(f"Request failed with error: {output['error']}. Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
            else:
                print(f"Max retries reached for segment {i}. Service is still unavailable.")

        # Process the final audio summarization output
        result_string = process_final_audio_op(final_audio_op)
        return result_string
    finally:
        # Delete the "Audio_segments" directory after processing
        if os.path.exists(output_directory):
            print(f"Removing directory: {output_directory}")
            shutil.rmtree(output_directory)
        else:
            print(f"Directory not found: {output_directory}")

# Function to split an audio file into segments
def split_mp3(input_file, output_directory, segment_length_ms=25000):
    audio = AudioSegment.from_file(input_file)
    num_segments = len(audio) // segment_length_ms
    remaining_length = len(audio) % segment_length_ms

    os.makedirs(output_directory, exist_ok=True)

    audio_segments = []

    for i in range(num_segments):
        start_time = i * segment_length_ms
        end_time = (i + 1) * segment_length_ms
        segment = audio[start_time:end_time]
        segment_name = os.path.join(output_directory, f"segment_{i}.mp3")
        segment.export(segment_name, format="mp3")
        audio_segments.append(segment_name)

    if remaining_length > 0:
        remaining_segment = audio[-remaining_length:]
        remaining_segment_name = os.path.join(output_directory, f"segment_{num_segments}.mp3")
        remaining_segment.export(remaining_segment_name, format="mp3")
        audio_segments.append(remaining_segment_name)
    return audio_segments

# Function to process the final output of audio summarization
def process_final_audio_op(final_audio_op):
    key_to_extract = "text"
    values_list = [d.get(key_to_extract, "").strip('"').replace("'", "") for d in final_audio_op]

    result_string = ' '.join(values_list)
    return result_string

# Endpoint for text summarization
@app.route('/summarize/text', methods=["POST"])
def summarize_text_endpoint():
    try:
        # Check if 'text' is provided in the request form
        if 'text' not in request.form:
            return jsonify({"error": "No text provided"}), 400

        # Get the input text from the request form
        input_text = request.form['text']

        # Summarize the text
        summarized_text = summarize_text(input_text)

        # Return the summarized text in the response
        return jsonify({"result": summarized_text}), 200
    except Exception as e:
        # Handle exceptions and return an error response
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Endpoint for audio summarization
@app.route('/summarize/audio', methods=["POST"])
def summarize_audio_endpoint():
    try:
        # Check if 'audio_file' is provided in the request files
        if 'audio_file' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        # Get the audio file from the request files
        audio_file = request.files['audio_file']

        # Check if the audio file is empty
        if audio_file.filename == '':
            return jsonify({"error": "Empty audio file provided"}), 400

        # Save the audio file to a temporary path
        temp_audio_path = "temp_audio.mp3"
        print(f"Saving audio file to: {temp_audio_path}")
        audio_file.save(temp_audio_path)
        print(f"File saved successfully")

        # Summarize the audio
        summarized_audio = summarize_audio(temp_audio_path, "Audio_segments")
        summarized_text = summarize_text(summarized_audio)

        # Delete the temporary audio file
        if os.path.exists(temp_audio_path):
            print(f"Removing file: {temp_audio_path}")
            os.remove(temp_audio_path)
        else:
            print(f"File not found: {temp_audio_path}")

        # Return the summarized text in the response
        return jsonify({"result": summarized_text}), 200
    except Exception as e:
        # Handle exceptions and return an error response
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Endpoint for image classification
@app.route('/classification', methods=['POST'])
def classify_image():
    try:
        # Check if 'image_file' is provided in the request files
        if 'image_file' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        # Get the image file from the request files
        image_file = request.files['image_file']

        # Check if the image file is empty
        if image_file.filename == '':
            return jsonify({"error": "Empty image file provided"}), 400

        # Perform image classification using Imagga API
        response = requests.post(
            IMAGGA_API_URL,
            auth=(API_KEY, API_SECRET),
            files={'image': (image_file.filename, image_file.read())}
        )

        # Check the response status code and return the result in the response
        if response.status_code == 200:
            result = response.json()
            print(result)
            return jsonify({"result": result}), 200
        else:
            return jsonify({"error": "Image classification failed"}), 500

    except Exception as e:
        # Handle exceptions and return an error response
        return jsonify({"error": str(e)}), 500

# Endpoint for image captioning
@app.route('/caption_image', methods=["POST"])
def caption_image():
    try:
        # Check if 'image_file' is provided in the request files
        if 'image_file' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        # Get the image file from the request files
        image_file = request.files['image_file']

        # Check if the image file is empty
        if image_file.filename == '':
            return jsonify({"error": "Empty image file provided"}), 400

        # Create the temp_images directory if it doesn't exist
        temp_images_dir = "temp_images"
        os.makedirs(temp_images_dir, exist_ok=True)

        # Save the uploaded image to a temporary file
        filename = secure_filename(image_file.filename)
        temp_image_path = os.path.join(temp_images_dir, filename)
        image_file.save(temp_image_path)

        # Perform image captioning using the saved file path
        result = query_image_captioning(temp_image_path)

        # Delete the temporary image file after processing
        os.remove(temp_image_path)

        # Return the image captioning result in the response
        return jsonify({"result": result}), 200

    except Exception as e:
        # Handle exceptions and return an error response
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, threaded=True)
