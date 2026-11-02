import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "EU Green Taxonomy" in data["standard"]


@pytest.mark.asyncio
async def test_login_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test seeded manager login
        login_payload = {
            "email": "manager@mueller-tech.de",
            "password": "Password123!"
        }
        response = await ac.post(f"{settings.API_V1_STR}/auth/login", json=login_payload)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "COMPANY_MANAGER"
        assert data["company_name"] == "Müller Präzisionstechnik GmbH"


@pytest.mark.asyncio
async def test_invalid_login():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_payload = {
            "email": "manager@mueller-tech.de",
            "password": "WrongPassword!"
        }
        response = await ac.post(f"{settings.API_V1_STR}/auth/login", json=login_payload)
        assert response.status_code == 401
