(() => {
  const stage = document.getElementById("hero-stage");
  const phone = document.getElementById("hero-phone-wrap");
  const glowPrimary = document.getElementById("hero-glow-primary");
  const glowSecondary = document.getElementById("hero-glow-secondary");

  if (!stage || !phone || !glowPrimary || !glowSecondary) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateHeroParallax = () => {
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = viewportHeight / 2;
    const stageCenter = rect.top + rect.height / 2;

    const distanceFromCenter = (stageCenter - viewportCenter) / viewportHeight;
    const normalized = clamp(distanceFromCenter, -1, 1);

    const closeness = 1 - Math.abs(normalized);

    const phoneScale = 0.92 + closeness * 0.12;
    const glowPrimaryScale = 0.9 + closeness * 0.18;
    const glowSecondaryScale = 0.88 + closeness * 0.22;

    const phoneTranslateY = normalized * 18;
    const glowPrimaryTranslateY = normalized * 10;
    const glowSecondaryTranslateY = normalized * 16;

    phone.style.transform = `translate3d(0, ${phoneTranslateY}px, 0) scale(${phoneScale})`;
    glowPrimary.style.transform = `translate(-50%, calc(-50% + ${glowPrimaryTranslateY}px)) scale(${glowPrimaryScale})`;
    glowSecondary.style.transform = `translate(-50%, calc(-50% + ${glowSecondaryTranslateY}px)) scale(${glowSecondaryScale})`;
  };

  let ticking = false;

  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    requestAnimationFrame(() => {
      updateHeroParallax();
      ticking = false;
    });
  };

  updateHeroParallax();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();
