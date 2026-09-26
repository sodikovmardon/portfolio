"""
Ilova darajasidagi testlar: xavfsizlik header'lari, 404 sahifasi,
SEO fayllari va konfiguratsiya.
"""

import xml.etree.ElementTree as ET
from pathlib import Path

import pytest

from app.core.config import get_settings

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"
API = "/api/health"


class TestSecurityHeaders:
    """QISM 5: asosiy xavfsizlik header'lari barcha javoblarda bo'lishi kerak."""

    def test_nosniff_header(self, client):
        response = client.get(API)
        assert response.headers["X-Content-Type-Options"] == "nosniff"

    def test_xframe_options_deny(self, client):
        response = client.get(API)
        assert response.headers["X-Frame-Options"] == "DENY"

    def test_referrer_policy(self, client):
        response = client.get(API)
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"

    @pytest.mark.parametrize(
        "path", ["/", "/api/health", "/css/style.css", "/js/script.js", "/nonexistent-page"]
    )
    def test_headers_present_on_all_responses(self, client, path):
        """Header'lar API'da ham, statik fayllarda ham, 404'da ham bo'lishi kerak."""
        response = client.get(path)
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert "Referrer-Policy" in response.headers


class TestNotFound:
    """QISM 4: 404 sahifasi API va brauzer uchun to'g'ri ishlashi kerak."""

    def test_unknown_path_returns_404(self, client):
        response = client.get("/bu-sahifa-mavjud-emas-12345")
        assert response.status_code == 404

    def test_unknown_page_serves_html_404(self, client):
        """Brauzer so'rovi uchun chiroyli 404.html qaytarilishi kerak."""
        response = client.get("/bu-sahifa-mavjud-emas-12345")
        assert response.headers["content-type"].startswith("text/html")
        assert "404" in response.text

    def test_unknown_api_path_returns_json_404(self, client):
        """API so'rovi uchun HTML emas JSON qaytarilishi kerak."""
        response = client.get("/api/bu-endpoint-mavjud-emas")
        assert response.status_code == 404
        assert response.headers["content-type"].startswith("application/json")
        assert "detail" in response.json()

    def test_real_page_still_works(self, client):
        """404 qo'shish asosiy sahifani buzmasligi kerak."""
        response = client.get("/")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]


class TestErrorDisclosure:
    """QISM 4: ichki xatolar foydalanuvchiga ko'rsatilmasligi kerak."""

    def test_no_stack_trace_on_error(self, client):
        response = client.get("/api/contact?limit=notanumber")
        body = response.text.lower()
        # Ichki tafsilot belgilari bo'lmasligi kerak
        for leak in ("traceback", "sqlalchemy", "sqlite3", "select ", "from contact"):
            assert leak not in body


class TestSeoFiles:
    """QISM 3: sitemap.xml va robots.txt to'g'ri formatda bo'lishi kerak."""

    def test_sitemap_exists(self):
        assert (FRONTEND_DIR / "sitemap.xml").is_file()

    def test_sitemap_is_valid_xml(self):
        ET.parse(FRONTEND_DIR / "sitemap.xml")  # xato bo'lsa shu qator ko'rsatadi

    def test_sitemap_has_urls(self):
        root = ET.parse(FRONTEND_DIR / "sitemap.xml").getroot()
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        assert len(root.findall("s:url", ns)) > 0

    def test_sitemap_urls_are_absolute(self):
        root = ET.parse(FRONTEND_DIR / "sitemap.xml").getroot()
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for url in root.findall("s:url", ns):
            loc = url.find("s:loc", ns).text
            assert loc.startswith("http"), f"Manzil absolyut bo'lishi kerak: {loc}"

    def test_sitemap_contains_no_placeholder(self):
        content = (FRONTEND_DIR / "sitemap.xml").read_text(encoding="utf-8")
        assert "YOUR_DOMAIN" not in content

    def test_robots_exists(self):
        assert (FRONTEND_DIR / "robots.txt").is_file()

    def test_robots_allows_indexing(self):
        content = (FRONTEND_DIR / "robots.txt").read_text(encoding="utf-8")
        assert "User-agent: *" in content
        assert "Allow: /" in content

    def test_robots_points_to_sitemap(self):
        content = (FRONTEND_DIR / "robots.txt").read_text(encoding="utf-8")
        assert "Sitemap:" in content
        assert "sitemap.xml" in content

    def test_robots_blocks_api(self):
        content = (FRONTEND_DIR / "robots.txt").read_text(encoding="utf-8")
        assert "Disallow: /api/" in content


@pytest.fixture(scope="module")
def html():
    """index.html matni (metadata tekshiruvlari uchun)."""
    return (FRONTEND_DIR / "index.html").read_text(encoding="utf-8")


class TestMetaTags:
    """QISM 3: index.html meta teglari to'liq va to'g'ri bo'lishi kerak."""

    @pytest.mark.parametrize(
        "needle",
        [
            "<title>",
            'name="description"',
            'name="robots"',
            'rel="canonical"',
            'property="og:title"',
            'property="og:description"',
            'property="og:image"',
            'property="og:url"',
            'property="og:locale"',
            'name="twitter:card"',
            'name="twitter:title"',
            'name="twitter:image"',
            "application/ld+json",
        ],
    )
    def test_meta_present(self, html, needle):
        assert needle in html

    def test_no_placeholder_domain(self, html):
        assert "YOUR_DOMAIN" not in html

    def test_canonical_and_og_url_match(self, html):
        """Canonical va og:url bir xil bo'lishi kerak (SEO signal mosligi)."""
        canonical = html.split('rel="canonical" href="')[1].split('"')[0]
        og_url = html.split('property="og:url" content="')[1].split('"')[0]
        assert canonical == og_url

    def test_description_length_reasonable(self, html):
        """Meta description 50-160 belgi oralig'ida bo'lishi kerak (SEO)."""
        desc = html.split('name="description" content="')[1].split('"')[0]
        assert 50 <= len(desc) <= 160, f"Uzunligi {len(desc)} belgi"

    def test_title_length_reasonable(self, html):
        title = html.split("<title>")[1].split("</title>")[0]
        assert 10 <= len(title) <= 70, f"Uzunligi {len(title)} belgi"

    def test_json_ld_is_valid(self, html):
        import json

        raw = html.split('application/ld+json">')[1].split("</script>")[0]
        data = json.loads(raw)
        assert data["@type"] == "Person"
        assert data["name"] == "Mardon Sodiqov"


class TestConfig:
    """Sozlamalar: SITE_URL yagona manba bo'lishi kerak."""

    def test_site_url_present(self):
        assert get_settings().site_url

    def test_site_url_has_no_trailing_slash(self):
        assert not get_settings().site_url.endswith("/")

    def test_allowed_origins_parsing(self):
        origins = get_settings().allowed_origins_list
        assert all(isinstance(o, str) and o for o in origins)
