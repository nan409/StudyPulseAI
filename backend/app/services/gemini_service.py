import google.generativeai as genai
import json
from flask import current_app

class GeminiService:
    def __init__(self):
        genai.configure(api_key=current_app.config['GEMINI_API_KEY'])
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def chat_response(self, message: str, context: dict, history: list):
        """Standard chat response"""
        system_prompt = self._build_system_prompt(context)
        formatted_history = self._format_history(history)
            
        chat = self.model.start_chat(history=formatted_history)
        response = chat.send_message(f"{system_prompt}\n\nStudent: {message}")
        return response.text

    def stream_chat_response(self, message: str, context: dict, history: list):
        """Streaming chat response via generator"""
        system_prompt = self._build_system_prompt(context)
        formatted_history = self._format_history(history)
            
        chat = self.model.start_chat(history=formatted_history)
        response = chat.send_message(f"{system_prompt}\n\nStudent: {message}", stream=True)
        
        for chunk in response:
            if chunk.text:
                yield chunk.text

    def _format_history(self, history: list) -> list:
        formatted = []
        for h in history:
            formatted.append({
                "role": "user" if h['role'] == 'user' else "model",
                "parts": [h['content']]
            })
        return formatted
    
    def generate_flashcards(self, topic: str, count: int, difficulty: str) -> list:
        """Structured flashcard generation"""
        prompt = f"""
        Create {count} flashcards about: {topic}
        Difficulty: {difficulty}
        Format: JSON array with fields: front, back, example, difficulty, tags
        
        Rules:
        - Front: Clear question/prompt (max 100 chars)
        - Back: Concise answer (max 200 chars)
        - Example: Real-world application
        - Tags: 2-3 relevant keywords
        """
        
        response = self.model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                response_mime_type="application/json"
            )
        )
        
        return json.loads(response.text)
    
    def _build_system_prompt(self, context: dict) -> str:
        return f"""
        You are StudyPulse AI, an expert academic tutor. 
        Current course: {context.get('course_name', 'General')}
        Topic: {context.get('current_topic', 'Various')}
        Student level: {context.get('difficulty_level', 'intermediate')}
        
        Guidelines:
        - Be encouraging but rigorous
        - Use examples from {context.get('current_topic')}
        - Suggest specific study tasks when relevant
        - Keep responses concise (2-3 paragraphs max)
        """

gemini_service = None # Will be initialized in the Blueprint or App context
