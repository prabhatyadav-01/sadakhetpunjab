// SADAKHET interactions and sourced charts.
const nav = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (nav) {
  const updateNavbar = () => nav.classList.toggle("scrolled", window.scrollY > 60);
  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });
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

// Documentary Preview Modal logic
const docCard = document.getElementById("docPreviewCard");
const docModal = document.getElementById("docModal");
const closeDocModalBtn = document.getElementById("closeDocModal");
const confirmDocModalBtn = document.getElementById("confirmDocModal");

if (docCard && docModal) {
  const openDocPreview = () => {
    if (typeof docModal.showModal === "function") {
      docModal.showModal();
    }
  };

  docCard.addEventListener("click", openDocPreview);
  docCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDocPreview();
    }
  });

  const closeDoc = () => docModal.close();
  if (closeDocModalBtn) closeDocModalBtn.addEventListener("click", closeDoc);
  if (confirmDocModalBtn) confirmDocModalBtn.addEventListener("click", closeDoc);

  docModal.addEventListener("click", (e) => {
    if (e.target === docModal) docModal.close();
  });
}

// Image Lightbox Preview logic
const lightboxModal = document.getElementById("lightboxModal");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxDesc = document.getElementById("lightboxDesc");
const closeLightboxBtn = document.getElementById("closeLightbox");

if (lightboxModal && lightboxImg) {
  const openLightbox = (tile) => {
    const src = tile.getAttribute("data-img") || tile.querySelector("img")?.src;
    const title = tile.getAttribute("data-caption") || "";
    const desc = tile.getAttribute("data-desc") || "";

    if (src) lightboxImg.src = src;
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

