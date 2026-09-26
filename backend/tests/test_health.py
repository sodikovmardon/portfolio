"""
Health endpoint testlari — /api/health
"""

API = "/api/health"


class TestHealth:
    def test_health_returns_200(self, client):
        """Health endpoint 200 qaytarishi kerak."""
        response = client.get(API)
        assert response.status_code == 200

    def test_health_status_is_healthy(self, client):
        """Javob 'healthy' statusini qaytarishi kerak."""
        response = client.get(API)
        assert response.json()["status"] == "healthy"

    def test_health_is_get_only(self, client):
        """Health endpoint faqat GET ni qabul qiladi."""
        response = client.post(API)
        assert response.status_code == 405
