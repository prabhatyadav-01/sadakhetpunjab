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

if (anthemAudio && anthemControls.length) {

  const showAnthemState = (playing) => {
    anthemControls.forEach((control) => {
      control.setAttribute("aria-pressed", String(playing));
      control.setAttribute("aria-label", playing ? "Pause Punjab, Saadi Dharti" : "Play Punjab, Saadi Dharti");
      const anthemStatus = control.querySelector(".anthem-status");
      const anthemIcon = control.querySelector(".anthem-icon");
      if (anthemStatus) anthemStatus.textContent = playing ? "Playing · tap to pause" : "Paused · tap to play";
      if (anthemIcon) anthemIcon.className = playing
        ? "fa-solid fa-pause anthem-icon"
        : "fa-solid fa-play anthem-icon";
    });
  };

  anthemAudio.volume = 0.32;
  anthemAudio.addEventListener("play", () => showAnthemState(true));
  anthemAudio.addEventListener("pause", () => showAnthemState(false));

  anthemControls.forEach((control) => control.addEventListener("click", async () => {
    if (!anthemAudio.paused) {
      anthemAudio.pause();
      return;
    }
    try {
      await anthemAudio.play();
    } catch {
      showAnthemState(false);
    }
  }));

  anthemAudio.play().catch(() => showAnthemState(false));
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

