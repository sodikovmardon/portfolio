// ===== Config =====
// Backend manzili. Lokal ishga tushirishda FastAPI odatda 8000-portda ishlaydi.
const API_BASE = window.API_BASE_URL || "http://localhost:8000";

// ===== Nav: scroll shrink + mobile menu =====
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const navMobile = document.getElementById("navMobile");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 20);
}, { passive: true });

burger?.addEventListener("click", () => {
  navMobile.classList.toggle("open");
});
navMobile?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => navMobile.classList.remove("open"));
});

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll("[data-reveal]");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== Animated skill bars =====
const skillRows = document.querySelectorAll(".skill-row");
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const row = entry.target;
      const level = row.dataset.level || 0;
      row.style.setProperty("--w", level + "%");
      row.classList.add("filled");
      skillObserver.unobserve(row);
    }
  });
}, { threshold: 0.4 });
skillRows.forEach(row => skillObserver.observe(row));

// ===== Contact form -> backend API =====
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const submitLabel = document.getElementById("submitLabel");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
  };

  if (!payload.name || !payload.email || !payload.message) {
    statusEl.textContent = "Iltimos, barcha maydonlarni to'ldiring.";
    statusEl.className = "form-status err";
    return;
  }

  submitBtn.disabled = true;
  submitLabel.textContent = "Yuborilmoqda...";

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Server xatoligi");
    }

    statusEl.textContent = "Xabaringiz yuborildi! Tez orada javob beraman.";
    statusEl.className = "form-status ok";
    form.reset();
  } catch (err) {
    statusEl.textContent = "Xabar yuborilmadi. Backend ishlab turganini tekshiring yoki to'g'ridan-to'g'ri Telegram/Email orqali yozing.";
    statusEl.className = "form-status err";
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = "Xabar yuborish";
  }
});
