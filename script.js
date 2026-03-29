(() => {
  const stage = document.getElementById("hero-stage");
  const phone = document.getElementById("hero-phone-wrap");
  const glowPrimary = document.getElementById("hero-glow-primary");
  const glowSecondary = document.getElementById("hero-glow-secondary");

  if (!stage || !phone || !glowPrimary || !glowSecondary) {
    console.warn("Hero parallax: missing required elements.");
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  let ticking = false;

  const updateParallax = () => {
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportCenter = viewportHeight / 2;
    const stageCenter = rect.top + rect.height / 2;

    const distanceFromCenter = (stageCenter - viewportCenter) / viewportHeight;
    const normalized = clamp(distanceFromCenter, -1, 1);

    const closeness = 1 - Math.abs(normalized);

    const phoneScale = 0.9 + closeness * 0.16;
    const glowPrimaryScale = 0.9 + closeness * 0.2;
    const glowSecondaryScale = 0.88 + closeness * 0.24;

    const phoneTranslateY = normalized * 20;
    const glowPrimaryTranslateY = normalized * 12;
    const glowSecondaryTranslateY = normalized * 18;

    phone.style.transform = `translate3d(0, ${phoneTranslateY}px, 0) scale(${phoneScale})`;
    glowPrimary.style.transform = `translate(-50%, calc(-50% + ${glowPrimaryTranslateY}px)) scale(${glowPrimaryScale})`;
    glowSecondary.style.transform = `translate(-50%, calc(-50% + ${glowSecondaryTranslateY}px)) scale(${glowSecondaryScale})`;

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(updateParallax);
  };

  updateParallax();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();
