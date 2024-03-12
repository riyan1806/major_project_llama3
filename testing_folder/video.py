from transformers import pipeline
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
from nltk.tokenize import sent_tokenize
import nltk
import os
import torchaudio
import moviepy.editor as mp

# Initialize the speech-to-text model
processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")

# Initialize the video analysis pipeline
video_analysis = pipeline("video-classification")

# Function to detect objects in a video
def detect_objects(video_path):
    # Analyze video
    objects = video_analysis(video_path)
    return [obj["label"] for obj in objects]

# Function to combine audio and video information
def combine_audio_video_info(audio_text, video_objects):
    combined_info = f"Audio: {audio_text}\nVideo Objects: {', '.join(video_objects)}"
    return combined_info

# Function to generate summary
def generate_summary(combined_info):
    summarizer = pipeline("summarization")
    summary = summarizer(combined_info, max_length=100, min_length=30, do_sample=False)[0]["summary_text"]
    return summary

# Function to save summary to a file
def save_summary(summary, output_path):
    with open(output_path, "w") as file:
        file.write(summary)

# Example usage
video_path = "You can make INVISIBLE folders.mp4"
output_path = "output_summary.txt"

video_audio = mp.VideoFileClip(video_path).audio
audio_path = "temp_audio.wav"
video_audio.write_audiofile(audio_path, codec='pcm_s16le')

# Transcribe audio
audio_input, _ = torchaudio.load(audio_path)
transcription = processor.batch_decode(model.stt(audio_input), skip_special_tokens=True)
audio_text = " ".join(transcription)

# Detect objects in video
video_objects = detect_objects(video_path)

# Combine audio and video information
combined_info = combine_audio_video_info(audio_text, video_objects)

# Generate summary
summary = generate_summary(combined_info)

# Save summary to a file
save_summary(summary, output_path)

# Remove temporary audio file
os.remove(audio_path)
