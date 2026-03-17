from flask import request, jsonify, g, Response
from . import ai_bp
from ...services.gemini_service import GeminiService
from ...extensions import db
from ...models.ai_usage import AIUsageLog
from ...models.flashcard import FlashcardDeck, Flashcard
import uuid
from flask_jwt_extended import jwt_required, get_jwt_identity

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    data = request.get_json()
    message = data.get('message')
    context = data.get('context', {})
    history = data.get('history', [])
    stream = data.get('stream', False)
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
        
    gemini = GeminiService()
    user_id = get_jwt_identity()

    if stream:
        def generate():
            full_response = ""
            for chunk in gemini.stream_chat_response(message, context, history):
                full_response += chunk
                yield f"data: {chunk}\n\n"
            
            # Log usage after stream completes
            log = AIUsageLog(
                user_id=user_id,
                model='gemini-2.5-flash',
                feature='chat_stream',
                prompt_preview=message[:100]
            )
            db.session.add(log)
            db.session.commit()
            yield "event: end\ndata: [DONE]\n\n"

        return Response(generate(), mimetype='text/event-stream')
    
    # Non-streaming fallback
    response_text = gemini.chat_response(message, context, history)
    
    log = AIUsageLog(
        user_id=user_id,
        model='gemini-2.5-flash',
        feature='chat',
        prompt_preview=message[:100]
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'content': response_text,
        'message_id': str(uuid.uuid4())
    })

@ai_bp.route('/flashcards/generate', methods=['POST'])
@jwt_required()
def generate_flashcards():
    data = request.get_json()
    content = data.get('content')
    topic = data.get('topic')
    count = data.get('count', 10)
    difficulty = data.get('difficulty', 'medium')
    deck_title = data.get('deck_title', topic or 'AI Generated Deck')
    
    if not content and not topic:
        return jsonify({'error': 'Content or topic is required'}), 400
        
    gemini = GeminiService()
    cards_data = gemini.generate_flashcards(topic or content, count, difficulty)
    
    user_id = get_jwt_identity()
    
    # Create deck
    deck = FlashcardDeck(
        user_id=user_id,
        title=deck_title,
        source_type='ai_topic' if topic else 'ai_notes',
        card_count=len(cards_data)
    )
    db.session.add(deck)
    db.session.flush() # Get deck ID
    
    # Create cards
    for card_data in cards_data:
        card = Flashcard(
            deck_id=deck.id,
            front=card_data['front'],
            back=card_data['back'],
            example=card_data.get('example'),
            tags=card_data.get('tags', []),
            difficulty=card_data.get('difficulty', difficulty)
        )
        db.session.add(card)
        
    db.session.commit()
    
    return jsonify({
        'deck_id': str(deck.id),
        'cards_count': len(cards_data)
    })
