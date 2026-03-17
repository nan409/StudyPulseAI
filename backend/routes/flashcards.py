from flask import Blueprint, request, jsonify
from openai import OpenAI
import os
import json
from models import db, FlashcardDeck, Flashcard
from routes.study import token_required

flashcards_bp = Blueprint('flashcards', __name__)

@flashcards_bp.route('/generate', methods=['POST'])
@token_required
def generate_flashcards(current_user):
    data = request.get_json()
    topic = data.get('topic')
    notes = data.get('notes', '')
    
    if not topic:
        return jsonify({'error': 'Topic is required'}), 400
        
    if not current_user.is_pro and len(current_user.decks) >= 5:
        return jsonify({'error': 'Free users are limited to 5 decks. Please upgrade to Pro.'}), 403
        
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return jsonify({'error': 'OpenAI API key not configured on server'}), 500

    prompt = f"Create 5 flashcards about the topic '{topic}'. Additional notes: '{notes}'. Return ONLY a JSON array of objects with 'front' and 'back' string properties. No markdown."
    
    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant that generates concise flashcards."},
                {"role": "user", "content": prompt}
            ]
        )
        content = response.choices[0].message.content
        cards = json.loads(content)
        
        # Save to DB
        deck = FlashcardDeck(user_id=current_user.id, title=topic)
        db.session.add(deck)
        db.session.flush() # Get deck ID
        
        for card_data in cards:
            card = Flashcard(deck_id=deck.id, front=card_data['front'], back=card_data['back'])
            db.session.add(card)
            
        db.session.commit()
        return jsonify({'message': 'Flashcards generated', 'deck_id': deck.id, 'cards': cards}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcards_bp.route('/transcribe', methods=['POST'])
@token_required
def transcribe_audio(current_user):
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    audio_file = request.files['audio']
    topic = request.form.get('topic', 'Voice Notes')
    
    if not current_user.is_pro and len(current_user.decks) >= 5:
        return jsonify({'error': 'Free users are limited to 5 decks. Please upgrade to Pro.'}), 403
    
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return jsonify({'error': 'OpenAI API key not configured'}), 500
        
    try:
        client = OpenAI(api_key=api_key)
        
        # Save temp file for whisper
        temp_path = f"/tmp/{audio_file.filename}"
        audio_file.save(temp_path)
        
        # Transcribe with Whisper
        with open(temp_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=file
            )
            
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        notes = transcription.text
        
        # Now use the same prompt as standard generation
        prompt = f"Create 5 flashcards about the topic '{topic}'. Additional voice notes: '{notes}'. Return ONLY a JSON array of objects with 'front' and 'back' string properties. No markdown."
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant that generates concise flashcards."},
                {"role": "user", "content": prompt}
            ]
        )
        content = response.choices[0].message.content
        cards = json.loads(content)
        
        # Save to DB
        deck = FlashcardDeck(user_id=current_user.id, title=f"{topic} (Voice)")
        db.session.add(deck)
        db.session.flush()
        
        for card_data in cards:
            card = Flashcard(deck_id=deck.id, front=card_data['front'], back=card_data['back'])
            db.session.add(card)
            
        db.session.commit()
        return jsonify({'message': 'Voice flashcards generated', 'deck_id': deck.id, 'cards': cards}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcards_bp.route('/decks', methods=['GET'])
@token_required
def get_decks(current_user):
    decks = FlashcardDeck.query.filter_by(user_id=current_user.id).all()
    deck_list = [{'id': d.id, 'title': d.title, 'created_at': d.created_at.isoformat()} for d in decks]
    return jsonify({'decks': deck_list}), 200

@flashcards_bp.route('/decks/<int:deck_id>', methods=['GET'])
@token_required
def get_deck_cards(current_user, deck_id):
    deck = FlashcardDeck.query.filter_by(id=deck_id, user_id=current_user.id).first()
    if not deck:
        return jsonify({'error': 'Deck not found'}), 404
        
    cards = [{'id': c.id, 'front': c.front, 'back': c.back} for c in deck.cards]
    return jsonify({'deck': {'id': deck.id, 'title': deck.title}, 'cards': cards}), 200
