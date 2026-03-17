from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import billing_bp
from ...services.paddle_service import PaddleService
from ...models.user import User

@billing_bp.route('/plans', methods=['GET'])
def get_plans():
    return jsonify([
        {'id': 'free', 'name': 'Free', 'price': 0},
        {'id': 'pro', 'name': 'Pro', 'price': 4.99},
        {'id': 'institution', 'name': 'Institution', 'price': 19.99}
    ])

@billing_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    paddle = PaddleService()
    checkout_url = paddle.create_checkout(user, data['plan'], data.get('interval', 'month'))
    
    return jsonify({'checkout_url': checkout_url})
