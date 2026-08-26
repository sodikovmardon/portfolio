// ===== Preloader =====
(function() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;
  document.body.style.overflow = "hidden";

  function dismiss() {
    preloader.classList.add("hide");
    document.body.style.overflow = "";
    setTimeout(() => preloader.remove(), 600);
  }

  if (document.readyState === "complete") {
    setTimeout(dismiss, 500);
  } else {
    window.addEventListener("load", () => setTimeout(dismiss, 500));
  }
})();

// ===== Config =====
const API_BASE = "";

// ===== Blob parallax (liquid glass depth effect) =====
(function() {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!mq.matches || rmq.matches) return;

  const blobs = [
    { el: document.querySelector(".blob-a"), x: 0, y: 0, tx: 0, ty: 0, kx:  0.04, ky:  0.03, max: 22 },
    { el: document.querySelector(".blob-b"), x: 0, y: 0, tx: 0, ty: 0, kx: -0.06, ky:  0.05, max: 18 },
    { el: document.querySelector(".blob-c"), x: 0, y: 0, tx: 0, ty: 0, kx:  0.05, ky: -0.04, max: 25 },
  ].filter(b => b.el);

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function tick() {
    const cx = mx / window.innerWidth - 0.5;
    const cy = my / window.innerHeight - 0.5;
    for (const b of blobs) {
      b.tx = cx * b.max;
      b.ty = cy * b.max;
      b.x += (b.tx - b.x) * b.kx;
      b.y += (b.ty - b.y) * b.ky;
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// ===== Scroll-spy: active nav link =====
(function() {
  const sections = document.querySelectorAll(".section[id]");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(s => observer.observe(s));
})();

// ===== i18n: Language switching =====
let currentLang = localStorage.getItem("lang") || (function() {
  const bl = (navigator.language || "").toLowerCase();
  if (bl.startsWith("ru")) return "ru";
  if (bl.startsWith("en")) return "en";
  return "uz";
})();

function t(key) {
  return (window.__I18N && window.__I18N[currentLang] && window.__I18N[currentLang][key])
    || (window.__I18N && window.__I18N.uz && window.__I18N.uz[key])
    || key;
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });

  document.querySelectorAll(".lang-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  document.getElementById("langBtn").textContent = lang.toUpperCase();
}

// Language switcher dropdown
const langBtn = document.getElementById("langBtn");
const langDropdown = document.getElementById("langDropdown");

langBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  langDropdown.classList.toggle("open");
});

document.querySelectorAll(".lang-option").forEach(btn => {
  btn.addEventListener("click", () => {
    applyLang(btn.dataset.lang);
    langDropdown.classList.remove("open");
  });
});

document.addEventListener("click", () => langDropdown?.classList.remove("open"));

applyLang(currentLang);

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

// ===== Animated skill bars + count-up =====
function countUp(el, target, duration) {
  const start = performance.now();
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + "%";
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const skillRows = document.querySelectorAll(".skill-row");
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const row = entry.target;
      const level = parseInt(row.dataset.level, 10) || 0;
      const label = row.querySelector("b");
      row.style.setProperty("--w", level + "%");
      row.classList.add("filled");
      if (label) countUp(label, level, 1200);
      skillObserver.unobserve(row);
    }
  });
}, { threshold: 0.4 });
skillRows.forEach(row => skillObserver.observe(row));

// ===== Experience timeline =====
const expTimeline = document.querySelector(".exp-timeline");
const expLineFill = document.querySelector(".exp-line-fill");
const expDots = document.querySelectorAll(".exp-dot");

function updateTimelineProgress() {
  if (!expTimeline || !expLineFill) return;
  const rect = expTimeline.getBoundingClientRect();
  const wh = window.innerHeight;
  const total = rect.height;
  const scrolled = Math.max(0, wh * 0.65 - rect.top);
  const pct = Math.min(Math.max(scrolled / total, 0), 1);
  expLineFill.style.setProperty("--progress", (pct * 100) + "%");
}

const dotObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      dotObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
expDots.forEach(dot => dotObserver.observe(dot));

window.addEventListener("scroll", updateTimelineProgress, { passive: true });
updateTimelineProgress();

// ===== Project filters =====
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.filter;
    projectCards.forEach(card => {
      card.classList.toggle("hidden", cat !== "all" && card.dataset.category !== cat);
    });
  });
});

// ===== Project modal =====
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalTags = document.getElementById("modalTags");
const modalIcon = document.getElementById("modalIcon");
const modalClose = document.getElementById("modalClose");

