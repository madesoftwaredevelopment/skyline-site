(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const remap = (value, inMin, inMax, outMin, outMax) => {
    if (inMax - inMin === 0) return outMin;
    const normalized = (value - inMin) / (inMax - inMin);
    return outMin + (outMax - outMin) * normalized;
  };

  const easeInOut = (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const initHeroScrub = () => {
    const scrubSection = document.getElementById("scrub-section");
    const video = document.getElementById("hero-demo-video");
    const progressFill = document.getElementById("scrub-progress-fill");
    const fallbackCopy = document.getElementById("video-fallback-copy");
    const heroMessages = Array.from(document.querySelectorAll(".hero-message"));

    if (!scrubSection || !video || !progressFill || !fallbackCopy || heroMessages.length === 0) {
      return;
    }

    if (prefersReducedMotion) {
      fallbackCopy.classList.add("is-hidden");
      progressFill.style.width = "100%";
      heroMessages.forEach((message) => message.classList.add("is-active"));
      return;
    }

    let duration = 0;
    let metadataReady = false;
    let ticking = false;
    let pendingSeek = false;
    let targetTime = 0;
    let activeMessageIndex = 0;

    const setActiveMessage = (index) => {
      const safeIndex = clamp(index, 0, heroMessages.length - 1);
      if (safeIndex === activeMessageIndex) return;

      heroMessages[activeMessageIndex]?.classList.remove("is-active");
      heroMessages[safeIndex]?.classList.add("is-active");
      activeMessageIndex = safeIndex;
    };

    const safeSeek = (time) => {
      if (!metadataReady || !Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const clampedTime = clamp(time, 0, Math.max(duration - 0.001, 0));

      if (Math.abs(video.currentTime - clampedTime) < 0.016) {
        return;
      }

      if (pendingSeek) {
        targetTime = clampedTime;
        return;
      }

      try {
        pendingSeek = true;
        video.currentTime = clampedTime;
      } catch (error) {
        pendingSeek = false;
        console.warn("SkyLine Golf hero scrub: seek failed.", error);
      }
    };

    const updateFromScroll = () => {
      ticking = false;

      const rect = scrubSection.getBoundingClientRect();
      const totalScrollable = Math.max(scrubSection.offsetHeight - window.innerHeight, 1);
      const scrolled = clamp(-rect.top, 0, totalScrollable);
      const rawProgress = clamp(scrolled / totalScrollable, 0, 1);

      const scrubStart = 0.06;
      const scrubEnd = 0.88;

      let shapedProgress = 0;

      if (rawProgress <= scrubStart) {
        shapedProgress = 0;
      } else if (rawProgress >= scrubEnd) {
        shapedProgress = 1;
      } else {
        const inner = remap(rawProgress, scrubStart, scrubEnd, 0, 1);
        shapedProgress = easeInOut(inner);
      }

      if (metadataReady && duration > 0) {
        targetTime = shapedProgress * duration;
        safeSeek(targetTime);
      }

      progressFill.style.width = `${(shapedProgress * 100).toFixed(2)}%`;

      const messageZoneProgress = clamp(remap(rawProgress, 0.02, 0.92, 0, 1), 0, 1);
      const messageIndex = Math.min(
        heroMessages.length - 1,
        Math.floor(messageZoneProgress * heroMessages.length)
      );
      setActiveMessage(messageIndex);
    };

    const requestScrollUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateFromScroll);
    };

    const onLoadedMetadata = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      metadataReady = duration > 0;

      if (!metadataReady) {
        return;
      }

      fallbackCopy.classList.add("is-hidden");
      video.pause();
      video.muted = true;
      requestScrollUpdate();
    };

    const onPlayable = () => {
      fallbackCopy.classList.add("is-hidden");
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onPlayable);
    video.addEventListener("canplay", onPlayable);

    video.addEventListener("seeked", () => {
      pendingSeek = false;

      if (Math.abs(video.currentTime - targetTime) > 0.033) {
        safeSeek(targetTime);
      }
    });

    video.addEventListener("error", () => {
      fallbackCopy.textContent = "Demo unavailable";
    });

    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(() => video.pause()).catch(() => {
        /* Some browsers block this. Fine. */
      });
    }

    heroMessages[0].classList.add("is-active");
    requestScrollUpdate();

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
  };

  const initWaitlistForm = () => {
    const waitlistForm = document.getElementById("waitlist-form");
    const waitlistEmail = document.getElementById("waitlist-email");
    const waitlistStatus = document.getElementById("waitlist-status");

    if (!waitlistForm || !waitlistEmail || !waitlistStatus) {
      return;
    }

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    waitlistForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = waitlistEmail.value.trim();

      if (!isValidEmail(email)) {
        waitlistStatus.textContent = "Please enter a valid email address.";
        waitlistEmail.focus();
        return;
      }

      waitlistStatus.textContent = "Opening your email app…";

      const subject = encodeURIComponent("SkyLine Golf Waitlist");
      const body = encodeURIComponent(
        `Please add me to the SkyLine Golf waitlist.\n\nEmail: ${email}`
      );

      window.location.href = `mailto:contact@skylinegolf.app?subject=${subject}&body=${body}`;
    });
  };

  initHeroScrub();
  initWaitlistForm();
})();