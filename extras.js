/* A quiet paper flight and wish lanterns, accompanying the original invitation. */
(() => {
  "use strict";
  const svgNS = "http://www.w3.org/2000/svg";
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(pointer: fine)");
  const svg = (tag, attributes = {}) => {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };
  const isOpen = () => !document.body.classList.contains("gate-closed");
  const flight = svg("svg", { id: "lotus-flight", "aria-hidden": "true", focusable: "false" });
  const route = svg("path", { fill: "none" });
  const trail = svg("path", { class: "lotus-flight-trail", fill: "none" });
  const plane = svg("g", { class: "lotus-paper-plane" });
  plane.append(svg("path", { d: "M-19-10 20 0-19 10-10 0Z M-10 0 20 0 M-19-10-7-2 M-19 10-7 2" }));
  flight.append(route, trail, plane);
  const lanterns = document.createElement("div");
  lanterns.id = "lotus-lanterns";
  lanterns.setAttribute("aria-hidden", "true");
  const glow = document.createElement("canvas");
  glow.id = "lotus-pointer-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.append(flight, lanterns, glow);
  const context = glow.getContext("2d");
  let status = document.querySelector("#guest-status");
  if (!status) {
    status = document.createElement("div");
    status.id = "lotus-wish-status";
    status.className = "sr-only";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    document.body.append(status);
  }
  let routeLength = 0;
  let pageHeight = 0;
  let geometryFrame = 0;
  let flightFrame = 0;
  let glowFrame = 0;
  let lastPointer = 0;
  let points = [];
  let lanternCooldown = 0;
  let hasReleasedLanterns = false;
  let lanternObserver;
  const keepsakePhoto = document.querySelector(".closing-keepsake");
  let statusTimer = 0;
  let cleanupTimers = new Set();

  function resizeGlow() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    glow.width = Math.round(innerWidth * ratio);
    glow.height = Math.round(innerHeight * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function rebuildFlight() {
    geometryFrame = 0;
    const visible = isOpen() && !motion.matches;
    flight.hidden = !visible;
    if (!visible) return;
    const width = document.documentElement.clientWidth;
    // The decorative layer is absolute and cannot change the content height.
    const main = document.querySelector("main");
    pageHeight = Math.max(main?.offsetTop + main?.offsetHeight || 0, document.body.offsetHeight, innerHeight);
    flight.setAttribute("viewBox", `0 0 ${width} ${pageHeight}`);
    flight.setAttribute("height", pageHeight);
    const hero = document.querySelector("#hero");
    const firstBand = Math.min(pageHeight, Math.max(hero?.offsetHeight || innerHeight, innerHeight * .8));
    const margin = width < 700 ? 14 : Math.min(width * .085, 140);
    const bands = Math.max(4, Math.ceil((pageHeight - firstBand) / 1000));
    const bandHeight = (pageHeight - firstBand) / bands;
    let path = `M ${margin} 0 C ${margin * 1.5} ${firstBand * .3}, ${margin * .6} ${firstBand * .7}, ${margin} ${firstBand}`;
    for (let i = 0; i < bands; i++) {
      const y = firstBand + bandHeight * i;
      const from = i % 2 ? width - margin : margin;
      const to = i % 2 ? margin : width - margin;
      path += ` C ${from} ${y + bandHeight * .43}, ${to} ${y + bandHeight * .57}, ${to} ${y + bandHeight}`;
    }
    route.setAttribute("d", path);
    trail.setAttribute("d", path);
    routeLength = route.getTotalLength();
    trail.style.strokeDasharray = `${routeLength} ${routeLength}`;
    scheduleFlight();
  }

  function updateFlight() {
    flightFrame = 0;
    if (!routeLength || motion.matches || !isOpen() || document.hidden) return;
    const targetY = Math.min(pageHeight - 1, scrollY + innerHeight * .48);
    // Y increases along this route; binary search locates the plane at the viewport.
    let start = 0, end = routeLength;
    for (let i = 0; i < 18; i++) {
      const mid = (start + end) / 2;
      if (route.getPointAtLength(mid).y < targetY) start = mid;
      else end = mid;
    }
    const length = (start + end) / 2;
    const point = route.getPointAtLength(length);
    const next = route.getPointAtLength(Math.min(routeLength, length + 3));
    const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
    plane.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    // Reveal the fine trail only as far as the plane has travelled.
    trail.style.strokeDashoffset = String(routeLength - length);
  }

  function scheduleFlight() {
    if (!flightFrame && isOpen() && !motion.matches && !document.hidden) {
      flightFrame = requestAnimationFrame(updateFlight);
    }
  }

  function scheduleGeometry() {
    if (!geometryFrame) geometryFrame = requestAnimationFrame(rebuildFlight);
  }

  function drawGlow(now) {
    glowFrame = 0;
    if (!context) return;
    context.clearRect(0, 0, innerWidth, innerHeight);
    if (motion.matches || document.hidden || !isOpen()) return;
    points = points.filter(point => now - point.born < 650);
    points.forEach(point => {
      const life = 1 - (now - point.born) / 650;
      const radius = 44;
      const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      gradient.addColorStop(0, `rgba(217,154,37,${.085 * life})`);
      gradient.addColorStop(1, "rgba(217,154,37,0)");
      context.fillStyle = gradient;
      context.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    });
    if (points.length) glowFrame = requestAnimationFrame(drawGlow);
  }

  function clearGlow() {
    points = [];
    if (glowFrame) cancelAnimationFrame(glowFrame);
    glowFrame = 0;
    context?.clearRect(0, 0, innerWidth, innerHeight);
  }

  function clearLanterns() {
    lanterns.replaceChildren();
    cleanupTimers.forEach(timer => clearTimeout(timer));
    cleanupTimers.clear();
  }

  function releaseLanterns() {
    if (!isOpen() || document.hidden || Date.now() < lanternCooldown) return;
    const lanternCount = matchMedia("(max-width: 700px)").matches ? 3 : 5;
    hasReleasedLanterns = true;
    lanternObserver?.disconnect();
    lanternObserver = null;
    lanternCooldown = Date.now() + 1800;
    clearTimeout(statusTimer);
    status.textContent = "";
    statusTimer = setTimeout(() => {
      status.textContent = document.documentElement.lang === "hi"
        ? `आपकी शुभकामनाओं के साथ ${lanternCount === 3 ? "तीन" : "पाँच"} आकाशदीप।`
        : `${lanternCount === 3 ? "Three" : "Five"} lanterns, carrying your wishes.`;
    }, 40);
    // Keep repeated wishes bounded, including in background tabs.
    if (lanterns.children.length + lanternCount > lanternCount * 3) clearLanterns();
    for (let i = 0; i < lanternCount; i++) {
      const lantern = document.createElement("div");
      lantern.className = "lotus-wish-lantern";
      lantern.style.left = `${lanternCount === 3 ? 20 + i * 28 : 12 + i * 18}%`;
      lantern.style.setProperty("--lantern-drift", `${(i / (lanternCount - 1) - .5) * 140}px`);
      lantern.style.animationDelay = `${i * .35}s`;
      const art = svg("svg", { viewBox: "0 0 60 100", focusable: "false" });
      art.append(svg("use", { href: "#wish-lantern-art" }));
      lantern.append(art);
      lanterns.append(lantern);
      const remove = () => {
        lantern.remove();
        clearTimeout(timer);
        cleanupTimers.delete(timer);
      };
      const timer = setTimeout(remove, motion.matches ? 2200 : 10500);
      cleanupTimers.add(timer);
      lantern.addEventListener("animationend", remove, { once: true });
    }
  }

  function observeFirstLanterns() {
    if (hasReleasedLanterns || !isOpen() || motion.matches || document.hidden) {
      lanternObserver?.disconnect();
      lanternObserver = null;
      return;
    }
    if (lanternObserver || !keepsakePhoto?.complete || !keepsakePhoto.naturalWidth || !("IntersectionObserver" in window)) return;
    lanternObserver = new IntersectionObserver(entries => {
      if (!hasReleasedLanterns && !motion.matches && entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .5)) releaseLanterns();
    }, { threshold: .5, rootMargin: "0px 0px -72px 0px" });
    lanternObserver.observe(keepsakePhoto);
  }

  document.querySelector("#lantern-button")?.addEventListener("click", releaseLanterns);
  keepsakePhoto?.addEventListener("load", observeFirstLanterns, { once: true });

  window.addEventListener("pointermove", event => {
    if (!context || !finePointer.matches || motion.matches || !isOpen() || document.hidden || event.pointerType === "touch") return;
    const now = performance.now();
    if (now - lastPointer < 40) return;
    lastPointer = now;
    points.push({ x: event.clientX, y: event.clientY, born: now });
    if (points.length > 12) points.shift();
    if (!glowFrame) glowFrame = requestAnimationFrame(drawGlow);
  }, { passive: true });
  window.addEventListener("scroll", scheduleFlight, { passive: true });
  window.addEventListener("resize", () => { resizeGlow(); scheduleGeometry(); }, { passive: true });
  window.addEventListener("pageshow", scheduleGeometry);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { clearGlow(); clearLanterns(); }
    else scheduleGeometry();
    observeFirstLanterns();
  });
  motion.addEventListener("change", () => {
    clearGlow();
    clearLanterns();
    scheduleGeometry();
    observeFirstLanterns();
  });
  new MutationObserver(() => { scheduleGeometry(); observeFirstLanterns(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  if ("ResizeObserver" in window) {
    const main = document.querySelector("main");
    if (main) new ResizeObserver(scheduleGeometry).observe(main);
  }
  document.fonts?.ready.then(scheduleGeometry);
  resizeGlow();
  scheduleGeometry();
  observeFirstLanterns();
})();
