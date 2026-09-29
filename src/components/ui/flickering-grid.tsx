"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

type Grid = {
  ctx: CanvasRenderingContext2D;
  cols: number;
  rows: number;
  squares: Float32Array;
  dpr: number;
};

/**
 * Magic UI FlickeringGrid, with a local performance rewrite of the drawing loop
 * (same props and look). Upstream repaints every square each frame and parses a
 * color string per square, which kept the main thread ~60% busy for a hero-sized
 * grid. Here only the few squares that change are redrawn, the color is set once,
 * and opacity goes through globalAlpha.
 */
export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Size the canvas, seed random opacities and paint everything once.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    const setup = () => {
      const w = width || container.clientWidth;
      const h = height || container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      setCanvasSize({ width: w, height: h });

      const cell = squareSize + gridGap;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOpacity;

      // Resizing a canvas resets its context state, so set the color after it.
      ctx.fillStyle = color;
      for (let i = 0; i < squares.length; i++) {
        ctx.globalAlpha = squares[i];
        ctx.fillRect(Math.floor(i / rows) * cell * dpr, (i % rows) * cell * dpr, squareSize * dpr, squareSize * dpr);
      }
      gridRef.current = { ctx, cols, rows, squares, dpr };
    };

    setup();
    const resizeObserver = new ResizeObserver(setup);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0,
    });
    intersectionObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [squareSize, gridGap, maxOpacity, color, width, height]);

  // Flicker loop, only while visible: re-roll a few random squares per frame.
  useEffect(() => {
    if (!isInView) return;
    let frame = 0;
    let last = performance.now();
    let carry = 0;

    const animate = (now: number) => {
      const grid = gridRef.current;
      if (grid) {
        const { ctx, rows, squares, dpr } = grid;
        const cell = (squareSize + gridGap) * dpr;
        const size = squareSize * dpr;
        // Clamp so a long pause (e.g. background tab) doesn't flicker everything at once.
        const deltaTime = Math.min((now - last) / 1000, 0.1);
        carry += squares.length * flickerChance * deltaTime;
        let changes = Math.floor(carry);
        carry -= changes;
        while (changes-- > 0) {
          const i = (Math.random() * squares.length) | 0;
          squares[i] = Math.random() * maxOpacity;
          const x = Math.floor(i / rows) * cell;
          const y = (i % rows) * cell;
          ctx.clearRect(x, y, size, size);
          ctx.globalAlpha = squares[i];
          ctx.fillRect(x, y, size, size);
        }
      }
      last = now;
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, flickerChance, maxOpacity, squareSize, gridGap]);

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)} {...props}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};
