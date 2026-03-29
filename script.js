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

  let ticking = false;
  let currentPhoneY = 0;
  let currentGlowPrimaryY = 0;
  let currentGlowSecondaryY = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateParallax = () => {
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
    const centered = (progress - 0.5) * 2;

    const targetPhoneY = centered * -36;
    const targetGlowPrimaryY = centered * -18;
    const targetGlowSecondaryY = centered * -28;

    currentPhoneY += (targetPhoneY - currentPhoneY) * 0.12;
    currentGlowPrimaryY += (targetGlowPrimaryY - currentGlowPrimaryY) * 0.12;
    currentGlowSecondaryY += (targetGlowSecondaryY - currentGlowSecondaryY) * 0.12;

    phone.style.transform = `translate3d(0, ${currentPhoneY}px, 0)`;
    glowPrimary.style.transform = `translate(-50%, calc(-50% + ${currentGlowPrimaryY}px))`;
    glowSecondary.style.transform = `translate(-50%, calc(-50% + ${currentGlowSecondaryY}px))`;

    const phoneSettled = Math.abs(targetPhoneY - currentPhoneY) < 0.1;
    const glow1Settled = Math.abs(targetGlowPrimaryY - currentGlowPrimaryY) < 0.1;
    const glow2Settled = Math.abs(targetGlowSecondaryY - currentGlowSecondaryY) < 0.1;

    if (!(phoneSettled && glow1Settled && glow2Settled)) {
      requestAnimationFrame(updateParallax);
    } else {
      ticking = false;
    }
  };

  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  };

  requestUpdate();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();
