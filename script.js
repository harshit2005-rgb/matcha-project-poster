const DRINKS = [
  {
    id: "coconut",
    name: "Coconut Matcha Cloud",
    badge: "Signature",
    note: "Dairy-free · Tropical",
    desc: "Creamy coconut milk, ceremonial matcha, and a slow-falling cloud foam with a soft dessert finish.",
    image: "assets/images/coconut.jpg",
    width: 480,
    height: 629,
    eyebrow: "House Spotlight"
  },
  {
    id: "mango",
    name: "Mango Matcha Latte",
    badge: "Tropical",
    note: "Fruity · Refreshing",
    desc: "Sun-kissed mango folded into an iced matcha swirl for a bright café-bar balance.",
    image: "assets/images/mango.jpg",
    width: 480,
    height: 720,
    eyebrow: "Matcha Signature"
  },
  {
    id: "vanilla",
    name: "Vanilla Float Matcha",
    badge: "Classic",
    note: "Smooth · Indulgent",
    desc: "Madagascar vanilla, matcha base, and a float-style finish inspired by Japanese kissaten restraint.",
    image: "assets/images/vanilla.jpg",
    width: 480,
    height: 789,
    eyebrow: "Matcha Signature"
  },
  {
    id: "strawberry",
    name: "Strawberry Cold Foam",
    badge: "Seasonal",
    note: "Sweet · Vibrant",
    desc: "Wild strawberry notes meet cold foam and iced matcha in a softer, romantic pour.",
    image: "assets/images/strawberry.jpg",
    width: 480,
    height: 853,
    eyebrow: "Matcha Signature"
  },
  {
    id: "biscoff",
    name: "Biscoff Matcha Cream",
    badge: "Indulgent",
    note: "Spiced · Rich",
    desc: "Lotus Biscoff warmth, velvet cream, and matcha depth with a darker dessert-bar character.",
    image: "assets/images/biscoff.jpg",
    width: 480,
    height: 853,
    eyebrow: "Matcha Signature"
  }
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const SHOWCASE_INTERVAL = 4800;

const dom = {
  body: document.body,
  load: document.getElementById("load"),
  menuLayout: document.getElementById("menuLayout"),
  previewSwitch: document.getElementById("previewSwitch"),
  previewButtons: Array.from(document.querySelectorAll("[data-preview-target]")),
  experienceStage: document.getElementById("experienceStage"),
  experienceShell: document.getElementById("experienceShell"),
  hero: document.querySelector(".hero"),
  lightbox: document.getElementById("lbox"),
  lightboxImage: document.getElementById("lbox-img"),
  lightboxBadge: document.getElementById("lbox-badge"),
  lightboxName: document.getElementById("lbox-name"),
  lightboxNote: document.getElementById("lbox-note"),
  lightboxDesc: document.getElementById("lbox-desc"),
  lightboxClose: document.getElementById("lbox-close"),
  revealItems: Array.from(document.querySelectorAll("[data-reveal]"))
};

const state = {
  previewMode: "desktop",
  activeLightbox: null,
  lastFocused: null,
  showcaseIndex: 0,
  showcaseTimer: null
};

document.addEventListener("DOMContentLoaded", () => {
  renderShowcase();
  initPreviewToggle();
  initLightbox();
  initReveals();
  initHeroParallax();
  initCanvasExperience();
  initLoader();
});

function renderShowcase() {
  dom.menuLayout.innerHTML = `
    <div class="menu-showcase">
      <button
        class="menu-showcase__panel"
        id="menuShowcasePanel"
        type="button"
        aria-haspopup="dialog"
        aria-label="View featured flavour"
      >
        <span class="menu-showcase__media">
          <img id="showcaseImage" src="" alt="" width="480" height="629" fetchpriority="high" decoding="async">
        </span>
        <span class="menu-showcase__overlay"></span>
        <span class="menu-showcase__grain"></span>
        <span class="menu-showcase__top">
          <span class="menu-showcase__badge" id="showcaseBadge"></span>
          <span class="menu-showcase__count" id="showcaseCount"></span>
        </span>
        <span class="menu-showcase__body">
          <span class="menu-showcase__eyebrow">Now Pouring</span>
          <span class="menu-showcase__name" id="showcaseName"></span>
          <span class="menu-showcase__note" id="showcaseNote"></span>
          <span class="menu-showcase__desc" id="showcaseDesc"></span>
          <span class="menu-showcase__cta">Tap to view <span aria-hidden="true">→</span></span>
        </span>
        <span class="menu-showcase__progress">
          <span class="menu-showcase__progress-bar" id="showcaseProgress"></span>
        </span>
      </button>
      <div class="menu-showcase__rail" id="menuShowcaseRail" aria-label="Flavour selection"></div>
    </div>
  `;

  const panel = document.getElementById("menuShowcasePanel");
  const rail = document.getElementById("menuShowcaseRail");

  rail.innerHTML = DRINKS.map((drink, index) => `
    <button
      class="menu-showcase__pill"
      type="button"
      data-showcase-index="${index}"
      aria-label="Show ${drink.name}"
    >
      <span class="menu-showcase__pill-name">${drink.name}</span>
      <span class="menu-showcase__pill-note">${drink.note}</span>
    </button>
  `).join("");

  panel.addEventListener("click", () => {
    openLightbox(DRINKS[state.showcaseIndex].id);
  });

  Array.from(rail.querySelectorAll("[data-showcase-index]")).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const index = Number(button.dataset.showcaseIndex);
      setShowcaseDrink(index, true);
    });
  });

  if (finePointer && !reduceMotion) {
    attachShowcasePointerEffects(panel);
  }

  setShowcaseDrink(0, false);
  scheduleShowcaseRotation();
}

