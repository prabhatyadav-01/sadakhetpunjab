// SADAKHET interactions and sourced charts.
const nav = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navDropdowns = document.querySelectorAll(".nav-dropdown details");

// Helper to auto-collapse all open dropdowns
const closeAllDropdowns = () => {
  navDropdowns.forEach((details) => {
    if (details.open) {
      details.open = false;
    }
  });
};

// Helper to collapse mobile nav menu
const closeMobileNav = () => {
  if (navLinks && navLinks.classList.contains("open")) {
    navLinks.classList.remove("open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }
};

if (navToggle && navLinks) {
  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) {
      closeAllDropdowns();
    }
  });

  // When any navigation link is clicked (including dropdown links), auto-collapse menu and dropdowns
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeAllDropdowns();
      closeMobileNav();
    });
  });
}

// Auto-collapse when clicking outside the navbar
document.addEventListener("click", (e) => {
  if (nav && !nav.contains(e.target)) {
    closeAllDropdowns();
    closeMobileNav();
  }
});

// Auto-collapse dropdowns and mobile menu on scroll / moving down
let lastScrollY = window.scrollY;

if (nav) {
  const updateNavbar = () => {
    const currentScrollY = window.scrollY;
    nav.classList.toggle("scrolled", currentScrollY > 60);

    const deltaY = Math.abs(currentScrollY - lastScrollY);
    // Auto-collapse if user scrolls or moves down by more than 15px
    if (deltaY > 15 || (currentScrollY > 70 && deltaY > 6)) {
      closeAllDropdowns();
      closeMobileNav();
    }
    lastScrollY = currentScrollY;
  };

  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });
}

// Touchmove handler for responsive mobile auto-collapse
window.addEventListener("touchmove", () => {
  const currentScrollY = window.scrollY;
  if (Math.abs(currentScrollY - lastScrollY) > 18) {
    closeAllDropdowns();
    closeMobileNav();
  }
}, { passive: true });

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllDropdowns();
    closeMobileNav();
  }
});

// Desktop hover support for dropdowns (non-touch devices)
if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    const details = dropdown.querySelector("details");
    if (!details) return;
    dropdown.addEventListener("mouseenter", () => {
      details.open = true;
    });
    dropdown.addEventListener("mouseleave", () => {
      details.open = false;
    });
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".animate-on-scroll").forEach((element) => revealObserver.observe(element));
}

const anthemAudio = document.getElementById("anthemAudio");
const anthemControls = document.querySelectorAll("[data-anthem-control]");
const anthemVolToggle = document.getElementById("anthemVolToggle");
const anthemVolIcon = document.getElementById("anthemVolIcon");
const anthemVolText = document.getElementById("anthemVolText");

