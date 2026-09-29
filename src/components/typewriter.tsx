"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};
/** False during server render and hydration, true afterwards. */
const useMounted = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

type Props = {
  text: string;
  /** Milliseconds before the first character appears. */
  delay?: number;
  /** Base milliseconds per character; a little random jitter is added so it feels typed. */
  speed?: number;
  className?: string;
};

/**
 * Types `text` out character by character behind a caret.
 *
 * The whole text is always in the DOM: the part not typed yet is just transparent.
 * So the paragraph has its final size from the first frame (nothing below it moves),
 * words never jump between lines while typing, and search engines, screen readers
 * and no-JS visitors always get the complete text.
 */
export function Typewriter({ text, delay = 800, speed = 9, className }: Props) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]); // code points, so emoji never split
  const [count, setCount] = useState(0);
  const [caretGone, setCaretGone] = useState(false);
  const animate = mounted && !reduceMotion;

  useEffect(() => {
    if (!animate) return;
    // When each character appears (ms after start): base speed plus jitter, with a short
    // pause after punctuation. Frames catch up to this schedule, so a busy main thread
    // can't stretch the animation.
    const appearAt: number[] = [];
    let t = delay;
    for (const char of chars) {
      t += speed + Math.random() * 8;
      appearAt.push(t);
      t += /[.!?]/.test(char) ? 280 : /[,;:—–]/.test(char) ? 120 : 0;
    }

    const start = performance.now();
    let shown = 0;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = (now: number) => {
      let next = shown;
      while (next < appearAt.length && appearAt[next] <= now - start) next++;
      if (next !== shown) {
        shown = next;
        setCount(next);
      }
      if (shown < chars.length) frame = requestAnimationFrame(tick);
      else timer = setTimeout(() => setCaretGone(true), 2400);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [animate, chars, delay, speed]);

  // Nothing typed before hydration (matches the server HTML); everything with reduced motion.
  const typed = !mounted ? 0 : reduceMotion ? chars.length : count;
  const midText = typed > 0 && typed < chars.length;

  return (
    <span className={className}>
      {chars.slice(0, typed).join("")}
      {!(mounted && reduceMotion) && (
        // Empty inline span: holds the caret without adding a line-break opportunity.
        <span
          aria-hidden="true"
          data-slot="typing-caret"
          className={cn("relative transition-opacity duration-500 motion-reduce:hidden", caretGone && "opacity-0")}
        >
          <span
            className={cn(
              "absolute top-[0.12em] bottom-[0.08em] left-px w-[2px] rounded-full bg-foreground",
              !midText && "animate-caret-blink", // solid while typing, blinking while idle
            )}
          />
        </span>
      )}
      <span data-slot="typing-rest" className="text-transparent motion-reduce:text-inherit">
        {chars.slice(typed).join("")}
      </span>
    </span>
  );
}
