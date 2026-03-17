from flask import request, jsonify
from . import webhook_bp
from ...services.paddle_service import PaddleService

@webhook_bp.route('/paddle', methods=['POST'])
def paddle_webhook():
    payload = request.get_json()
    # In a real app, verify signature first
    
    paddle = PaddleService()
    paddle.handle_webhook(payload)
    
    return jsonify({'status': 'ok'}), 200
