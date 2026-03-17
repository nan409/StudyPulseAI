import sys
import os

# Adjust path so the Vercel builder can load our backend logic from /backend
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

app = create_app()
