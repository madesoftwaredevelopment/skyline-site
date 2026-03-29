(() => {
  const stage = document.getElementById("hero-stage");

  if (!stage) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const layers = Array.from(stage.querySelectorAll("[data-depth]"));
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateTargets = (clientX, clientY) => {
    const rect = stage.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / rect.width;
    const relativeY = (clientY - rect.top) / rect.height;

    targetX = clamp((relativeX - 0.5) * 2, -1, 1);
    targetY = clamp((relativeY - 0.5) * 2, -1, 1);

    if (rafId === null) {
      rafId = requestAnimationFrame(animate);
    }
  };

  const animate = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0);
      const moveX = currentX * depth;
      const moveY = currentY * depth;

      if (layer.classList.contains("hero-phone-wrap")) {
        const rotateY = currentX * 2.2;
        const rotateX = currentY * -1.4;

        layer.style.transform =
          `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      } else {
        layer.style.transform =
          `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
      }
    });

    const settled =
      Math.abs(targetX - currentX) < 0.001 &&
      Math.abs(targetY - currentY) < 0.001;

    if (settled) {
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(animate);
  };

  const reset = () => {
    targetX = 0;
    targetY = 0;

    if (rafId === null) {
      rafId = requestAnimationFrame(animate);
    }
  };

  stage.addEventListener("pointermove", (event) => {
    updateTargets(event.clientX, event.clientY);
  });

  stage.addEventListener("pointerleave", reset);
  stage.addEventListener("pointercancel", reset);

  window.addEventListener("deviceorientation", (event) => {
    if (typeof event.gamma !== "number" || typeof event.beta !== "number") {
      return;
    }

    targetX = clamp(event.gamma / 18, -1, 1);
    targetY = clamp(event.beta / 30, -1, 1);

    if (rafId === null) {
      rafId = requestAnimationFrame(animate);
    }
  }, { passive: true });
})();
