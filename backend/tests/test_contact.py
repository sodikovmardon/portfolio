"""
Kontakt formasi testlari — /api/contact

Qamrov:
  POST: muvaffaqiyatli yaratish, noto'g'ri email, bo'sh maydon,
        juda qisqa ism, juda uzun xabar, rate limiting
  GET:  ro'yxatni qaytarish, limit parametri, bo'sh ro'yxat holati
"""

API = "/api/contact"


class TestContactCreate:
    """POST /api/contact — xabar yaratish."""

    def test_create_returns_201(self, client, valid_payload):
        """To'g'ri ma'lumot bilan 201 Created qaytarilishi kerak."""
        response = client.post(API, json=valid_payload)
        assert response.status_code == 201

    def test_create_success_flag_true(self, client, valid_payload):
        """Javobda success=True bo'lishi kerak."""
        response = client.post(API, json=valid_payload)
        assert response.json()["success"] is True

    def test_create_echoes_submitted_data(self, client, valid_payload):
        """Yuborilgan ma'lumot qaytarilgan javobda saqlanishi kerak."""
        response = client.post(API, json=valid_payload)
        data = response.json()["data"]
        assert data["name"] == valid_payload["name"]
        assert data["email"] == valid_payload["email"]
        assert data["message"] == valid_payload["message"]

    def test_create_assigns_id_and_timestamp(self, client, valid_payload):
        """Yangi yozuv id va created_at olishi kerak."""
        response = client.post(API, json=valid_payload)
        data = response.json()["data"]
        assert isinstance(data["id"], int) and data["id"] > 0
        assert data["created_at"]

    def test_message_is_persisted(self, client, valid_payload):
        """Xabar haqiqatan bazaga saqlanishi kerak (ro'yxatda ko'rinadi)."""
        client.post(API, json=valid_payload)
        listed = client.get(API).json()
        assert any(item["email"] == valid_payload["email"] for item in listed)


class TestContactValidation:
    """Noto'g'ri ma'lumotlar bilan validatsiya xatolari (422)."""

    def test_invalid_email_rejected(self, client, valid_payload):
        """Noto'g'ri email formati rad etilishi kerak."""
        valid_payload["email"] = "bu-email-emas"
        response = client.post(API, json=valid_payload)
        assert response.status_code == 422
        assert "email" in response.text.lower()

    def test_email_missing_at_sign_rejected(self, client, valid_payload):
        """@ belgisiz email rad etilishi kerak."""
        valid_payload["email"] = "azizexample.com"
        response = client.post(API, json=valid_payload)
        assert response.status_code == 422

    def test_empty_fields_rejected(self, client):
        """Bo'sh name/email/message rad etilishi kerak."""
        response = client.post(API, json={"name": "", "email": "", "message": ""})
        assert response.status_code == 422

    def test_missing_body_rejected(self, client):
        """Butunlay bo'sh tanani rad etish kerak."""
        response = client.post(API, json={})
        assert response.status_code == 422

    def test_name_too_short_rejected(self, client, valid_payload):
        """1 belgili ism minimum chegaradan past."""
        valid_payload["name"] = "A"
        response = client.post(API, json=valid_payload)
        assert response.status_code == 422

    def test_message_too_short_rejected(self, client, valid_payload):
        """4 belgili xabar minimum chegaradan past."""
        valid_payload["message"] = "salo"  # 4 belgi, min_length=5 dan past
        response = client.post(API, json=valid_payload)
        assert response.status_code == 422

    def test_message_too_long_rejected(self, client, valid_payload):
        """3000 belgidan uzun xabar rad etilishi kerak."""
        valid_payload["message"] = "a" * 3001
        response = client.post(API, json=valid_payload)
        assert response.status_code == 422

    def test_invalid_payload_not_saved(self, client):
        """Rad etilgan xabar bazaga yozilmasligi kerak."""
        client.post(API, json={"name": "A", "email": "x", "message": "y"})
        assert client.get(API).json() == []


class TestContactRateLimit:
    """Rate limiting — 1 daqiqada 3 tadan ortiq xabar rad etiladi."""

    def test_fourth_request_gets_429(self, client, valid_payload):
        """4-xabar 429 Too Many Requests olishi kerak."""
        for _ in range(3):
            assert client.post(API, json=valid_payload).status_code == 201
        response = client.post(API, json=valid_payload)
        assert response.status_code == 429


class TestContactList:
    """GET /api/contact — xabarlar ro'yxati."""

    def test_list_returns_array(self, client):
        """Ro'yxat JSON massiv qaytarishi kerak."""
        response = client.get(API)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_empty_by_default(self, client):
        """Yangi bazada ro'yxat bo'sh bo'lishi kerak."""
        assert client.get(API).json() == []

    def test_list_contains_created_message(self, client, valid_payload):
        """Yaratilgan xabar ro'yxatda ko'rinishi kerak."""
        client.post(API, json=valid_payload)
        listed = client.get(API).json()
        assert len(listed) == 1
        assert listed[0]["name"] == valid_payload["name"]

    def test_list_respects_limit(self, client):
        """limit parametri ro'yxat uzunligini cheklashi kerak."""
        for i in range(4):
            client.post(
                API,
                json={
                    "name": f"Test User {i}",
                    "email": f"user{i}@example.com",
                    "message": f"Bu {i}-xabar.",
                },
            )
        assert len(client.get(API, params={"limit": 2}).json()) == 2

    def test_list_returns_newest_first(self, client):
        """Ro'yxat eng yangi xabardan boshlanishi kerak."""
        for i in range(2):
            client.post(
                API,
                json={
                    "name": f"User {i}",
                    "email": f"u{i}@example.com",
                    "message": f"Xabar {i}.",
                },
            )
        listed = client.get(API).json()
        assert listed[0]["name"] == "User 1"

    def test_list_exposes_no_internal_fields(self, client, valid_payload):
        """Ro'yxatda ichki DB maydonlari ko'rinmasligi kerak."""
        client.post(API, json=valid_payload)
        item = client.get(API).json()[0]
        assert set(item.keys()) == {"id", "name", "email", "message", "created_at"}
