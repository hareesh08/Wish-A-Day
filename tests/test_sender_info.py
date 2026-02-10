"""Tests for sender information functionality."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models import Wish


def test_create_wish_with_sender_info(client: TestClient, test_db: Session):
    """Test creating a wish with sender information."""
    payload = {
        "message": "Happy Birthday!",
        "theme": "birthday",
        "sender_name": "John Doe",
        "sender_message": "With love from your friend",
        "max_views": 1
    }
    
    response = client.post("/api/wishes", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert "slug" in data
    assert "public_url" in data
    
    # Verify the wish was created with sender info
    wish = test_db.query(Wish).filter(Wish.slug == data["slug"]).first()
    assert wish is not None
    assert wish.sender_name == "John Doe"
    assert wish.sender_message == "With love from your friend"


def test_create_wish_without_sender_info(client: TestClient, test_db: Session):
    """Test creating a wish without sender information."""
    payload = {
        "message": "Happy Birthday!",
        "theme": "birthday",
        "max_views": 1
    }
    
    response = client.post("/api/wishes", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    wish = test_db.query(Wish).filter(Wish.slug == data["slug"]).first()
    assert wish is not None
    assert wish.sender_name is None
    assert wish.sender_message is None


def test_view_wish_with_sender_info(client: TestClient, test_db: Session):
    """Test viewing a wish that includes sender information."""
    # Create a wish with sender info
    payload = {
        "message": "Happy Birthday!",
        "theme": "birthday",
        "sender_name": "Jane Smith",
        "sender_message": "Hope you have a wonderful day!",
        "max_views": 2
    }
    
    create_response = client.post("/api/wishes", json=payload)
    assert create_response.status_code == 201
    slug = create_response.json()["slug"]
    
    # View the wish
    view_response = client.get(f"/api/wishes/{slug}")
    assert view_response.status_code == 200
    
    data = view_response.json()
    assert data["message"] == "Happy Birthday!"
    assert data["sender_name"] == "Jane Smith"
    assert data["sender_message"] == "Hope you have a wonderful day!"
    assert data["remaining_views"] == 1


def test_view_wish_without_sender_info(client: TestClient, test_db: Session):
    """Test viewing a wish without sender information."""
    # Create a wish without sender info
    payload = {
        "message": "Happy Birthday!",
        "theme": "birthday",
        "max_views": 1
    }
    
    create_response = client.post("/api/wishes", json=payload)
    assert create_response.status_code == 201
    slug = create_response.json()["slug"]
    
    # View the wish
    view_response = client.get(f"/api/wishes/{slug}")
    assert view_response.status_code == 200
    
    data = view_response.json()
    assert data["message"] == "Happy Birthday!"
    assert data["sender_name"] is None
    assert data["sender_message"] is None


def test_sender_info_validation(client: TestClient):
    """Test validation of sender information fields."""
    # Test sender_name too long
    payload = {
        "message": "Happy Birthday!",
        "sender_name": "x" * 101,  # Exceeds 100 char limit
        "max_views": 1
    }
    
    response = client.post("/api/wishes", json=payload)
    assert response.status_code == 422
    
    # Test sender_message too long
    payload = {
        "message": "Happy Birthday!",
        "sender_message": "x" * 201,  # Exceeds 200 char limit
        "max_views": 1
    }
    
    response = client.post("/api/wishes", json=payload)
    assert response.status_code == 422