if (anthemAudio && anthemControls.length) {
  // Volume presets: 1.0 (100% system sound level), 0.75, 0.5, 0.25, 0 (mute)
  const volumeLevels = [1.0, 0.75, 0.5, 0.25, 0];
  let volIndex = 0; // Starts at 100% full system sound percentage

  const updateVolumeUI = (vol) => {
    const pct = Math.round(vol * 100);
    if (anthemVolText) anthemVolText.textContent = `${pct}%`;
    if (anthemVolToggle) anthemVolToggle.title = `Sound Volume: ${pct}% system percentage (click to cycle)`;
    if (anthemVolIcon) {
      if (vol === 0) {
        anthemVolIcon.className = "fa-solid fa-volume-xmark";
      } else if (vol <= 0.4) {
        anthemVolIcon.className = "fa-solid fa-volume-low";
      } else {
        anthemVolIcon.className = "fa-solid fa-volume-high";
      }
    }
  };

  const getStatusText = (playing) => {
    if (!playing) return "Paused · tap to play";
    const pct = Math.round(anthemAudio.volume * 100);
    return `Playing · ${pct}% sound`;
  };

  const showAnthemState = (playing) => {
    anthemControls.forEach((control) => {
      control.setAttribute("aria-pressed", String(playing));
      control.setAttribute("aria-label", playing ? "Pause Punjab, Saadi Dharti" : "Play Punjab, Saadi Dharti");
      const anthemStatus = control.querySelector(".anthem-status");
      const anthemIcon = control.querySelector(".anthem-icon");
      if (anthemStatus) anthemStatus.textContent = getStatusText(playing);
      if (anthemIcon) anthemIcon.className = playing
        ? "fa-solid fa-pause anthem-icon"
        : "fa-solid fa-play anthem-icon";
    });
  };

  // Set initial volume to 100% system sound percentage
  anthemAudio.volume = volumeLevels[volIndex];
  updateVolumeUI(anthemAudio.volume);

  anthemAudio.addEventListener("play", () => showAnthemState(true));
  anthemAudio.addEventListener("pause", () => showAnthemState(false));
  anthemAudio.addEventListener("volumechange", () => {
    updateVolumeUI(anthemAudio.volume);
    if (!anthemAudio.paused) showAnthemState(true);
  });

  // Cycle volume levels on toggle button click
  if (anthemVolToggle) {
    anthemVolToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      volIndex = (volIndex + 1) % volumeLevels.length;
      anthemAudio.volume = volumeLevels[volIndex];
      if (anthemAudio.paused && volumeLevels[volIndex] > 0) {
        anthemAudio.play().catch(() => {});
      }
    });
  }

  // Play / Pause toggle
  anthemControls.forEach((control) => control.addEventListener("click", async () => {
    if (!anthemAudio.paused) {
      anthemAudio.pause();
      return;
    }
    try {
      if (anthemAudio.volume === 0) {
        volIndex = 0;
        anthemAudio.volume = volumeLevels[0];
      }
      await anthemAudio.play();
    } catch {
      showAnthemState(false);
    }
  }));

  // Automatic audio start on site open with smart banner fallback
  const autoplayBanner = document.getElementById("audioAutoplayBanner");
  const closeBannerBtn = document.getElementById("closeAutoplayBanner");
  let hasStarted = false;

  const hideBanner = () => {
    if (autoplayBanner) autoplayBanner.classList.remove("show");
  };

  const showBanner = () => {
    if (autoplayBanner && !hasStarted && anthemAudio.paused) {
      autoplayBanner.classList.add("show");
    }
  };

  if (closeBannerBtn) {
    closeBannerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hideBanner();
    });
  }

  if (autoplayBanner) {
    autoplayBanner.addEventListener("click", () => {
      startAutoplay();
    });
  }

  const startAutoplay = async () => {
    if (hasStarted || !anthemAudio.paused) {
      hideBanner();
      return;
    }
    try {
      anthemAudio.volume = volumeLevels[volIndex];
      await anthemAudio.play();
      hasStarted = true;
      hideBanner();
      detachAutoplayListeners();
    } catch {
      // Browser autoplay policy prevented initial unmuted playback until interaction
      showAnthemState(false);
      showBanner();
    }
  };

  const onUserInteraction = () => {
    if (!hasStarted && anthemAudio.paused) {
      startAutoplay();
    }
  };

  const autoplayEvents = ["click", "pointerdown", "touchstart", "keydown", "scroll", "wheel", "mousemove", "focus"];
  const detachAutoplayListeners = () => {
    autoplayEvents.forEach((evt) => window.removeEventListener(evt, onUserInteraction));
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", startAutoplay);
    window.removeEventListener("load", startAutoplay);
  };

  autoplayEvents.forEach((evt) => {
    window.addEventListener(evt, onUserInteraction, { once: true, passive: true });
  });

  const onVisibility = () => {
    if (document.visibilityState === "visible" && !hasStarted && anthemAudio.paused) {
      startAutoplay();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", startAutoplay, { once: true });
  window.addEventListener("load", startAutoplay, { once: true });

  // Attempt immediate play on page load
  startAutoplay();
}

if (typeof Chart !== "undefined") {
  Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#4a514c";

  const colors = {
    green: "#40916c",
    deepGreen: "#1a3a26",
    blue: "#0077b6",
    paleBlue: "#90e0ef",
    red: "#d62828",
    orange: "#f4a261",
    wheat: "#e9c46a",
    grid: "rgba(26, 58, 38, 0.10)",
  };

  const sharedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { usePointStyle: true, boxWidth: 10, padding: 16 } },
    },
  };

  const groundwaterCanvas = document.getElementById("groundwaterChart");
  if (groundwaterCanvas) {
    new Chart(groundwaterCanvas, {
      type: "bar",
      data: {
        labels: ["Annual extractable resource", "Annual extraction"],
        datasets: [{
          label: "BCM",
          data: [17.29, 26.32],
          backgroundColor: [colors.blue, colors.red],
          borderRadius: 8,
          maxBarThickness: 56,
        }],
      },
      options: {
        ...sharedOptions,
        plugins: { ...sharedOptions.plugins, legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: colors.grid }, title: { display: true, text: "Billion cubic metres" } },
        },
      },
    });
  }

  const assessmentCanvas = document.getElementById("assessmentChart");
  if (assessmentCanvas) {
    new Chart(assessmentCanvas, {
      type: "doughnut",
      data: {
        labels: ["Over-exploited · 110", "Critical · 6", "Semi-critical · 17", "Safe · 20"],
        datasets: [{
          data: [110, 6, 17, 20],
          backgroundColor: [colors.red, colors.orange, colors.wheat, colors.green],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 5,
        }],
      },
      options: { ...sharedOptions, cutout: "62%" },
    });
  }

  const stubbleCanvas = document.getElementById("stubbleChart");
  if (stubbleCanvas) {
    new Chart(stubbleCanvas, {
      type: "bar",
      data: {
        labels: ["2021", "2022", "2023", "2024", "2025"],
        datasets: [{
          label: "Paddy-season fire counts",
          data: [71304, 49922, 36663, 10909, 5114],
          backgroundColor: [colors.red, "#d9433d", "#df6253", colors.orange, colors.green],
          borderRadius: 7,
          maxBarThickness: 58,
        }],
      },
      options: {
        ...sharedOptions,
        plugins: { ...sharedOptions.plugins, legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: colors.grid },
            ticks: { callback: (value) => Number(value).toLocaleString("en-IN") },
          },
        },
      },
    });
  }
}

