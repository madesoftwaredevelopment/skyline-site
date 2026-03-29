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

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let ticking = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const animate = () => {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;

    const phoneMoveX = currentX * 18;
    const phoneMoveY = currentY * 14;
    const phoneRotateY = currentX * 5;
    const phoneRotateX = currentY * -4;

    phone.style.transform = `
      translate3d(${phoneMoveX}px, ${phoneMoveY}px, 0)
      rotateX(${phoneRotateX}deg)
      rotateY(${phoneRotateY}deg)
    `;

    glowPrimary.style.transform = `translate(calc(-50% + ${currentX * 10}px), calc(-50% + ${currentY * 8}px))`;
    glowSecondary.style.transform = `translate(calc(-50% + ${currentX * 16}px), calc(-50% + ${currentY * 12}px))`;

    const stillMoving =
      Math.abs(targetX - currentX) > 0.001 ||
      Math.abs(targetY - currentY) > 0.001;

    if (stillMoving) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  };

  const start = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  };

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    targetX = clamp(x, -1, 1);
    targetY = clamp(y, -1, 1);
    start();
  });

  stage.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    start();
  });
})();
