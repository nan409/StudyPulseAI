import openai
from flask import current_app
import os

class OpenAIService:
    def __init__(self):
        self.api_key = current_app.config['OPENAI_API_KEY']
        self.client = openai.OpenAI(api_key=self.api_key)

    def transcribe_audio(self, audio_file_path: str) -> str:
        """Transcribe audio using Whisper API"""
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file
                )
            return transcript.text
        except Exception as e:
            current_app.logger.error(f"Whisper transcription error: {e}")
            raise e

    def advanced_analysis(self, text: str) -> dict:
        """Use GPT-4o-mini for complex content structuring"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Extract key academic concepts, definitions, and potential flashcards from the text. Format as JSON."},
                    {"role": "user", "content": text}
                ],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
        except Exception as e:
            current_app.logger.error(f"OpenAI analysis error: {e}")
            raise e