// Teaser Video & Cinema Modal logic
const inlineTeaserVideo = document.getElementById("inlineTeaserVideo");
const videoCustomOverlay = document.getElementById("videoCustomOverlay");
const inlinePlayBtn = document.getElementById("inlinePlayBtn");
const docCinemaBtn = document.getElementById("docPreviewCardBtn");
const docModal = document.getElementById("docModal");
const modalTeaserVideo = document.getElementById("modalTeaserVideo");
const closeDocModalBtn = document.getElementById("closeDocModal");
const confirmDocModalBtn = document.getElementById("confirmDocModal");

// Helper to pause background anthem whenever a video is playing
const pauseAnthemForVideo = () => {
  if (anthemAudio && !anthemAudio.paused) {
    anthemAudio.pause();
  }
};

// Inline Video Controls
if (inlineTeaserVideo) {
  const playInlineVideo = () => {
    pauseAnthemForVideo();
    if (videoCustomOverlay) {
      videoCustomOverlay.classList.add("is-hidden");
    }
    inlineTeaserVideo.play().catch(() => {});
  };

  const pauseInlineVideo = () => {
    inlineTeaserVideo.pause();
  };

  if (videoCustomOverlay) {
    videoCustomOverlay.addEventListener("click", playInlineVideo);
    videoCustomOverlay.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        playInlineVideo();
      }
    });
  }

  if (inlinePlayBtn) {
    inlinePlayBtn.addEventListener("click", () => {
      if (inlineTeaserVideo.paused) {
        playInlineVideo();
      } else {
        pauseInlineVideo();
      }
    });
  }

  inlineTeaserVideo.addEventListener("play", () => {
    pauseAnthemForVideo();
    if (videoCustomOverlay) videoCustomOverlay.classList.add("is-hidden");
    if (inlinePlayBtn) {
      inlinePlayBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i> Pause Teaser';
    }
  });

  inlineTeaserVideo.addEventListener("pause", () => {
    if (inlinePlayBtn) {
      inlinePlayBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> Play Teaser';
    }
  });

  inlineTeaserVideo.addEventListener("ended", () => {
    if (videoCustomOverlay) videoCustomOverlay.classList.remove("is-hidden");
    if (inlinePlayBtn) {
      inlinePlayBtn.innerHTML = '<i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Replay Teaser';
    }
  });
}

