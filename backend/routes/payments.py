import hmac
import hashlib
import os
import requests
from flask import Blueprint, request, jsonify
from models import db, User, Subscription
from routes.study import token_required

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/checkout', methods=['GET'])
@token_required
def get_checkout_url(current_user):
    # In a real SaaS, you'd call the Lemon Squeezy API to generate a unique checkout URL
    # so that you can reliably pass `custom_data` (like `user_id`) to the webhook.
    # For a simplified setup, if you have a static store/variant URL, you can append it:
    # return jsonify({'url': f'https://your-store.lemonsqueezy.com/checkout/buy/variant-id?checkout[custom][user_id]={current_user.id}'})
    
    # Example using API (requires LEMON_SQUEEZY_API_KEY):
    api_key = os.environ.get('LEMON_SQUEEZY_API_KEY')
    store_id = os.environ.get('LEMON_SQUEEZY_STORE_ID')
    variant_id = os.environ.get('LEMON_SQUEEZY_VARIANT_ID')
    
    if not all([api_key, store_id, variant_id]):
        # Fallback to a hardcoded URL if env vars aren't set yet (for UI demo purposes)
        return jsonify({
            'url': f'https://studypulse.lemonsqueezy.com/checkout/buy/{variant_id or "default"}?checkout[custom][user_id]={current_user.id}'
        }), 200

    headers = {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': f'Bearer {api_key}'
    }
    
    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": {
                    "custom": {
                        "user_id": str(current_user.id)
                    }
                }
            },
            "relationships": {
                "store": {
                    "data": {
                        "type": "stores",
                        "id": str(store_id)
                    }
                },
                "variant": {
                    "data": {
                        "type": "variants",
                        "id": str(variant_id)
                    }
                }
            }
        }
    }
    
    try:
        response = requests.post('https://api.lemonsqueezy.com/v1/checkouts', headers=headers, json=payload)
        response.raise_for_status()
        checkout_url = response.json()['data']['attributes']['url']
        return jsonify({'url': checkout_url}), 200
    except Exception as e:
        print(f"Lemon Squeezy API error: {e}")
        return jsonify({'error': 'Failed to generate checkout URL'}), 500

@payments_bp.route('/webhook', methods=['POST'])
def ls_webhook():
    secret = os.environ.get('LEMON_SQUEEZY_WEBHOOK_SECRET', '')
    signature = request.headers.get('X-Signature', '')
    payload = request.get_data()
    
    if secret:
        expected_signature = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return jsonify({'error': 'Invalid signature'}), 401
            
    data = request.get_json()
    event_name = data.get('meta', {}).get('event_name')
    obj = data.get('data', {}).get('attributes', {})
    custom_data = data.get('meta', {}).get('custom_data', {})
    
    user_id = custom_data.get('user_id')
    if not user_id:
        return jsonify({'message': 'No user_id in custom_data, ignoring'}), 200

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Subscription Lifecycle Events
    if event_name in ['subscription_created', 'subscription_updated', 'subscription_resumed']:
        status = obj.get('status')
        if status in ['active', 'on_trial']:
            user.is_pro = True
            sub = Subscription.query.filter_by(user_id=user.id).first()
            if not sub:
                sub = Subscription(user_id=user.id, plan='pro')
                db.session.add(sub)
            sub.status = 'active'
            
    elif event_name in ['subscription_cancelled', 'subscription_expired', 'subscription_unpaid']:
        user.is_pro = False
        sub = Subscription.query.filter_by(user_id=user.id).first()
        if sub:
            sub.status = obj.get('status', 'expired')
            
    db.session.commit()
    return jsonify({'message': 'Webhook processed successfully'}), 200
