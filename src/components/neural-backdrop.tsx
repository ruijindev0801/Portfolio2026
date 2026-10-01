"use client";

import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DISTANCE = 140; // px: nodes closer than this are joined by a line
const CURSOR_DISTANCE = 180; // px: nodes this close to the pointer link to it
const DENSITY = 1 / 15000; // nodes per px² of viewport
const MAX_NODES = 120;
const SPEED = 0.2; // px per frame

/**
 * Background "neural network": nodes drift slowly and connect with thin lines when they
 * get close, and nodes near the pointer link to it. One canvas fixed behind the page.
 * With reduced motion it draws a single still frame; requestAnimationFrame already
 * pauses it while the tab is hidden.
 */
export function NeuralBackdrop({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const ink = resolvedTheme === "dark" ? "255, 255, 255" : "0, 0, 0";
    const pointer = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    const spawn = (): Node => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2 * SPEED,
      vy: (Math.random() - 0.5) * 2 * SPEED,
      r: 1 + Math.random() * 1.2,
    });

    const resize = () => {
      const widthChanged = window.innerWidth !== width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Phones resize the viewport height while scrolling (URL bar); only reseed on a real width change.
      if (widthChanged) {
        const count = Math.min(MAX_NODES, Math.round(width * height * DENSITY));
        nodes = Array.from({ length: count }, spawn);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > LINK_DISTANCE) continue;
          ctx.strokeStyle = `rgba(${ink}, ${(1 - distance / LINK_DISTANCE) * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const toPointer = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (toPointer < CURSOR_DISTANCE) {
          ctx.strokeStyle = `rgba(${ink}, ${(1 - toPointer / CURSOR_DISTANCE) * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${ink}, 0.4)`;
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        // Wrap around the edges so the density stays even.
        if (node.x < -20) node.x = width + 20;
        else if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        else if (node.y > height + 20) node.y = -20;
      }
      draw();
      frame = requestAnimationFrame(step);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onPointerLeave = () => {
      pointer.x = Number.NEGATIVE_INFINITY;
      pointer.y = Number.NEGATIVE_INFINITY;
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) {
      draw();
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      frame = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduceMotion, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className={cn("pointer-events-none fixed inset-0 -z-10 size-full print:hidden", className)}
    />
  );
}