function setShowcaseDrink(index, restartTimer) {
  const drink = DRINKS[index];
  const panel = document.getElementById("menuShowcasePanel");
  const image = document.getElementById("showcaseImage");
  const badge = document.getElementById("showcaseBadge");
  const count = document.getElementById("showcaseCount");
  const name = document.getElementById("showcaseName");
  const note = document.getElementById("showcaseNote");
  const desc = document.getElementById("showcaseDesc");
  const progress = document.getElementById("showcaseProgress");
  const pills = Array.from(document.querySelectorAll("[data-showcase-index]"));

  state.showcaseIndex = index;

  panel.classList.add("is-swapping");

  window.setTimeout(() => {
    image.src = drink.image;
    image.alt = drink.name;
    image.width = drink.width;
    image.height = drink.height;
    badge.textContent = drink.badge;
    count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(DRINKS.length).padStart(2, "0")}`;
    name.textContent = drink.name;
    note.textContent = drink.note;
    desc.textContent = drink.desc;
    panel.setAttribute("aria-label", `View ${drink.name}`);
    pills.forEach((pill, pillIndex) => {
      const active = pillIndex === index;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-pressed", String(active));
    });
    panel.classList.remove("is-swapping");
  }, reduceMotion ? 0 : 170);

  animateShowcaseProgress(progress);

  if (restartTimer) {
    scheduleShowcaseRotation();
  }
}

function animateShowcaseProgress(progress) {
  progress.style.transition = "none";
  progress.style.transform = "scaleX(0)";
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      progress.style.transition = `transform ${SHOWCASE_INTERVAL}ms linear`;
      progress.style.transform = "scaleX(1)";
    });
  });
}

function scheduleShowcaseRotation() {
  if (state.showcaseTimer) {
    window.clearTimeout(state.showcaseTimer);
  }

  state.showcaseTimer = window.setTimeout(() => {
    const nextIndex = (state.showcaseIndex + 1) % DRINKS.length;
    setShowcaseDrink(nextIndex, false);
    scheduleShowcaseRotation();
  }, SHOWCASE_INTERVAL);
}

function initPreviewToggle() {
  const storedMode = readStoredPreviewMode();
  const initialMode = storedMode || (
    window.innerWidth >= 1500
      ? "wide"
      : window.innerWidth < 760
        ? "mobile"
        : "desktop"
  );
  setPreviewMode(initialMode, false);

  dom.previewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPreviewMode(button.dataset.previewTarget, true);
    });
  });
}

function setPreviewMode(mode, persist = true) {
  state.previewMode = mode === "mobile" || mode === "wide" ? mode : "desktop";
  dom.body.classList.toggle("preview-mobile", state.previewMode === "mobile");
  dom.body.classList.toggle("preview-desktop", state.previewMode === "desktop");
  dom.body.classList.toggle("preview-wide", state.previewMode === "wide");
  dom.previewSwitch.dataset.mode = state.previewMode;
  dom.experienceStage.dataset.preview = state.previewMode;

  dom.previewButtons.forEach((button) => {
    const active = button.dataset.previewTarget === state.previewMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (persist) {
    try {
      localStorage.setItem("matcha-preview-mode", state.previewMode);
    } catch (error) {
      // Ignore storage failures in private browsing modes.
    }
  }
}

function readStoredPreviewMode() {
  try {
    return localStorage.getItem("matcha-preview-mode");
  } catch (error) {
    return null;
  }
}

function initLoader() {
  const dismiss = () => {
    window.setTimeout(() => dom.load.classList.add("gone"), 420);
  };

  if (document.readyState === "complete") {
    dismiss();
  } else {
    window.addEventListener("load", dismiss, { once: true });
  }
}

function initReveals() {
  const applyReveal = (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  };

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(applyReveal, {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    });
    dom.revealItems.forEach((item) => observer.observe(item));
    return;
  }

  dom.revealItems.forEach((item) => item.classList.add("is-visible"));
}

function initLightbox() {
  const backdrop = dom.lightbox.querySelector("[data-lightbox-close]");

  dom.lightboxClose.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.activeLightbox) {
      closeLightbox();
    }
  });
}

function openLightbox(drinkId) {
  const drink = DRINKS.find((item) => item.id === drinkId);
  if (!drink) {
    return;
  }

  state.activeLightbox = drink.id;
  state.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  dom.lightboxImage.src = drink.image;
  dom.lightboxImage.alt = drink.name;
  dom.lightboxBadge.textContent = drink.badge;
  dom.lightboxName.textContent = drink.name;
  dom.lightboxNote.textContent = drink.note;
  dom.lightboxDesc.textContent = drink.desc;
  dom.lightbox.classList.add("show");
  dom.lightbox.setAttribute("aria-hidden", "false");
  dom.body.style.overflow = "hidden";
  dom.lightboxClose.focus();
}

function closeLightbox() {
  if (!state.activeLightbox) {
    return;
  }

  state.activeLightbox = null;
  dom.lightbox.classList.remove("show");
  dom.lightbox.setAttribute("aria-hidden", "true");
  dom.body.style.overflow = "";

  if (state.lastFocused) {
    state.lastFocused.focus();
  }
}

function initHeroParallax() {
  if (!finePointer || reduceMotion) {
    return;
  }

  let frame = 0;
  let nextX = 0;
  let nextY = 0;

  const updateHero = () => {
    dom.hero.style.setProperty("--hero-shift-x", `${nextX}px`);
    dom.hero.style.setProperty("--hero-shift-y", `${nextY}px`);
    frame = 0;
  };

  dom.experienceShell.addEventListener("pointermove", (event) => {
    const rect = dom.experienceShell.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    nextX = offsetX * 18;
    nextY = offsetY * 14;

    if (!frame) {
      frame = window.requestAnimationFrame(updateHero);
    }
  });

  dom.experienceShell.addEventListener("pointerleave", () => {
    nextX = 0;
    nextY = 0;
    if (!frame) {
      frame = window.requestAnimationFrame(updateHero);
    }
  });
}

function attachShowcasePointerEffects(panel) {
  let frame = 0;
  let nextX = 50;
  let nextY = 18;
  let rotateX = 0;
  let rotateY = 0;

  const paint = () => {
    panel.style.setProperty("--pointer-x", `${nextX}%`);
    panel.style.setProperty("--pointer-y", `${nextY}%`);
    panel.style.setProperty("--panel-rotate-x", `${rotateX}deg`);
    panel.style.setProperty("--panel-rotate-y", `${rotateY}deg`);
    frame = 0;
  };

  panel.addEventListener("pointermove", (event) => {
    const rect = panel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    nextX = x * 100;
    nextY = y * 100;
    rotateX = (0.5 - y) * 3.2;
    rotateY = (x - 0.5) * 3.8;

    if (!frame) {
      frame = window.requestAnimationFrame(paint);
    }
  });

  panel.addEventListener("pointerleave", () => {
    nextX = 50;
    nextY = 18;
    rotateX = 0;
    rotateY = 0;

    if (!frame) {
      frame = window.requestAnimationFrame(paint);
    }
  });
}

function initCanvasExperience() {
  if (reduceMotion) {
    return;
  }

  const backgroundCanvas = document.getElementById("bgc");
  const particleCanvas = document.getElementById("ptc");
  const backgroundCtx = backgroundCanvas.getContext("2d");
  const particleCtx = particleCanvas.getContext("2d");

  const stateCanvas = {
    width: 0,
    height: 0,
    dpr: 1,
    raf: 0,
    running: !document.hidden,
    particles: [],
    glowStops: [
      { x: 0.16, y: 0.18, radius: 0.56, color: "40,82,54", speed: 0.00048 },
      { x: 0.84, y: 0.52, radius: 0.48, color: "68,115,82", speed: 0.00035 },
      { x: 0.38, y: 0.88, radius: 0.38, color: "25,48,34", speed: 0.0006 }
    ]
  };

  const resize = () => {
    const rect = dom.experienceShell.getBoundingClientRect();
    stateCanvas.width = Math.round(rect.width);
    stateCanvas.height = Math.round(rect.height);
    stateCanvas.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    [backgroundCanvas, particleCanvas].forEach((canvas) => {
      canvas.width = Math.round(stateCanvas.width * stateCanvas.dpr);
      canvas.height = Math.round(stateCanvas.height * stateCanvas.dpr);
      canvas.style.width = `${stateCanvas.width}px`;
      canvas.style.height = `${stateCanvas.height}px`;
    });

    backgroundCtx.setTransform(stateCanvas.dpr, 0, 0, stateCanvas.dpr, 0, 0);
    particleCtx.setTransform(stateCanvas.dpr, 0, 0, stateCanvas.dpr, 0, 0);
    resetParticles(stateCanvas);
  };

  const resetParticles = (scene) => {
    const density = Math.max(12, Math.min(28, Math.round((scene.width * scene.height) / 38000)));
    scene.particles = Array.from({ length: density }, () => ({
      x: Math.random() * scene.width,
      y: Math.random() * scene.height,
      radius: Math.random() * 1.4 + 0.4,
      dx: (Math.random() - 0.5) * 0.11,
      dy: -(Math.random() * 0.24 + 0.03),
      alpha: Math.random() * 0.85 + 0.1,
      deltaAlpha: (Math.random() - 0.5) * 0.004,
      type: Math.floor(Math.random() * 3),
      rotation: Math.random() * Math.PI * 2,
      deltaRotation: (Math.random() - 0.5) * 0.008
    }));
  };

  const draw = (time) => {
    if (!stateCanvas.running) {
      return;
    }

    const tick = time * 0.001;
    backgroundCtx.clearRect(0, 0, stateCanvas.width, stateCanvas.height);
    backgroundCtx.fillStyle = "#080f0a";
    backgroundCtx.fillRect(0, 0, stateCanvas.width, stateCanvas.height);

    stateCanvas.glowStops.forEach((glow, index) => {
      const x = stateCanvas.width * (glow.x + 0.04 * Math.sin(tick * (index + 1.4)));
      const y = stateCanvas.height * (glow.y + 0.04 * Math.cos(tick * (index + 1.8)));
      const radius = Math.min(stateCanvas.width, stateCanvas.height) * glow.radius;
      const gradient = backgroundCtx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${glow.color}, 0.13)`);
      gradient.addColorStop(1, "transparent");
      backgroundCtx.fillStyle = gradient;
      backgroundCtx.beginPath();
      backgroundCtx.arc(x, y, radius, 0, Math.PI * 2);
      backgroundCtx.fill();
    });

    particleCtx.clearRect(0, 0, stateCanvas.width, stateCanvas.height);

    stateCanvas.particles.forEach((particle) => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.alpha += particle.deltaAlpha;
      particle.rotation += particle.deltaRotation;

      if (particle.alpha < 0.05 || particle.alpha > 0.9) {
        particle.deltaAlpha *= -1;
      }

      if (particle.y < -24) {
        particle.y = stateCanvas.height + 24;
        particle.x = Math.random() * stateCanvas.width;
      }

      if (particle.x < -20) {
        particle.x = stateCanvas.width + 20;
      } else if (particle.x > stateCanvas.width + 20) {
        particle.x = -20;
      }

      if (particle.type === 0) {
        const gradient = particleCtx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 5
        );
        gradient.addColorStop(0, `rgba(90, 148, 105, ${particle.alpha * 0.42})`);
        gradient.addColorStop(1, "transparent");
        particleCtx.fillStyle = gradient;
        particleCtx.beginPath();
        particleCtx.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2);
        particleCtx.fill();
        return;
      }

      if (particle.type === 1) {
        particleCtx.save();
        particleCtx.translate(particle.x, particle.y);
        particleCtx.rotate(particle.rotation);
        particleCtx.globalAlpha = particle.alpha * 0.26;
        particleCtx.fillStyle = "hsl(132 36% 34%)";
        particleCtx.beginPath();
        particleCtx.moveTo(0, -particle.radius * 3.2);
        particleCtx.bezierCurveTo(
          particle.radius * 1.6,
          -particle.radius * 1.4,
          particle.radius * 1.4,
          particle.radius * 1.6,
          0,
          particle.radius * 3.2
        );
        particleCtx.bezierCurveTo(
          -particle.radius * 1.4,
          particle.radius * 1.6,
          -particle.radius * 1.6,
          -particle.radius * 1.4,
          0,
          -particle.radius * 3.2
        );
        particleCtx.fill();
        particleCtx.restore();
        particleCtx.globalAlpha = 1;
        return;
      }

      particleCtx.globalAlpha = particle.alpha * 0.16;
      particleCtx.fillStyle = "#c9a84c";
      particleCtx.beginPath();
      particleCtx.arc(particle.x, particle.y, particle.radius * 0.42, 0, Math.PI * 2);
      particleCtx.fill();
      particleCtx.globalAlpha = 1;
    });

    stateCanvas.raf = window.requestAnimationFrame(draw);
  };

  const restart = () => {
    if (stateCanvas.raf) {
      window.cancelAnimationFrame(stateCanvas.raf);
    }

    stateCanvas.running = !document.hidden;

    if (stateCanvas.running) {
      stateCanvas.raf = window.requestAnimationFrame(draw);
    }
  };

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => {
      resize();
      restart();
    });
    observer.observe(dom.experienceShell);
  } else {
    window.addEventListener("resize", resize);
  }

  document.addEventListener("visibilitychange", restart);

  resize();
  restart();
}
