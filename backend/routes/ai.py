from flask import Blueprint, request, jsonify, Response
import os
import json
from google import genai
from models import db, Course
from routes.study import token_required

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/chat', methods=['POST'])
@token_required
def ai_chat(current_user):
    if not current_user.is_pro:
        return jsonify({'error': 'AI Study Coach is a Pro feature.'}), 403
        
    data = request.get_json()
    messages = data.get('messages', [])
    
    if not messages:
        return jsonify({'error': 'Messages are required'}), 400
        
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'Gemini API key not configured'}), 500
        
    try:
        client = genai.Client(api_key=api_key)
        
        system_instruction = f"You are PulseFlow's AI Study Coach. You are helping {current_user.display_name or 'a student'}. Be concise, supportive, and focus only on studying, productivity, or academic subjects. Your tone is 2026 Glassmorphism SaaS: sleek, precise, and highly motivating."
        
        # Format history for Gemini
        gemini_messages = []
        for msg in messages:
            role = 'user' if msg.get('role') == 'user' else 'model'
            gemini_messages.append({"role": role, "parts": [{"text": msg.get('content', '')}]})
            
        last_message = gemini_messages.pop() # The actual prompt from the user
            
        config = {
            "system_instruction": system_instruction,
            "temperature": 0.7
        }
        
        chat = client.chats.create(model="gemini-2.5-flash", config=config, history=gemini_messages)
        response = chat.send_message(last_message["parts"][0]["text"])
        
        return jsonify({'reply': response.text}), 200
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/recommend', methods=['GET'])
@token_required
def recommend_subjects(current_user):
    if not current_user.is_pro:
        return jsonify({'error': 'Pro feature.'}), 403
        
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'error': 'Gemini API key not configured'}), 500
        
    courses = Course.query.filter_by(user_id=current_user.id).all()
    course_names = [c.course_name for c in courses]
    
    if not course_names:
        return jsonify({'recommendations': ["Time Management", "Study Routines", "Goal Setting"]}), 200
        
    prompt = f"The student is taking these courses: {', '.join(course_names)}. Recommend 3 specific sub-topics or study areas they should focus on next. Return a simple comma-separated list. No explanations."
    
    try:
        client = genai.Client(api_key=api_key)
        config = {
            "system_instruction": "You provide quick study topic recommendations. Output exactly a comma separated string.",
            "temperature": 0.2
        }
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=config,
        )
        
        reply = response.text
        recs = [r.strip() for r in reply.split(',')]
        return jsonify({'recommendations': recs}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
