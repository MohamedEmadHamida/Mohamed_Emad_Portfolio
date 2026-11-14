"use client";

import { useEffect, useRef } from "react";
import type { WallItem } from "@/lib/content";
import { isVideo } from "@/lib/uploads";
import { prefersReducedMotion } from "@/lib/client";
import { track } from "@/lib/track";
import { SectionHead } from "@/components/ui/SectionHead";

type Pt = { x: number; y: number };

/**
 * Infinite draggable / throwable grid with a spotlight, an arc tilt and a typewriter focus card.
 * The grid is drawn imperatively every frame (cells are created and removed as they scroll),
 * so React only renders the static shell.
 */
export function RenderWall({ items: ITEMS }: { items: WallItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current!, grid = gridRef.current!, spot = spotRef.current!;
    const dim = dimRef.current!, card = cardRef.current!, fimg = imgRef.current!, fvid = vidRef.current!;
    const ft = titleRef.current!, fy = tagRef.current!, fd = descRef.current!, caret = caretRef.current!;
    const reduce = prefersReducedMotion();
    const small = matchMedia("(max-width:640px)").matches;
    const CFG = { cell: small ? 150 : 220, pad: 10, gap: 10, arcAmount: 0.6, arcMax: 28, edgeFade: 0.25, paStrength: 0.1, paEase: 0.12, friction: 0.92, minSpeed: 80, maxSpeed: 2500, zoom: 0.7, dragT: 4, pressDelay: 120 };
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    let offset: Pt = { x: 0, y: 0 }, target: Pt = { x: 0, y: 0 }, inertia: Pt = { x: 0, y: 0 }, vel: Pt = { x: 0, y: 0 };
    const mo: Pt = { x: 0, y: 0 };
    let tmo: Pt = { x: 0, y: 0 };
    let cs = CFG.cell, tcs = CFG.cell, vp = { w: stage.clientWidth, h: stage.clientHeight };
    let pressing = false, dragging = false, inertiaOn = false, pressPos: Pt = { x: 0, y: 0 }, startOff: Pt = { x: 0, y: 0 };
    let last = { x: 0, y: 0, t: 0 }, pressTimer = 0, lastT = performance.now(), raf = 0, visible = false;
    let focusOn = false, fcell: HTMLElement | null = null, typeT = 0, openY = 0, tilting = false, tiltRaf = 0;
    let rx = 0, ry = 0, trx = 0, tryY = 0;
    const timers: number[] = [];
    const cache: Record<string, HTMLDivElement> = {};
    /** Width / height of each frame, learned as thumbs load, so the focus card opens at the right shape. */
    const ratios: Record<string, number> = {};
    const learn = (src: string, w: number, h: number) => { if (w && h) ratios[src] = w / h; };
    /** Largest box with this shape that fits the screen. */
    const fit = (r: number) => {
      const maxW = Math.min(innerWidth * 0.9, 1200), maxH = innerHeight * 0.82;
      const W = Math.min(maxW, maxH * r);
      return { W, H: W / r };
    };

    /** Fills a thumb with the item's picture, or a muted looping video when the item is a video file. */
    function setThumb(thumb: HTMLElement, src: string) {
      const old = thumb.querySelector("video");
      if (isVideo(src)) {
        thumb.style.backgroundImage = "";
        if (old && old.getAttribute("src") === src) return;
        old?.remove();
        const v = document.createElement("video");
        Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: !reduce, preload: "auto" });
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.addEventListener("loadedmetadata", () => learn(src, v.videoWidth, v.videoHeight), { once: true });
        v.src = src;
        thumb.append(v);
        if (!reduce && visible) v.play().catch(() => {});
      } else {
        old?.remove();
        thumb.style.backgroundImage = `url(${src})`;
        if (!(src in ratios)) {
          const im = new Image();
          im.onload = () => learn(src, im.naturalWidth, im.naturalHeight);
          im.src = src;
        }
      }
    }
    /** Videos only play while the wall is on screen. */
    function playVideos(on: boolean) {
      if (reduce) return;
      grid.querySelectorAll("video").forEach((v) => (on ? v.play().catch(() => {}) : v.pause()));
    }

    function cell(key: string) {
      let el = cache[key];
      if (!el) {
        el = document.createElement("div");
        el.className = "pg-cell";
        el.style.padding = CFG.pad + "px";
        el.innerHTML = `<div class="pg-thumb" style="margin-bottom:${CFG.gap}px"></div><div class="pg-meta"><span></span><span></span></div>`;
        grid.append(el);
        cache[key] = el;
      }
      return el;
    }

    const pinned = (prev: number, next: number, p: Pt, o: Pt): Pt => ({ x: p.x - ((p.x - o.x) / prev) * next, y: p.y - ((p.y - o.y) / prev) * next });

    function render() {
      const ox = offset.x + mo.x + inertia.x, oy = offset.y + mo.y + inertia.y;
      const sx = Math.floor(-ox / cs) - 2, sy = Math.floor(-oy / cs) - 2, cols = Math.ceil(vp.w / cs) + 4, rows = Math.ceil(vp.h / cs) + 4;
      const active = new Set<string>();
      const maxA = ((CFG.arcMax * Math.PI) / 180) * CFG.arcAmount, R = vp.w / (2 * Math.sin(Math.max(0.001, maxA)));
      for (let y = sy; y < sy + rows; y++)
        for (let x = sx; x < sx + cols; x++) {
          const n = ITEMS.length, idx = (((x + y * 3) % n) + n) % n, key = x + "_" + y;
          active.add(key);
          const el = cell(key);
          const L = x * cs + ox, T = y * cs + oy, dx = (L + cs / 2 - vp.w / 2) / (vp.w / 2), ang = dx * maxA, z = -R * (Math.cos(ang) - 1), edge = Math.min(1, Math.abs(dx));
          el.style.left = L + "px";
          el.style.top = T + "px";
          el.style.width = el.style.height = cs + "px";
          el.style.transform = `translate3d(0,0,${z}px) rotateY(${(-ang * 180) / Math.PI}deg) scale(${1 - CFG.edgeFade * edge * edge})`;
          el.style.opacity = String(1 - 0.4 * edge * CFG.arcAmount);
          if (el.dataset.i !== String(idx)) {
            el.dataset.i = String(idx);
            const it = ITEMS[idx];
            setThumb(el.firstElementChild as HTMLElement, it.src);
            const s = el.lastElementChild!.children;
            s[0].textContent = it.title;
            s[1].textContent = it.tag.split(" ")[0];
          }
        }
      for (const k in cache) if (!active.has(k)) { cache[k].remove(); delete cache[k]; }
    }

    function tick() {
      const now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      cs += (tcs - cs) * 0.15;
      if (Math.abs(cs - tcs) < 0.05) cs = tcs;
      if (!dragging) { offset.x += (target.x - offset.x) * 0.15; offset.y += (target.y - offset.y) * 0.15; }
      if (inertiaOn) {
        const f = Math.pow(CFG.friction, dt * 60);
        vel.x *= f; vel.y *= f;
        inertia.x += vel.x * dt; inertia.y += vel.y * dt;
        if (Math.hypot(vel.x, vel.y) < 1) inertiaOn = false;
      }
      const pa = !dragging;
      mo.x += ((pa ? tmo.x : 0) - mo.x) * CFG.paEase;
      mo.y += ((pa ? tmo.y : 0) - mo.y) * CFG.paEase;
      render();
      if (visible) raf = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver((es) => {
      const v = es[0].isIntersecting;
      if (v && !visible) { visible = true; vp = { w: stage.clientWidth, h: stage.clientHeight }; lastT = performance.now(); raf = requestAnimationFrame(tick); playVideos(true); }
      else if (!v) { visible = false; cancelAnimationFrame(raf); playVideos(false); }
    });
    io.observe(stage);
    const onResize = () => { vp = { w: stage.clientWidth, h: stage.clientHeight }; };
    addEventListener("resize", onResize);
    render();

    function commit() {
      offset = { x: offset.x + inertia.x, y: offset.y + inertia.y };
      target = { ...offset };
      inertia = { x: 0, y: 0 };
      inertiaOn = false;
    }

    const onDown = (e: PointerEvent) => {
      if (focusOn) return;
      commit();
      try { stage.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      pressing = true; dragging = false;
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      vel = { x: 0, y: 0 };
      pressPos = { x: e.clientX, y: e.clientY };
      startOff = { ...offset };
      clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => {
        if (!dragging && pressing) {
          const p = { x: vp.w / 2, y: vp.h / 2 }, ns = CFG.cell * CFG.zoom;
          target = pinned(cs, ns, p, offset);
          tcs = ns;
        }
      }, CFG.pressDelay);
    };

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      spot.style.setProperty("--mx", mx + "px");
      spot.style.setProperty("--my", my + "px");
      if (!pressing) { tmo = { x: (r.width / 2 - mx) * CFG.paStrength, y: (r.height / 2 - my) * CFG.paStrength }; return; }
      const now = performance.now(), dt = Math.max(0.001, (now - last.t) / 1000);
      vel = {
        x: clamp((e.clientX - last.x) / dt, -CFG.maxSpeed, CFG.maxSpeed) * 0.6 + vel.x * 0.4,
        y: clamp((e.clientY - last.y) / dt, -CFG.maxSpeed, CFG.maxSpeed) * 0.6 + vel.y * 0.4,
      };
      last = { x: e.clientX, y: e.clientY, t: now };
      const dx = e.clientX - pressPos.x, dy = e.clientY - pressPos.y;
      if (!dragging && Math.hypot(dx, dy) > CFG.dragT) { dragging = true; stage.classList.add("dragging"); startOff = { ...offset }; }
      if (dragging) { offset = { x: startOff.x + dx, y: startOff.y + dy }; target = { ...offset }; }
    };

    const onEnd = (e: PointerEvent) => {
      if (!pressing) return;
      const was = dragging;
      pressing = false;
      clearTimeout(pressTimer);
      if (was && Math.hypot(vel.x, vel.y) >= CFG.minSpeed) inertiaOn = true;
      else { inertiaOn = false; vel = { x: 0, y: 0 }; }
      dragging = false;
      stage.classList.remove("dragging");
      target = pinned(cs, CFG.cell, { x: vp.w / 2, y: vp.h / 2 }, offset);
      tcs = CFG.cell;
      tmo = { x: 0, y: 0 };
      if (!was && e.type === "pointerup") {
        const hit = document.elementFromPoint(e.clientX, e.clientY), c = hit?.closest<HTMLElement>(".pg-cell");
        if (c) openFocus(c);
      }
    };
    const onLeave = () => { tmo = { x: 0, y: 0 }; };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onEnd);
    stage.addEventListener("pointercancel", onEnd);
    stage.addEventListener("pointerleave", onLeave);

    // focus card
    function stopType() { clearTimeout(typeT); caret.hidden = true; }
    function type(it: (typeof ITEMS)[number]) {
      stopType();
      ft.textContent = fy.textContent = fd.textContent = "";
      caret.hidden = false;
      const parts: [HTMLElement, string, number][] = [[ft, it.title, 60], [fy, it.tag, 45], [fd, it.desc, 22]];
      let pi = 0, ci = 0;
      (function step() {
        if (pi >= parts.length) { typeT = window.setTimeout(() => { caret.hidden = true; }, 400); return; }
        const p = parts[pi];
        if (ci < p[1].length) { p[0].textContent += p[1][ci++]; typeT = window.setTimeout(step, p[2] + Math.random() * 20); }
        else { pi++; ci = 0; typeT = window.setTimeout(step, 180); }
      })();
    }

    function tilt() {
      if (!tilting) return;
      rx += (trx - rx) * 0.14;
      ry += (tryY - ry) * 0.14;
      card.style.transform = `translate(-50%,-50%) perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      tiltRaf = requestAnimationFrame(tilt);
    }

    function openFocus(c: HTMLElement) {
      const it = ITEMS[+c.dataset.i!], r = c.getBoundingClientRect();
      track("wall_open", it.title);
      const { W, H } = fit(ratios[it.src] ?? 16 / 9);
      if (isVideo(it.src)) {
        fimg.hidden = true;
        fimg.removeAttribute("src");
        fvid.hidden = false;
        fvid.onloadedmetadata = () => reshape(it.src, fvid.videoWidth, fvid.videoHeight);
        fvid.src = it.src;
        fvid.setAttribute("aria-label", it.title);
        if (!reduce) fvid.play().catch(() => {});
      } else {
        fvid.hidden = true;
        fvid.pause();
        fvid.removeAttribute("src");
        fimg.hidden = false;
        fimg.onload = () => reshape(it.src, fimg.naturalWidth, fimg.naturalHeight);
        fimg.src = it.src;
        fimg.alt = it.title;
      }
      ft.textContent = fy.textContent = fd.textContent = "";
      Object.assign(card.style, { width: W + "px", height: H + "px", transition: "none", left: r.left + r.width / 2 + "px", top: r.top + r.height / 2 + "px", transform: `translate(-50%,-50%) scale(${r.width / W})`, opacity: "0" });
      void card.offsetHeight;
      card.style.transition = "left .55s cubic-bezier(.22,1,.36,1),top .55s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.34,1.25,.64,1),opacity .3s ease";
      Object.assign(card.style, { opacity: "1", left: innerWidth / 2 + "px", top: innerHeight / 2 + "px", transform: "translate(-50%,-50%) scale(1)" });
      dim.classList.add("on");
      card.classList.add("on");
      document.body.classList.add("pg-focused");
      focusOn = true; fcell = c; openY = scrollY;
      timers.push(window.setTimeout(() => {
        if (!focusOn) return;
        type(it);
        if (!reduce) { rx = ry = trx = tryY = 0; tilting = true; card.style.transition = "opacity .3s ease"; tiltRaf = requestAnimationFrame(tilt); }
      }, 620));
    }

    /** Corrects the card's shape when the frame's size was not known when it opened. */
    function reshape(src: string, w: number, h: number) {
      const known = ratios[src];
      learn(src, w, h);
      if (!focusOn || !w || !h || (known && Math.abs(known - w / h) < 0.01)) return;
      const { W, H } = fit(w / h);
      // Added to whatever is running, so an opening animation in progress is not cut short.
      if (!card.style.transition.includes("width")) card.style.transition += ",width .35s ease,height .35s ease";
      Object.assign(card.style, { width: W + "px", height: H + "px" });
    }

    function closeFocus() {
      if (!focusOn) return;
      stopType();
      tilting = false;
      cancelAnimationFrame(tiltRaf);
      const W = parseFloat(card.style.width);
      let l = innerWidth / 2, t = innerHeight / 2, s = 0.3;
      if (fcell && document.body.contains(fcell)) { const r = fcell.getBoundingClientRect(); l = r.left + r.width / 2; t = r.top + r.height / 2; s = r.width / W; }
      card.style.transition = "left .45s cubic-bezier(.22,1,.36,1),top .45s cubic-bezier(.22,1,.36,1),transform .45s cubic-bezier(.22,1,.36,1),opacity .35s ease";
      Object.assign(card.style, { left: l + "px", top: t + "px", transform: `translate(-50%,-50%) scale(${s})`, opacity: "0" });
      dim.classList.remove("on");
      document.body.classList.remove("pg-focused");
      timers.push(window.setTimeout(() => { card.classList.remove("on"); fvid.pause(); }, 450));
      focusOn = false;
      fcell = null;
    }

    const onMouse = (e: MouseEvent) => {
      if (!tilting) return;
      const r = card.getBoundingClientRect(), c = (v: number) => clamp(v, -1.4, 1.4);
      tryY = c((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 10;
      trx = -c((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 10;
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeFocus(); };
    const onScroll = () => { if (focusOn && Math.abs(scrollY - openY) > 60) closeFocus(); };

    addEventListener("mousemove", onMouse);
    addEventListener("keydown", onKey);
    addEventListener("scroll", onScroll, { passive: true });
    card.addEventListener("click", closeFocus);
    dim.addEventListener("click", closeFocus);

    return () => {
      visible = false;
      tilting = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tiltRaf);
      clearTimeout(pressTimer);
      clearTimeout(typeT);
      timers.forEach(clearTimeout);
      io.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("mousemove", onMouse);
      removeEventListener("keydown", onKey);
      removeEventListener("scroll", onScroll);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onEnd);
      stage.removeEventListener("pointercancel", onEnd);
      stage.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("click", closeFocus);
      dim.removeEventListener("click", closeFocus);
      document.body.classList.remove("pg-focused");
      for (const k in cache) cache[k].remove();
    };
  }, [ITEMS]);

  return (
    <>
      <section className="wall" id="wall" aria-label="Render wall">
        <SectionHead
          eyebrow="Render Wall"
          title="Every frame, one endless wall."
          maxWidth="14ch"
          aside={<span className="label">Drag · Throw · Click a frame</span>}
        />
        <div id="pg-stage" ref={stageRef}>
          <div id="pg-grid" ref={gridRef} />
          <div id="pg-dim" />
          <div id="pg-spotlight" ref={spotRef} />
          <div id="pg-vignette" />
          <span className="label pg-hint">Drag to explore</span>
        </div>
      </section>
      <div id="pg-focus-dim" ref={dimRef} />
      <div id="pg-focus-card" ref={cardRef}>
        {/* Plain <img>: its src is set imperatively when a frame opens. */}
        <img id="pg-focus-img" ref={imgRef} alt="" />
        <video id="pg-focus-video" ref={vidRef} muted loop playsInline hidden />
        <div className="pg-cap">
          <div className="pg-cap-head">
            <span ref={titleRef} />
            <span ref={tagRef} />
          </div>
          <div className="pg-cap-desc">
            <span ref={descRef} />
            <span ref={caretRef} className="pg-caret" hidden />
          </div>
        </div>
      </div>
    </>
  );
}
