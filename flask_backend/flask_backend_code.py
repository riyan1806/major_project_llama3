from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer
import nltk
import requests
from pydub import AudioSegment
import os
import time
import traceback
from werkzeug.utils import secure_filename
from flask import send_file

app = Flask(__name__)
CORS(app)
checkpoint_text = "facebook/bart-large-cnn"
tokenizer = AutoTokenizer.from_pretrained(checkpoint_text)



API_URL_TEXT = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
HEADERS_TEXT = {"Authorization": "Bearer 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"}  # Replace with your API key

API_URL_AUDIO = "https://api-inference.huggingface.co/models/openai/whisper-base"
HEADERS_AUDIO = {"Authorization": "Bearer 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"}  # Replace with your API key

API_KEY = 'acc_37f647780a956db'
API_SECRET = '4d2d0bc746303f1e13a6fe7d53237569'
IMAGGA_API_URL = 'https://api.imagga.com/v2/tags'

IMGCAP_API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
IMGCAP_HEADERS = {"Authorization": "Bearer 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"}


def query_text(payload):
    response = requests.post(API_URL_TEXT, headers=HEADERS_TEXT, json=payload)
    return response.json()

def query_audio(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL_AUDIO, headers=HEADERS_AUDIO, data=data)
    return response.json()

def query_image_captioning(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(IMGCAP_API_URL, headers=IMGCAP_HEADERS, data=data)
    return response.json()
    
def summarize_text(input_text):
    sentences = nltk.tokenize.sent_tokenize(input_text)
    max_token_length = tokenizer.model_max_length
    chunks = [input_text[i:i+max_token_length] for i in range(0, len(input_text), max_token_length)]

    final_output = [query_text({"inputs": chunk}) for chunk in chunks]

    result_text = "".join(item if isinstance(item, str) else item.get("summary_text", "") for sublist in final_output for item in sublist)

    
    if result_text.strip():
        return result_text
    else:
        return "No summary available"

def summarize_audio(input_file, output_directory, segment_length_ms=25000):
    audio_segments = split_mp3(input_file, output_directory, segment_length_ms)
    final_audio_op = []

    max_retries = 3
    retry_delay = 5  # Wait for 5 seconds between retries

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

    result_string = process_final_audio_op(final_audio_op)
    return result_string

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

def process_final_audio_op(final_audio_op):
    key_to_extract = "text"
    values_list = [d.get(key_to_extract, "").strip('"').replace("'", "") for d in final_audio_op]

    result_string = ' '.join(values_list)
    return result_string


@app.route('/summarize/text', methods=["POST"])
def summarize_text_endpoint():
    try:
        if 'text' not in request.form:
            return jsonify({"error": "No text provided"}), 400

        input_text = request.form['text']
        summarized_text = summarize_text(input_text)
        return jsonify({"result": summarized_text}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/summarize/audio', methods=["POST"])
def summarize_audio_endpoint():
    try:
        if 'audio_file' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio_file']
        if audio_file.filename == '':
            return jsonify({"error": "Empty audio file provided"}), 400

        temp_audio_path = "temp_audio.mp3"
        print(f"Saving audio file to: {temp_audio_path}")
        audio_file.save(temp_audio_path)
        print(f"File saved successfully")

        summarized_audio = summarize_audio(temp_audio_path, "Audio_segments")      
        summarized_text = summarize_text(summarized_audio)
        if os.path.exists(temp_audio_path):
            print(f"Removing file: {temp_audio_path}")
            os.remove(temp_audio_path)
        else:
            print(f"File not found: {temp_audio_path}")

        return jsonify({"result": summarized_text}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
@app.route('/classification', methods=['POST'])
def classify_image():
    try:
        if 'image_file' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files['image_file']
        if image_file.filename == '':
            return jsonify({"error": "Empty image file provided"}), 400

        # Perform image classification using Imagga API
        response = requests.post(
            IMAGGA_API_URL,
            auth=(API_KEY, API_SECRET),
            files={'image': (image_file.filename, image_file.read())}
        )

        if response.status_code == 200:
            result = response.json()
            print(result)
            return jsonify({"result": result}), 200
        else:
            return jsonify({"error": "Image classification failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/caption_image', methods=["POST"])
def caption_image():
    try:
        if 'image_file' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image_file = request.files['image_file']
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
        # Replace the following line with your actual image captioning logic
        # For example, you might use your existing query function here
        result = query_image_captioning(temp_image_path)

        # Delete the temporary image file after processing
        os.remove(temp_image_path)

        return jsonify({"result": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True,threaded=True)