// Cinema Modal Controls
if (docModal) {
  const openCinemaModal = () => {
    pauseAnthemForVideo();
    if (inlineTeaserVideo) {
      if (!inlineTeaserVideo.paused) {
        inlineTeaserVideo.pause();
      }
      if (modalTeaserVideo) {
        try {
          modalTeaserVideo.currentTime = inlineTeaserVideo.currentTime || 0;
        } catch (_) {}
      }
    }

    if (typeof docModal.showModal === "function") {
      docModal.showModal();
    }

    if (modalTeaserVideo) {
      modalTeaserVideo.play().catch(() => {});
    }
  };

  const closeCinemaModal = () => {
    if (modalTeaserVideo) {
      modalTeaserVideo.pause();
      if (inlineTeaserVideo) {
        try {
          inlineTeaserVideo.currentTime = modalTeaserVideo.currentTime || 0;
        } catch (_) {}
      }
    }
    if (docModal.open) {
      docModal.close();
    }
  };

  if (docCinemaBtn) {
    docCinemaBtn.addEventListener("click", openCinemaModal);
  }

  if (closeDocModalBtn) {
    closeDocModalBtn.addEventListener("click", closeCinemaModal);
  }

  if (confirmDocModalBtn) {
    confirmDocModalBtn.addEventListener("click", closeCinemaModal);
  }

  docModal.addEventListener("click", (e) => {
    if (e.target === docModal) {
      closeCinemaModal();
    }
  });

  docModal.addEventListener("close", () => {
    if (modalTeaserVideo && !modalTeaserVideo.paused) {
      modalTeaserVideo.pause();
    }
  });

  if (modalTeaserVideo) {
    modalTeaserVideo.addEventListener("play", () => {
      pauseAnthemForVideo();
      if (inlineTeaserVideo && !inlineTeaserVideo.paused) {
        inlineTeaserVideo.pause();
      }
    });
  }
}

// Image Lightbox Preview logic
const lightboxModal = document.getElementById("lightboxModal");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxDesc = document.getElementById("lightboxDesc");
const closeLightboxBtn = document.getElementById("closeLightbox");

if (lightboxModal && lightboxImg) {
  const openLightbox = (tile) => {
    const imgEl = tile.querySelector("img");
    const src = imgEl ? (imgEl.currentSrc || imgEl.src) : tile.getAttribute("data-img");
    const title = tile.getAttribute("data-caption") || "";
    const desc = tile.getAttribute("data-desc") || "";

    if (src) {
      lightboxImg.src = src;
      lightboxImg.alt = title;
    }
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;

    if (typeof lightboxModal.showModal === "function") {
      lightboxModal.showModal();
    }
  };

  document.querySelectorAll(".banner-interactive").forEach((tile) => {
    tile.addEventListener("click", () => openLightbox(tile));
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(tile);
      }
    });
  });

  if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener("click", () => lightboxModal.close());
  }

  lightboxModal.addEventListener("click", (e) => {
    if (e.target === lightboxModal) lightboxModal.close();
  });
}

