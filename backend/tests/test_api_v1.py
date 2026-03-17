import json

def test_health_check(test_client):
    """Test standard health check or basic route"""
    response = test_client.get('/api/auth/me')
    assert response.status_code == 401 # Should be unauthorized without token

def test_registration(test_client):
    """Test user registration"""
    response = test_client.post('/api/auth/register', json={
        'email': 'newuser@example.com',
        'password': 'StrongPassword123!',
        'full_name': 'New User'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['email'] == 'newuser@example.com'

def test_login(test_client):
    """Test user login"""
    # First register
    test_client.post('/api/auth/register', json={
        'email': 'login@example.com',
        'password': 'LoginPass123!',
        'full_name': 'Login User'
    })
    
    # Then login
    response = test_client.post('/api/auth/login', json={
        'email': 'login@example.com',
        'password': 'LoginPass123!'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data

def test_get_me(test_client, auth_header):
    """Test retrieving current user profile"""
    response = test_client.get('/api/auth/me', headers=auth_header)
    assert response.status_code == 200
    data = response.get_json()
    assert data['email'] == 'auth@example.com'

def test_ai_chat_unauthorized(test_client):
    """Test AI chat requires authentication"""
    response = test_client.post('/api/ai/chat', json={'message': 'Hello'})
    assert response.status_code == 401

def test_create_course(test_client, auth_header):
    """Test course creation"""
    response = test_client.post('/api/study/courses', json={
        'name': 'Test Science',
        'code': 'SCI101'
    }, headers=auth_header)
    assert response.status_code == 201
    data = response.get_json()
    assert data['name'] == 'Test Science'
