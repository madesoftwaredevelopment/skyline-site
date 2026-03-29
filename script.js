(() => {
  const scrubSection = document.getElementById("scrub-section");
  const video = document.getElementById("hero-demo-video");
  const progressFill = document.getElementById("scrub-progress-fill");
  const fallbackCopy = document.getElementById("video-fallback-copy");

  if (!scrubSection || !video || !progressFill || !fallbackCopy) {
    console.warn("SkyLine Golf hero scrub: missing required elements.");
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    fallbackCopy.classList.add("is-hidden");
    progressFill.style.width = "100%";
    return;
  }

  let duration = 0;
  let metadataReady = false;
  let ticking = false;
  let pendingSeek = false;
  let targetTime = 0;

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

    if (!metadataReady || duration <= 0) {
      return;
    }

    const rect = scrubSection.getBoundingClientRect();
    const totalScrollable = Math.max(scrubSection.offsetHeight - window.innerHeight, 1);
    const scrolled = clamp(-rect.top, 0, totalScrollable);
    const rawProgress = clamp(scrolled / totalScrollable, 0, 1);

    /*
      Shaped progress:
      - first 8% holds near start
      - middle 80% scrubs
      - last 12% settles near end
    */
    const scrubStart = 0.08;
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

    targetTime = shapedProgress * duration;
    safeSeek(targetTime);
    progressFill.style.width = `${(shapedProgress * 100).toFixed(2)}%`;
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
      console.warn("SkyLine Golf hero scrub: video metadata did not produce a valid duration.");
      return;
    }

    fallbackCopy.classList.add("is-hidden");
    video.pause();
    video.muted = true;
    requestScrollUpdate();
  };

  video.addEventListener("loadedmetadata", onLoadedMetadata);

  video.addEventListener("seeked", () => {
    pendingSeek = false;

    if (Math.abs(video.currentTime - targetTime) > 0.033) {
      safeSeek(targetTime);
    }
  });

  video.addEventListener("error", () => {
    fallbackCopy.textContent = "Demo unavailable";
    console.warn("SkyLine Golf hero scrub: video failed to load.");
  });

  // Try to prime the video for iOS/Safari seeking behavior.
  video.muted = true;
  video.playsInline = true;

  const playPromise = video.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => video.pause())
      .catch(() => {
        /* Fine. Some browsers block this, but scrubbing can still work. */
      });
  }

  requestScrollUpdate();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
})();
