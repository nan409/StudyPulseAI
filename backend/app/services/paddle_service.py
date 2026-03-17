from flask import current_app
from ...models.user import User
from ...models.subscription import Subscription # Wait, I named it subscriptions in SQL, check models
from ...extensions import db
import requests

class PaddleService:
    def __init__(self):
        self.api_key = current_app.config['PADDLE_API_KEY']
        self.environment = current_app.config['PADDLE_ENV']
        self.base_url = "https://sandbox-api.paddle.com" if self.environment == 'sandbox' else "https://api.paddle.com"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def create_checkout(self, user, plan: str, interval: str) -> str:
        """Generate Paddle checkout URL (Simplified for initial implementation)"""
        # In a real implementation, you'd use the Paddle Python SDK or direct API calls
        # Here we'll return a placeholder checkout URL for the sandbox
        return f"https://sandbox-checkout.paddle.com/checkout/custom?customer_id={user.paddle_customer_id or 'new'}"

    def handle_webhook(self, payload: dict):
        """Process Paddle webhooks"""
        event_type = payload.get('event_type')
        data = payload.get('data')
        
        if event_type == 'subscription.created':
            self._handle_subscription_created(data)
        elif event_type == 'subscription.cancelled':
            self._handle_subscription_cancelled(data)
            
    def _handle_subscription_created(self, data):
        """Update user tier when subscription is created"""
        customer_id = data.get('customer_id')
        user = User.query.filter_by(paddle_customer_id=customer_id).first()
        
        if user:
            user.subscription_tier = 'pro' # Default to pro, can be refined based on plan ID
            user.subscription_status = 'active'
            user.ai_credits_limit = 500 # Increase limits for pro
            db.session.commit()
            print(f"Subscription activated for user {user.email}")

    def _handle_subscription_cancelled(self, data):
        """Downngrade user tier when subscription is cancelled"""
        customer_id = data.get('customer_id')
        user = User.query.filter_by(paddle_customer_id=customer_id).first()
        
        if user:
            user.subscription_tier = 'free'
            user.subscription_status = 'cancelled'
            user.ai_credits_limit = 50
            db.session.commit()
            print(f"Subscription deactivated for user {user.email}")