const iconMap = { bot: "\u{1F916}", api: "\u26A1", web: "\u{1F5C4}\uFE0F" };

document.querySelectorAll(".project-detail-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".project-card");
    const titleKey = btn.dataset.titleKey;
    const descKey = btn.dataset.descKey;
    modalTitle.textContent = titleKey ? t(titleKey) : btn.dataset.title;
    modalDesc.textContent = descKey ? t(descKey) : btn.dataset.desc;
    modalIcon.textContent = iconMap[card.dataset.category] || "\u{1F4C2}";
    modalTags.innerHTML = btn.dataset.tags.split(",").map(tt =>
      `<span class="tag code-font">${tt.trim()}</span>`
    ).join("");
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ===== Certificate Lightbox =====
(function() {
  const lightbox = document.getElementById("certLightbox");
  const lbImg = document.getElementById("certLbImg");
  const lbClose = document.getElementById("certLbClose");
  const lbPrev = document.getElementById("certLbPrev");
  const lbNext = document.getElementById("certLbNext");
  if (!lightbox || !lbImg) return;

  const sources = [];
  document.querySelectorAll("[data-lightbox]").forEach(el => {
    const idx = parseInt(el.dataset.lightbox, 10);
    const img = el.querySelector(".cert-img");
    if (img) sources[idx] = img.src;
  });

  let current = 0;

  function showLb(idx) {
    if (idx < 0 || idx >= sources.length || !sources[idx]) return;
    current = idx;
    lbImg.src = sources[idx];
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lbPrev.style.display = sources.length > 1 ? "" : "none";
    lbNext.style.display = sources.length > 1 ? "" : "none";
  }

  function hideLb() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach(el => {
    el.addEventListener("click", () => showLb(parseInt(el.dataset.lightbox, 10)));
  });

  lbClose?.addEventListener("click", hideLb);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) hideLb(); });
  lbPrev?.addEventListener("click", (e) => { e.stopPropagation(); showLb(current - 1); });
  lbNext?.addEventListener("click", (e) => { e.stopPropagation(); showLb(current + 1); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") hideLb();
    if (e.key === "ArrowLeft") showLb(current - 1);
    if (e.key === "ArrowRight") showLb(current + 1);
  });
})();

// ===== Contact form =====
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const msgInput = document.getElementById("message");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const msgError = document.getElementById("messageError");
const toastContainer = document.getElementById("toastContainer");

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function showError(input, errorEl, msg) {
  input.classList.add("invalid");
  errorEl.textContent = msg;
  errorEl.classList.add("visible");
}
function clearError(input, errorEl) {
  input.classList.remove("invalid");
  errorEl.classList.remove("visible");
}

nameInput?.addEventListener("input", () => {
  const v = nameInput.value.trim();
  if (v.length > 0 && v.length < 2) showError(nameInput, nameError, t("err_name_short"));
  else clearError(nameInput, nameError);
});
emailInput?.addEventListener("input", () => {
  const v = emailInput.value.trim();
  if (v.length > 0 && !isValidEmail(v)) showError(emailInput, emailError, t("err_email_invalid"));
  else clearError(emailInput, emailError);
});
msgInput?.addEventListener("input", () => {
  const v = msgInput.value.trim();
  if (v.length > 0 && v.length < 5) showError(msgInput, msgError, t("err_msg_short"));
  else clearError(msgInput, msgError);
});

function showToast(msg, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === "ok" ? "\u2705" : "\u274C"}</span><span>${msg}</span>`;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    message: msgInput.value.trim(),
  };

  let hasError = false;
  if (!payload.name || payload.name.length < 2) { showError(nameInput, nameError, t("err_name_short")); hasError = true; }
  else clearError(nameInput, nameError);
  if (!payload.email || !isValidEmail(payload.email)) { showError(emailInput, emailError, t("err_email_invalid")); hasError = true; }
  else clearError(emailInput, emailError);
  if (!payload.message || payload.message.length < 5) { showError(msgInput, msgError, t("err_msg_short")); hasError = true; }
  else clearError(msgInput, msgError);
  if (hasError) return;

  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 429) {
      showToast(data.detail || t("toast_rate_limit"), "err");
      return;
    }
    if (!res.ok) throw new Error(data.detail || "Server xatoligi");

    showToast(t("toast_success"), "ok");
    form.reset();
    clearError(nameInput, nameError);
    clearError(emailInput, emailError);
    clearError(msgInput, msgError);
  } catch (err) {
    showToast(err.message || t("toast_error"), "err");
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});
