"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const INTERACTIVE = "a, button, [role='button'], input, textarea, select, summary, label";

/** True for mouse/trackpad users; false on touch screens and during server render. */
function useFinePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(FINE_POINTER);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}

/**
 * Mouse tracker + sparkles: a ring that follows the pointer (inverting whatever is
 * under it, so it works in both themes), a trail of twinkling four-point stars while
 * the mouse moves, and a small burst on click. The native cursor stays as it is.
 * Mouse and trackpad only; off for touch screens and "reduce motion".
 */
export function CursorEffects() {
  const finePointer = useFinePointer();
  const reduceMotion = useReducedMotion();
  if (!finePointer || reduceMotion) return null;
  return <CursorLayer />;
}

type Sparkle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  alpha: number;
  age: number;
  life: number;
};

function CursorLayer() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef("#0a0a0a");
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Pointer position; the ring trails it on a spring. Motion values skip React renders.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 420, damping: 32, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 420, damping: 32, mass: 0.5 });

  useEffect(() => {
    colorRef.current = resolvedTheme === "dark" ? "#fafafa" : "#0a0a0a";
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let dpr = 1;
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    const sparkles: Sparkle[] = [];
    let frame = 0;
    let last = 0;
    let travel = 0;
    let lastX: number | null = null;
    let lastY = 0;
    let shown = false;

    // Four-point star with concave sides: ✦
    const drawStar = (s: Sparkle, scale: number) => {
      const r = s.size * scale;
      ctx.setTransform(dpr, 0, 0, dpr, s.x * dpr, s.y * dpr);
      ctx.rotate(s.rotation);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      ctx.fill();
    };

    // Runs only while sparkles are alive, so an idle mouse costs nothing.
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = colorRef.current;
      const drag = Math.pow(0.08, dt); // velocity falls to 8% per second
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.age += dt;
        const t = s.age / s.life;
        if (t >= 1) {
          sparkles.splice(i, 1);
          continue;
        }
        s.vx *= drag;
        s.vy = s.vy * drag + 60 * dt; // a little gravity: the dust settles
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.rotation += s.spin * dt;
        ctx.globalAlpha = s.alpha * (1 - t);
        drawStar(s, Math.sin(Math.PI * Math.min(1, t * 1.6 + 0.1))); // pop in, then shrink
      }
      ctx.globalAlpha = 1;
      frame = sparkles.length ? requestAnimationFrame(tick) : 0;
    };

    const spawn = (px: number, py: number, speed: number, spread: number) => {
      if (sparkles.length >= 80) sparkles.shift();
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.4 + Math.random() * 0.6);
      sparkles.push({
        x: px + (Math.random() - 0.5) * spread,
        y: py + (Math.random() - 0.5) * spread,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 5,
        size: 4 + Math.random() * 6,
        alpha: 0.45 + Math.random() * 0.5,
        age: 0,
        life: 0.65 + Math.random() * 0.5,
      });
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      if (!shown) {
        shown = true;
        setVisible(true);
      }
      // One sparkle per ~12px of travel: a trail that thins out as the mouse slows down.
      if (lastX !== null) travel += Math.hypot(event.clientX - lastX, event.clientY - lastY);
      lastX = event.clientX;
      lastY = event.clientY;
      if (travel > 12) {
        travel = 0;
        spawn(event.clientX, event.clientY, 25, 12);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      setPressed(true);
      for (let i = 0; i < 10; i++) spawn(event.clientX, event.clientY, 170, 4);
    };
    const onPointerUp = () => setPressed(false);
    const onPointerOver = (event: PointerEvent) => {
      setHovering(event.target instanceof Element && event.target.closest(INTERACTIVE) !== null);
    };
    const onLeave = () => {
      shown = false;
      lastX = null;
      setVisible(false);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    // Switching windows (e.g. to a screenshot tool) may not fire mouseleave; hide the ring then too.
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointerover", onPointerOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[100] size-full print:hidden"
      />
      {/* White + difference blend = inverted against whatever is underneath, in either theme. */}
      <motion.div
        aria-hidden="true"
        style={{ x: ringX, y: ringY }}
        initial={false}
        animate={{ scale: pressed ? 0.8 : hovering ? 1.7 : 1, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="pointer-events-none fixed top-0 left-0 z-[101] -mt-4 -ml-4 size-8 rounded-full border border-white mix-blend-difference print:hidden"
      />
    </>
  );
}