// Punjabi / English Language Translation Toggle
const initLanguageToggle = () => {
  const langToggleBtn = document.getElementById("langToggleBtn");
  const langTagText = document.getElementById("langTagText");
  if (!langToggleBtn) return;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const isCurrentPunjabi = () => {
    const cookie = getCookie("googtrans");
    if (cookie && cookie.includes("/pa")) return true;
    return localStorage.getItem("sadakhet_lang") === "pa";
  };

  const updateUI = (isPa) => {
    if (isPa) {
      langToggleBtn.classList.add("active-pa");
      if (langTagText) langTagText.textContent = "English";
      langToggleBtn.setAttribute("title", "Switch back to English / ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਵੇਖੋ");
      langToggleBtn.setAttribute("aria-label", "Switch back to English");
    } else {
      langToggleBtn.classList.remove("active-pa");
      if (langTagText) langTagText.textContent = "ਪੰਜਾਬੀ";
      langToggleBtn.setAttribute("title", "Translate site to Punjabi / ਪੰਜਾਬੀ ਵਿੱਚ ਪੜ੍ਹੋ");
      langToggleBtn.setAttribute("aria-label", "Translate site to Punjabi");
    }
  };

  const setGoogleTransCookie = (val) => {
    const host = window.location.hostname;
    document.cookie = `googtrans=${val}; path=/;`;
    if (host) {
      document.cookie = `googtrans=${val}; path=/; domain=${host};`;
      document.cookie = `googtrans=${val}; path=/; domain=.${host};`;
    }
  };

  const triggerGoogleTranslate = (langCode) => {
    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change"));
      return true;
    }
    return false;
  };

  // Set initial UI state
  updateUI(isCurrentPunjabi());

  langToggleBtn.addEventListener("click", () => {
    const currentlyPa = isCurrentPunjabi();
    if (currentlyPa) {
      // Revert to English
      localStorage.setItem("sadakhet_lang", "en");
      setGoogleTransCookie("/en/en");
      updateUI(false);
      const changed = triggerGoogleTranslate("en");
      if (!changed) {
        window.location.reload();
      }
    } else {
      // Translate to Punjabi
      localStorage.setItem("sadakhet_lang", "pa");
      setGoogleTransCookie("/en/pa");
      updateUI(true);
      const changed = triggerGoogleTranslate("pa");
      if (!changed) {
        window.location.reload();
      }
    }
  });

  // Active suppression of Google Translate top toolbar banner
  const suppressGoogleBanner = () => {
    if (document.body && document.body.style.top && document.body.style.top !== "0px") {
      document.body.style.top = "0px";
    }
    if (document.documentElement && document.documentElement.style.top && document.documentElement.style.top !== "0px") {
      document.documentElement.style.top = "0px";
    }

    const junkSelectors = [
      ".goog-te-banner-frame",
      "iframe.goog-te-banner-frame",
      ".VIpgJd-ZVi9od-ORHb-OEVmcd",
      ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf",
      ".VIpgJd-y60bgq-OEVmcd",
      "iframe[id*=':1']",
      "iframe[id*='goog']",
      "#goog-gt-tt"
    ];

    junkSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("height", "0px", "important");
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("pointer-events", "none", "important");
      });
    });

    if (document.body) {
      Array.from(document.body.children).forEach((child) => {
        if (child.id === "google_translate_element") return;
        if (child.tagName === "IFRAME" && !child.classList.contains("instagram-reel-iframe")) {
          child.style.setProperty("display", "none", "important");
          child.style.setProperty("height", "0px", "important");
        } else if (child.classList.contains("skiptranslate") && child.tagName === "DIV") {
          child.style.setProperty("display", "none", "important");
          child.style.setProperty("height", "0px", "important");
        }
      });
    }
  };

  suppressGoogleBanner();
  setInterval(suppressGoogleBanner, 300);

  // If saved state is Punjabi, ensure select is triggered once Google Translate loads
  if (isCurrentPunjabi()) {
    const observer = new MutationObserver(() => {
      suppressGoogleBanner();
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        if (combo.value !== "pa") {
          combo.value = "pa";
          combo.dispatchEvent(new Event("change"));
        }
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
  }
};

initLanguageToggle();


