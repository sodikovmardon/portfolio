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

// ===== Theme Toggle =====
(function() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let theme = stored || (prefersDark ? "dark" : "light");

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    theme = t;
  }

  applyTheme(theme);

  toggle.addEventListener("click", () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  });
})();

// ===== Shared: close dropdown utility =====
function closeAllDropdowns(except) {
  document.querySelectorAll(".lang-dropdown.open, .nav-dropdown.open").forEach(el => {
    if (except && el === except) return;
    el.classList.remove("open");
    const btn = el.previousElementSibling;
    if (btn && btn.hasAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".lang-switcher") && !e.target.closest(".nav-more")) {
    closeAllDropdowns();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDropdowns();
});

// ===== Language Switcher =====
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
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });

  document.querySelectorAll(".lang-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  const langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.textContent = lang.toUpperCase();
}

function initLanguageSwitcher() {
  const langBtn = document.getElementById("langBtn");
  const langDropdown = document.getElementById("langDropdown");
  if (!langBtn || !langDropdown) return;

  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasOpen = langDropdown.classList.contains("open");
    closeAllDropdowns();
    if (!wasOpen) {
      langDropdown.classList.add("open");
      langBtn.setAttribute("aria-expanded", "true");
    }
  });

  langDropdown.querySelectorAll(".lang-option").forEach(btn => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.lang);
      closeAllDropdowns();
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeAllDropdowns(); langBtn.focus(); }
    });
  });

  applyLang(currentLang);
}

initLanguageSwitcher();

// ===== More Dropdown =====
function initMoreDropdown() {
  const moreBtn = document.getElementById("navMoreBtn");
  const moreDropdown = document.getElementById("navDropdown");
  if (!moreBtn || !moreDropdown) return;

  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasOpen = moreDropdown.classList.contains("open");
    closeAllDropdowns();
    if (!wasOpen) {
      moreDropdown.classList.add("open");
      moreBtn.setAttribute("aria-expanded", "true");
    }
  });

  moreDropdown.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      closeAllDropdowns();
    });
    a.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeAllDropdowns(); moreBtn.focus(); }
    });
  });
}

initMoreDropdown();

// ===== Scroll-Spy =====
function initScrollSpy() {
  const sections = document.querySelectorAll(".section[id]");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  const dropdownLinks = document.querySelectorAll(".nav-dropdown a[href^='#']");
  const moreBtn = document.getElementById("navMoreBtn");
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");

        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + id);
          if (link.getAttribute("href") === "#" + id) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });

        dropdownLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + id);
        });

        const moreActive = [...dropdownLinks].some(l => l.getAttribute("href") === "#" + id);
        if (moreBtn) {
          moreBtn.classList.toggle("active", moreActive);
          if (moreActive) {
            moreBtn.setAttribute("aria-current", "true");
          } else {
            moreBtn.removeAttribute("aria-current");
          }
        }
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(s => observer.observe(s));
}

initScrollSpy();

// ===== Navigation: scroll shrink + mobile =====
function initNavigation() {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navMobile = document.getElementById("navMobile");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });

  if (burger && navMobile) {
    burger.addEventListener("click", () => {
      const isOpen = navMobile.classList.contains("open");
      navMobile.classList.toggle("open");
      burger.classList.toggle("open");
      burger.setAttribute("aria-expanded", !isOpen);
    });

    navMobile.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        navMobile.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }
}

initNavigation();

// ===== Config =====
const API_BASE = "";

// ===== Blob parallax =====
(function() {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!mq.matches || rmq.matches) return;

  const blobs = [
    { el: document.querySelector(".blob-a"), x: 0, y: 0, tx: 0, ty: 0, kx: 0.04, ky: 0.03, max: 22 },
    { el: document.querySelector(".blob-b"), x: 0, y: 0, tx: 0, ty: 0, kx: -0.06, ky: 0.05, max: 18 },
    { el: document.querySelector(".blob-c"), x: 0, y: 0, tx: 0, ty: 0, kx: 0.05, ky: -0.04, max: 25 },
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

// ===== Custom Smooth Scroll =====
(function() {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!mq.matches || rmq.matches) return;

  let currentY = window.scrollY;
  let targetY = window.scrollY;
  const LERP = 0.08;
  let ticking = false;

  const progressBar = document.getElementById("scrollProgressBar");
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  function onWheel(e) {
    e.preventDefault();
    targetY = Math.min(Math.max(targetY + e.deltaY, 0), maxScroll());
  }

  function tick() {
    const diff = targetY - currentY;
    if (Math.abs(diff) > 0.5) {
      currentY += diff * LERP;
      window.scrollTo(0, Math.round(currentY));
    } else {
      currentY = targetY;
      window.scrollTo(0, targetY);
    }
    if (progressBar) {
      const pct = maxScroll() > 0 ? (currentY / maxScroll()) * 100 : 0;
      progressBar.style.width = pct + "%";
    }
    ticking = false;
  }

  function loop() {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    requestAnimationFrame(loop);
  }

  function onScroll() {
    if (Math.abs(window.scrollY - currentY) > 50) {
      targetY = window.scrollY;
      currentY = window.scrollY;
    }
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  requestAnimationFrame(loop);

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    targetY = target.getBoundingClientRect().top + window.scrollY;
    currentY = window.scrollY;
  });
})();

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

// ===== Count-up animation =====
function countUp(el, target, suffix, duration) {
  const start = performance.now();
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Observe stat counters
const statNumbers = document.querySelectorAll(".stat-number[data-count]");
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      countUp(el, target, suffix, 1800);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statNumbers.forEach(el => statObserver.observe(el));

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
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showLb(parseInt(el.dataset.lightbox, 10));
      }
    });
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
    if (!res.ok) throw new Error(data.detail || t("toast_error"));

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
