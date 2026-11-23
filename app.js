/* A buildless invitation. All private details come exclusively from config.js. */
(() => {
  "use strict";
  const config = window.WEDDING_CONFIG;
  const dictionaries = window.WEDDING_I18N;
  if (!config || !dictionaries) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lang = "en";
  try { lang = localStorage.getItem("wedding-language") === "hi" ? "hi" : "en"; } catch (_) { /* storage is optional */ }
  let brideSide = location.hash.toLowerCase() === "#bride";
  let opened = false;
  let musicWanted = false;
  let activeGallery = 0;
  let lastDialogTrigger = null;
  let countdownTimer = null;
  const audio = $("#wedding-audio");
  const video = $("#invitation-film");
  const t = (key) => dictionaries[lang][key] || dictionaries.en[key] || key;
  const localized = (value) => typeof value === "string" ? config.translations?.[lang]?.[value] || value : value?.[lang] || value?.en || "";
  const couple = (withTitles = false) => {
    const names = [config.couple.groom, config.couple.bride];
    return (brideSide ? names.reverse() : names).map(person => withTitles && person.honorific ? `${localized(person.honorific)} ${localized(person)}` : localized(person));
  };
  const coupleText = () => couple().join(` ${localized("weds")} `);
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };
  const svgIcon = (name, className = "") => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", `icon ${className}`.trim());
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${name}`);
    svg.append(use);
    return svg;
  };
  let announcementTimer;
  function announce(message) {
    const status = $("#site-status");
    if (status) {
      clearTimeout(announcementTimer);
      status.textContent = "";
      requestAnimationFrame(() => { status.textContent = message; });
      announcementTimer = setTimeout(() => { status.textContent = ""; }, 4000);
    }
  }

  function renderNames() {
    $$("[data-couple-names]").forEach((node) => {
      if (node.id === "hero-names") return;
      const isGate = node.id === "gate-names";
      node.setAttribute("aria-label", couple(isGate).join(` ${localized("weds")} `));
      node.replaceChildren();
      couple(isGate).forEach((name, position) => {
        if (position) {
          if (isGate) node.append(document.createTextNode(" "), el("span", "gate-weds", localized("weds")), document.createTextNode(" "));
          else node.append(document.createTextNode(` ${localized("weds")} `));
        }
        node.append(el("span", "couple-name", name));
      });
    });
    const hero = $("#hero-names");
    if (!hero) return;
    hero.replaceChildren();
    hero.setAttribute("aria-label", couple(true).join(` ${localized("weds")} `));
    const names = couple(true);
    let index = 0;
    names.forEach((name, position) => {
      const word = el("span", position === 0 ? "name-first" : "name-second");
      word.setAttribute("aria-hidden", "true");
      const parts = lang === "hi" ? name.split(/\s+/) : Array.from(name);
      parts.forEach((part, n) => {
        const letter = el("span", "name-letter", part.replace(/ /g, "\u00a0") + (lang === "hi" && n < parts.length - 1 ? "\u00a0" : ""));
        letter.style.setProperty("--letter-index", String(index));
        letter.style.setProperty("--i", String(index++));
        word.append(letter);
      });
      hero.append(word);
      if (!position) {
        const ampersand = el("span", "name-ampersand", localized("weds"));
        ampersand.setAttribute("aria-hidden", "true");
        hero.append(ampersand);
      }
    });
  }

  function renderMonogram() {
    const embeddedArtwork = document.querySelector("#wedding-monogram image");
    const monogramSource = embeddedArtwork?.getAttribute("href") || config.assets.monogram;
    document.body.classList.toggle("has-monogram", Boolean(monogramSource));
    const slots = [...new Set([$ ("#monogram-slot"), ...$$("[data-monogram]")].filter(Boolean))];
    slots.forEach((slot) => {
      slot.replaceChildren();
      if (monogramSource) {
        const img = el("img", "monogram-image");
        img.src = monogramSource;
        img.alt = coupleText();
        img.addEventListener("error", () => { slot.replaceChildren(svgIcon("lotus", "monogram-lotus")); }, { once: true });
        slot.append(img);
      } else {
        slot.append(svgIcon("lotus", "monogram-lotus"));
      }
    });
  }

  function renderFamily() {
    const family = config.family[brideSide ? "bride" : "groom"] || {};
    const fillLines = (selector, lines, fallback) => {
      const target = $(selector);
      if (!target) return;
      target.replaceChildren();
      if (!Array.isArray(lines) || !lines.length) {
        target.append(el("p", "pending-copy", t(fallback)));
        target.dataset.pending = "true";
        return;
      }
      target.removeAttribute("data-pending");
      lines.forEach((line) => target.append(el("p", "family-line", localized(line))));
    };
    fillLines("#family-blessing", family.blessing, "blessingPending");
    fillLines("#formal-family-wording", family.invitation, "familyPending");
  }

  const compactUtc = (date) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const icsEscape = (value) => String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  function calendarDetails(event) {
    return {
      title: `${coupleText()} · ${localized(event.title)}`,
      description: [localized(event.subtitle), localized(event.note)].filter(Boolean).join("\n"),
      location: event.venue === config.venue ? localized(event.venue) : `${localized(event.venue)}, ${localized(config.venue)}`,
      start: compactUtc(event.startsAt)
    };
  }
  function downloadCalendar(event) {
    const events = event ? [event] : config.events;
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ashish and Aayushi//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    events.forEach(item => {
      const details = calendarDetails(item);
      lines.push("BEGIN:VEVENT", `UID:${item.id}-202702@wedding-invitation`, `DTSTAMP:${compactUtc(Date.now())}`, `DTSTART:${details.start}`, `SUMMARY:${icsEscape(details.title)}`, `LOCATION:${icsEscape(details.location)}`, ...(details.description ? [`DESCRIPTION:${icsEscape(details.description)}`] : []), "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    // RFC 5545 folding counts UTF-8 bytes and never splits a code point.
    const encoder = new TextEncoder();
    const folded = lines.map(line => {
      const chunks=[];let chunk="",bytes=0;
      for(const character of line){const size=encoder.encode(character).length;if(bytes+size>73){chunks.push(chunk);chunk=" ";bytes=1;}chunk+=character;bytes+=size;}
      chunks.push(chunk);return chunks.join("\r\n");
    }).join("\r\n")+"\r\n";
    const url=URL.createObjectURL(new Blob([folded],{type:"text/calendar;charset=utf-8"}));
    const link=el("a");link.href=url;link.download=event ? `${event.id}.ics` : "Ashish-Aayushi-Celebrations.ics";
    document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);announce(t("calendarReady"));
  }
  function renderEvents() {
    const timeline = $("#event-timeline");
    if (!timeline) return;
    // Preserve an optional decorative timeline rail supplied by the document.
    timeline.querySelectorAll(".event-card").forEach((node) => node.remove());
    config.events.forEach((event, index) => {
      const card = el("article", "event-card reveal");
      card.id = `event-${event.id}`;
      const number = el("span", "event-number", String(index + 1).padStart(2, "0"));
      number.setAttribute("aria-hidden", "true");
      const body = el("div", "event-content");
      const meta = el("div", "event-meta");
      const date = el("time", "event-date", localized(event.date));
      date.dateTime = event.startsAt.slice(0, 10);
      meta.append(date, el("span", "event-time", event.time));
      body.append(meta);
      const copy = el("div", "event-copy");
      copy.append(el("h3", "event-title", localized(event.title)));
      if (localized(event.subtitle)) copy.append(el("p", "event-subtitle", localized(event.subtitle)));
      if (event.muhurat) copy.append(el("p", "event-muhurat", t("muhuratNote")));
      copy.append(el("p", "event-venue", localized(event.venue)));
      if (event.dressCode) copy.append(el("p", "event-dress", `${t("dressCode")}: ${localized(event.dressCode)}`));
      if (localized(event.note)) copy.append(el("p", "event-note", localized(event.note)));
      body.append(copy);
      if (event.image) {
        const artwork = el("figure", "event-art");
        artwork.setAttribute("aria-hidden", "true");
        const image = el("img", "event-art-image");
        image.src = event.image; image.alt = "";
        image.width = 1254; image.height = 1254; image.decoding = "async"; image.loading = "lazy";
        artwork.append(image); body.append(artwork); card.classList.add("has-art");
      }
      card.append(number, body); timeline.append(card);
    });
  }

  function updateCountdown() {
    const remaining = Math.max(0, new Date(config.muhurat).getTime() - Date.now());
    const values = {
      days: Math.floor(remaining / 86400000),
      hours: Math.floor((remaining % 86400000) / 3600000),
      minutes: Math.floor((remaining % 3600000) / 60000),
      seconds: Math.floor((remaining % 60000) / 1000)
    };
    Object.entries(values).forEach(([unit, value]) => {
      const node = $(`[data-countdown="${unit}"]`);
      if (node) node.textContent = String(value).padStart(2, "0");
    });
    const complete = $("#countdown-complete");
    if (complete) { complete.hidden = remaining > 0; complete.textContent = t("celebrationBegun"); }
    if (!remaining && countdownTimer) clearInterval(countdownTimer);
  }

  function renderGallery() {
    const grid = $("#gallery-grid");
    if (!grid) return;
    grid.replaceChildren();
    if (!config.gallery.length) {
      for (let i = 0; i < 3; i++) {
        const frame = el("div", `gallery-placeholder placeholder-${i + 1}`);
        const art = el("div", "gallery-placeholder-art");
        art.append(svgIcon(i === 1 ? "lotus" : i === 0 ? "rose" : "flower", "gallery-ornament"));
        frame.append(art, el("span", "gallery-placeholder-label", t("galleryPlaceholder")));
        grid.append(frame);
      }
      return;
    }
    config.gallery.forEach((item, index) => {
      const button = el("button", "gallery-item gallery-photo"); button.type = "button";
      button.setAttribute("aria-label", localized(item.alt) || `${t("gallery")} ${index + 1}`);
      const img = el("img"); img.src = item.src; img.alt = localized(item.alt); img.loading = "lazy";
      button.append(img); button.addEventListener("click", () => openGallery(index, button)); grid.append(button);
    });
  }
  function showDialog(dialog, trigger) {
    if (!dialog) return;
    lastDialogTrigger = trigger;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else { dialog.setAttribute("open", ""); dialog.setAttribute("role", "dialog"); }
    document.body.classList.add("dialog-open");
    const close = dialog.querySelector("[data-dialog-close], .dialog-close, button");
    close?.focus();
  }
  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    document.body.classList.remove("dialog-open");
    lastDialogTrigger?.focus();
  }
  function updateLightbox() {
    const item = config.gallery[activeGallery];
    if (!item) return;
    const image = $("#lightbox-image");
    if (image) { image.src = item.src; image.alt = localized(item.alt); }
    const caption = $("#lightbox-caption"); if (caption) caption.textContent = localized(item.caption);
    const counter = $("#gallery-counter"); if (counter) counter.textContent = `${activeGallery + 1} / ${config.gallery.length}`;
  }
  function openGallery(index, trigger) { activeGallery = index; updateLightbox(); showDialog($("#gallery-dialog"), trigger); }
  function stepGallery(direction) {
    if (!config.gallery.length) return;
    activeGallery = (activeGallery + direction + config.gallery.length) % config.gallery.length;
    updateLightbox();
  }

  function updateMusicButton() {
    const button = $("#music-toggle");
    if (!button) return;
    const available = Boolean(config.assets.instrumental);
    button.disabled = !available;
    const isPlaying = available && audio && !audio.paused;
    const label = t(!available ? "musicUnavailable" : isPlaying ? "musicPause" : "musicPlay");
    button.setAttribute("aria-label", label); button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(Boolean(isPlaying)));
    button.classList.toggle("is-playing", Boolean(isPlaying));
    const labelNode = $("#music-label"); if (labelNode) labelNode.textContent = label;
  }
  async function playMusic() {
    if (!audio || !config.assets.instrumental || document.hidden || (video && !video.paused)) return;
    try { await audio.play(); } catch (_) { updateMusicButton(); }
  }
  function setupMedia() {
    if (audio) {
      audio.volume = 0.5; audio.loop = true;
      if (config.assets.instrumental) audio.src = config.assets.instrumental;
      ["play", "pause", "ended", "error"].forEach((type) => audio.addEventListener(type, updateMusicButton));
    }
    $("#music-toggle")?.addEventListener("click", () => {
      if (!audio || !config.assets.instrumental) return;
      musicWanted = !musicWanted;
      if (musicWanted) playMusic(); else audio.pause();
      updateMusicButton();
    });
    const filmButton = $("#film-button");
    if (filmButton) {
      filmButton.disabled = !config.assets.invitationFilm;
      filmButton.title = config.assets.invitationFilm ? "" : t("filmUnavailable");
      filmButton.addEventListener("click", () => {
        if (!config.assets.invitationFilm || !video) return;
        if (!video.src) video.src = config.assets.invitationFilm;
        showDialog($("#film-dialog"), filmButton);
        audio?.pause();
        video.play().catch(() => {});
      });
    }
    video?.addEventListener("play", () => audio?.pause());
    video?.addEventListener("ended", () => { if (musicWanted && opened) playMusic(); });
    $("#film-close")?.addEventListener("click", () => closeDialog($("#film-dialog")));
    $("#film-dialog")?.addEventListener("close", () => { video?.pause(); if (musicWanted && opened) playMusic(); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { audio?.pause(); video?.pause(); }
      else if (musicWanted && opened && !$("#film-dialog")?.open) playMusic();
    });
    updateMusicButton();
  }

  let revealObserver;
  function observeReveals() {
    revealObserver?.disconnect();
    const nodes = $$(".reveal");
    if (reduced.matches || !("IntersectionObserver" in window)) { nodes.forEach((n) => n.classList.add("is-visible")); return; }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealObserver.unobserve(entry.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    nodes.forEach((node) => revealObserver.observe(node));
  }
  function renderWeddingDetails() {
    const weddingTime = config.weddingTime || new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: config.timezone }).format(new Date(config.muhurat)).toUpperCase();
    const locale = lang === "hi" ? "hi-IN-u-nu-deva" : "en-GB";
    const dateFormat = { day: "2-digit", month: "long", year: "numeric", timeZone: config.timezone };
    const date = new Intl.DateTimeFormat(locale, dateFormat).format(new Date(config.muhurat));
    const displayDate = lang === "en" ? date.toUpperCase() : date;
    const firstDate = new Date(config.events[0].startsAt);
    const lastDate = new Date(config.events[config.events.length - 1].startsAt);
    const firstDay = new Intl.DateTimeFormat(locale, { day: "2-digit", timeZone: config.timezone }).format(firstDate);
    const lastDateFull = new Intl.DateTimeFormat(locale, dateFormat).format(lastDate);
    const range = `${firstDay} — ${lastDateFull}`;
    const values = {
      city: localized(config.city),
      venue: localized(config.venue),
      gateDate: `${displayDate} · ${localized(config.city)}`,
      weddingDate: displayDate,
      formalDate: `${date} · ${weddingTime}`,
      heroBottomRight: lang === "en" ? range.toUpperCase() : range,
      followedBy: localized(config.weddingNote),
      mapNote: `${localized(config.venue)} · ${localized(config.city)}`,
      countdownNote: `${t("shubhMuhurat")} · ${date} · ${weddingTime} IST`
    };
    Object.entries(values).forEach(([key, value]) => $$("[data-i18n]").filter((node) => node.dataset.i18n === key).forEach((node) => { node.textContent = value; }));
    $$("[data-city]").forEach((node) => { node.textContent = localized(config.city); });
    $$("[data-venue]").forEach((node) => { node.textContent = localized(config.venue); });
    $(".venue-photo")?.setAttribute("alt", localized(config.venue));
    $$("[data-wedding-date]").forEach((node) => { node.textContent = config.weddingDate; });
  }
  function renderLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dataset.language = lang;
    document.body.classList.toggle("lang-hi", lang === "hi");
    $$("[data-i18n]").forEach((node) => { const key = node.dataset.i18n; if (dictionaries[lang][key]) node.textContent = t(key); });
    $$("[data-i18n-label]").forEach((node) => node.setAttribute("aria-label", t(node.dataset.i18nLabel)));
    $$("[data-language-toggle]").forEach((node) => {
      node.setAttribute("aria-label", t("languageLabel"));
      node.setAttribute("aria-pressed", String(lang === "hi"));
      node.querySelector("[data-language-current]")?.replaceChildren(document.createTextNode(lang === "en" ? "हिंदी" : "English"));
      if (!node.children.length) node.textContent = lang === "en" ? "हिंदी" : "English";
    });
    renderNames(); renderMonogram(); renderFamily(); renderEvents(); renderGallery(); renderWeddingDetails(); updateCountdown(); updateMusicButton();
    $$("[data-person]").forEach(node => { node.textContent = localized(config.couple[node.dataset.person]); });
    $$("[data-parents]").forEach(node => { node.textContent = localized(config.family[node.dataset.parents]?.parents); node.hidden = !node.textContent; });
    $("#gallery").hidden = !config.gallery.length;
    $(".film-invite").hidden = !config.assets.invitationFilm;
    observeReveals();
    const filmButton = $("#film-button"); if (filmButton) filmButton.title = config.assets.invitationFilm ? "" : t("filmUnavailable");
    document.title = `${coupleText()} | Shubh Vivah | ${config.weddingDate}`;
  }

  function invitationUrl() {
    const source = config.siteUrl || (/^https?:$/.test(location.protocol) ? location.href : "");
    if (!source) return "";
    const url = new URL(source);
    url.hash = brideSide ? "bride" : "";
    return url.href;
  }
  function setupActions() {
    $$("[data-language-toggle]").forEach((button) => button.addEventListener("click", () => {
      lang = lang === "en" ? "hi" : "en";
      try { localStorage.setItem("wedding-language", lang); } catch (_) {}
      renderLanguage();
    }));
    $("#share-button")?.addEventListener("click", async () => {
      if (!invitationUrl()) { announce(t("shareAfterHosting")); return; }
      const data = { title: document.title, text: `${coupleText()} · Shubh Vivah · ${config.weddingDate} · ${localized(config.city)}`, url: invitationUrl() };
      if (navigator.share) {
        try { await navigator.share(data); return; }
        catch (error) { if (error.name === "AbortError") return; }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(`${data.text}\n${data.url}`)}`, "_blank", "noopener,noreferrer");
    });
    $("#copy-link")?.addEventListener("click", async () => {
      try {
        if (!invitationUrl()) { announce(t("shareAfterHosting")); return; }
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(invitationUrl());
        else {
          const input = el("textarea"); input.value = invitationUrl(); input.style.position = "fixed"; input.style.opacity = "0";
          document.body.append(input); input.select();
          const copied = document.execCommand("copy"); input.remove(); if (!copied) throw new Error("Copy unavailable");
        }
        announce(t("copied"));
      } catch (_) { announce(t("copyFailed")); }
    });
    $("#calendar-all")?.addEventListener("click", () => downloadCalendar());
    $("#save-pdf")?.addEventListener("click", () => window.print());
    $("#back-to-top")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced.matches ? "instant" : "smooth" }));
    $("#gallery-close")?.addEventListener("click", () => closeDialog($("#gallery-dialog")));
    $("#gallery-prev")?.addEventListener("click", () => stepGallery(-1));
    $("#gallery-next")?.addEventListener("click", () => stepGallery(1));
    $$("dialog").forEach((dialog) => {
      dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(dialog); });
      dialog.addEventListener("close", () => { document.body.classList.remove("dialog-open"); lastDialogTrigger?.focus(); });
    });
    const lightbox = $("#gallery-dialog");
    lightbox?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") stepGallery(-1);
      if (event.key === "ArrowRight") stepGallery(1);
    });
    let startTouch = null;
    lightbox?.addEventListener("touchstart", (event) => { startTouch = event.changedTouches[0].clientX; }, { passive: true });
    lightbox?.addEventListener("touchend", (event) => {
      if (startTouch === null) return;
      const difference = event.changedTouches[0].clientX - startTouch;
      if (Math.abs(difference) > 45) stepGallery(difference < 0 ? 1 : -1);
      startTouch = null;
    }, { passive: true });
    window.addEventListener("hashchange", () => {
      if (location.hash.toLowerCase() === "#bride") { brideSide = true; renderLanguage(); }
      if (location.hash.toLowerCase() === "#groom") { brideSide = false; renderLanguage(); }
    });
  }

  function setupGate() {
    const gate = $("#invitation-gate");
    const main = $("main");
    if (!gate) { opened = true; document.body.classList.remove("gate-closed"); return; }
    main?.setAttribute("inert", "");
    const outsideControls = $$(".site-header, .mobile-nav, .skip-link");
    outsideControls.forEach((node) => node.setAttribute("inert", ""));
    const trapGateFocus = (event) => {
      if (!document.body.classList.contains("gate-closed") || event.key !== "Tab") return;
      const focusables = $$("button:not([disabled]), a[href]", gate);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || !focusables.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !focusables.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trapGateFocus);
    requestAnimationFrame(() => $("#open-invitation")?.focus({ preventScroll: true }));
    const open = () => {
      if (opened) return;
      opened = true;
      $("#open-invitation").disabled = true;
      gate.classList.add("opening");
      document.body.classList.add("invitation-opening");
      if (config.assets.instrumental) { musicWanted = true; playMusic(); }
      startPetalBurst();
      setTimeout(() => {
        gate.classList.add("is-open");
        document.body.classList.remove("gate-closed");
        document.body.classList.add("invitation-open");
        renderNames();
        main?.removeAttribute("inert");
        outsideControls.forEach((node) => node.removeAttribute("inert"));
        document.removeEventListener("keydown", trapGateFocus);
        main?.setAttribute("tabindex", "-1");
        main?.focus({ preventScroll: true });
        setTimeout(() => { gate.hidden = true; gate.setAttribute("aria-hidden", "true"); }, reduced.matches ? 0 : 350);
      }, reduced.matches ? 50 : 1700);
    };
    $("#open-invitation")?.addEventListener("click", open);
  }

  let currentSection = "hero";
  let wind = 0;
  function setupScroll() {
    let lastY = window.scrollY; let scheduled = false;
    function update() {
      const y = window.scrollY;
      wind = Math.max(-4, Math.min(4, (y - lastY) * 0.045)); lastY = y;
      const sections = $$("main section[id]");
      const middle = window.innerHeight * 0.42;
      for (const section of sections) if (section.getBoundingClientRect().top <= middle) currentSection = section.id;
      document.body.dataset.activeSection = currentSection;
      $$("[data-section-link]").forEach((link) => {
        const id = link.dataset.sectionLink || link.getAttribute("href")?.slice(1);
        link.classList.toggle("active", id === currentSection);
        if (id === currentSection) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
      });
      const timeline = $("#event-timeline"); const fill = $("#timeline-progress");
      if (timeline && fill) {
        const rect = timeline.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.7 - rect.top) / rect.height));
        fill.style.setProperty("--timeline-progress", String(progress));
        fill.style.height = "100%";
        fill.style.transformOrigin = "top";
        fill.style.transform = `scaleY(${progress})`;
      }
      const topbar = $("#topbar") || $(".site-header"); topbar?.classList.toggle("is-scrolled", y > 40);
      if (!reduced.matches) document.documentElement.style.setProperty("--scroll-y", `${y}px`);
      scheduled = false;
    }
    window.addEventListener("scroll", () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update, { passive: true }); update();
  }

  let burstUntil = 0;
  function startPetalBurst() { burstUntil = performance.now() + 5000; }
  function setupPetals() {
    const canvas = $("#petal-canvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let width = 0, height = 0, frame = 0, particles = [], previous = 0;
    const kinds = {
      hero: ["rose", "mogra"], blessings: ["marigold", "orange"], invitation: ["lotus", "rose"], countdown: ["lotus"], functions: ["leaf", "marigold"], gallery: ["bougainvillea"], closing: ["rose", "glitter"]
    };
    function makeParticle(randomY = true) {
      const layer = Math.floor(Math.random() * 3);
      return { x: Math.random() * width, y: randomY ? Math.random() * height : -40, size: 4 + layer * 2.5 + Math.random() * 3, speed: 0.18 + layer * 0.22 + Math.random() * 0.2, rotation: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.007, phase: Math.random() * 6, layer, kind: null };
    }
    function resize() {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: width < 600 ? 13 : 23 }, () => makeParticle());
    }
    const colours = { rose: "#B85D4B", mogra: "#E7DCC5", marigold: "#E2AD4C", orange: "#D68C43", lotus: "#D8A1A0", leaf: "#8D9A76", bougainvillea: "#BE798B", glitter: "#C29B58" };
    function flower(kind, radius) {
      context.fillStyle = colours[kind];
      if (kind === "glitter") {
        context.beginPath(); context.moveTo(0, -radius); context.lineTo(radius * 0.18, -radius * 0.18); context.lineTo(radius, 0); context.lineTo(radius * 0.18, radius * 0.18); context.lineTo(0, radius); context.lineTo(-radius * 0.18, radius * 0.18); context.lineTo(-radius, 0); context.lineTo(-radius * 0.18, -radius * 0.18); context.closePath(); context.fill(); return;
      }
      if (kind === "leaf") {
        context.beginPath(); context.moveTo(0, -radius * 1.8); context.bezierCurveTo(radius, -radius * 0.5, radius * 0.45, radius, 0, radius * 1.8); context.bezierCurveTo(-radius * 0.4, radius * 0.6, -radius, -radius, 0, -radius * 1.8); context.fill(); return;
      }
      const petals = kind === "marigold" || kind === "orange" ? 10 : kind === "bougainvillea" ? 3 : kind === "lotus" ? 5 : 6;
      for (let i = 0; i < petals; i++) {
        context.save(); context.rotate(i * Math.PI * 2 / petals);
        context.beginPath(); context.ellipse(0, -radius * 0.5, radius * (kind === "lotus" ? 0.33 : 0.5), radius * 0.75, 0, 0, Math.PI * 2); context.fill(); context.restore();
      }
      context.fillStyle = kind === "mogra" ? "#C29B58" : "#C29B58";
      context.beginPath(); context.arc(0, 0, radius * 0.2, 0, Math.PI * 2); context.fill();
    }
    function draw(now) {
      frame = 0;
      if (document.hidden || reduced.matches) { context.clearRect(0, 0, width, height); return; }
      const delta = Math.min(2, (now - (previous || now)) / 16.67); previous = now;
      context.clearRect(0, 0, width, height);
      const burst = now < burstUntil;
      const available = burst ? ["rose", "marigold"] : kinds[currentSection] || kinds.hero;
      if (burst && particles.length < 58) particles.push(makeParticle(false));
      if (!burst && particles.length > (width < 600 ? 13 : 23)) particles.splice(-1, 1);
      particles.forEach((particle, index) => {
        particle.y += (particle.speed + (burst ? 1.5 : 0)) * delta;
        particle.x += (Math.sin(now / 2200 + particle.phase) * 0.18 + wind * (particle.layer + 1) * 0.07) * delta;
        particle.rotation += particle.spin * delta;
        if (particle.y > height + 35) Object.assign(particle, makeParticle(false));
        if (particle.x < -35) particle.x = width + 35;
        if (particle.x > width + 35) particle.x = -35;
        context.save(); context.translate(particle.x, particle.y); context.rotate(particle.rotation);
        context.globalAlpha = burst ? 0.5 : 0.13 + particle.layer * 0.045;
        flower(available[index % available.length], particle.size); context.restore();
      });
      wind *= 0.94;
      frame = requestAnimationFrame(draw);
    }
    function restart() {
      cancelAnimationFrame(frame); previous = 0;
      if (!reduced.matches && !document.hidden) frame = requestAnimationFrame(draw);
      else context.clearRect(0, 0, width, height);
    }
    resize(); restart();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", restart);
    reduced.addEventListener("change", () => { restart(); observeReveals(); });
  }

  setupMedia(); setupActions(); renderLanguage(); setupGate(); setupScroll(); setupPetals();
  countdownTimer = setInterval(updateCountdown, 1000);
  if (config.siteUrl) {
    const origin = new URL(config.siteUrl);
    const ogUrl = $('meta[property="og:url"]'); if (ogUrl) ogUrl.content = origin.href;
    const ogImage = $('meta[property="og:image"]'); if (ogImage && config.assets.socialImage) ogImage.content = new URL(config.assets.socialImage, origin).href;
  }
})();
