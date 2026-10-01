"use client";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Camera, CameraOff, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Both are fetched only after the visitor presses "Turn on camera".
// The WASM version must match the installed @mediapipe/tasks-vision package.
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
// Served from this site (public/models), so it loads from the same CDN as the page.
const MODEL_URL = "/models/pose_landmarker_lite.task";

type Delegate = "GPU" | "CPU";
type Connection = { start: number; end: number };
type Status = "idle" | "loading" | "running" | "error";
type Stats = { fps: number; ms: number; delegate: Delegate };

// Some GPUs (and software WebGL) never finish starting the GPU graph instead of failing,
// so the GPU gets a deadline before we fall back to the CPU.
const GPU_START_TIMEOUT_MS = 8000;
// Upper bound for the whole load, so a stalled download ends in "try again", not an endless spinner.
const LOAD_TIMEOUT_MS = 45000;
const WARMUP_FRAMES = 10;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms)),
  ]);
}

/** Loads the lite pose model, preferring the GPU and falling back to the CPU. */
async function createLandmarker() {
  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  const [vision, model] = await Promise.all([
    FilesetResolver.forVisionTasks(WASM_URL),
    fetch(MODEL_URL).then((response) => {
      if (!response.ok) throw new Error(`Model download failed with HTTP ${response.status}`);
      return response.arrayBuffer();
    }),
  ]);
  const connections: Connection[] = PoseLandmarker.POSE_CONNECTIONS;
  // The model is downloaded once; each attempt gets its own copy of the bytes.
  const options = (delegate: Delegate) => ({
    baseOptions: { modelAssetBuffer: new Uint8Array(model.slice(0)), delegate },
    runningMode: "VIDEO" as const,
    numPoses: 1,
  });
  // GPU inference needs its own WebGL canvas, separate from the one we draw on.
  const gpu = PoseLandmarker.createFromOptions(vision, { ...options("GPU"), canvas: document.createElement("canvas") });
  try {
    const landmarker = await withTimeout(gpu, GPU_START_TIMEOUT_MS);
    return { landmarker, connections, delegate: "GPU" as Delegate };
  } catch {
    // If the GPU instance shows up after the deadline, release it.
    gpu.then((late) => late.close()).catch(() => {});
    const landmarker = await PoseLandmarker.createFromOptions(vision, options("CPU"));
    return { landmarker, connections, delegate: "CPU" as Delegate };
  }
}

/** Draws the skeleton in the canvas's own pixel space; CSS mirrors it to match the video. */
function drawPose(
  ctx: CanvasRenderingContext2D,
  points: NormalizedLandmark[] | undefined,
  connections: Connection[],
  color: string,
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  if (!points) return;

  // Points 1–10 are eyes, ears and mouth: at this size they blur into a blob, so only the nose is kept.
  const isFace = (i: number) => i >= 1 && i <= 10;
  const visible = (p: NormalizedLandmark) => (p.visibility ?? 1) > 0.5;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, width / 180);

  ctx.beginPath();
  for (const { start, end } of connections) {
    const a = points[start];
    const b = points[end];
    if (!a || !b || isFace(start) || isFace(end) || !visible(a) || !visible(b)) continue;
    ctx.moveTo(a.x * width, a.y * height);
    ctx.lineTo(b.x * width, b.y * height);
  }
  ctx.stroke();

  const radius = Math.max(3, width / 140);
  for (const [i, p] of points.entries()) {
    if (isFace(i) || !visible(p)) continue;
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A static skeleton shown before the camera is on, drawn like the live overlay. */
function IdleFigure() {
  const joints: Record<string, [number, number]> = {
    lShoulder: [46, 50],
    rShoulder: [74, 50],
    lElbow: [34, 76],
    lWrist: [30, 102],
    rElbow: [92, 36],
    rWrist: [98, 12],
    lHip: [50, 98],
    rHip: [70, 98],
    lKnee: [46, 128],
    rKnee: [76, 126],
    lAnkle: [44, 156],
    rAnkle: [82, 154],
  };
  const bones = [
    ["lShoulder", "rShoulder"],
    ["lShoulder", "lElbow"],
    ["lElbow", "lWrist"],
    ["rShoulder", "rElbow"],
    ["rElbow", "rWrist"],
    ["lShoulder", "lHip"],
    ["rShoulder", "rHip"],
    ["lHip", "rHip"],
    ["lHip", "lKnee"],
    ["lKnee", "lAnkle"],
    ["rHip", "rKnee"],
    ["rKnee", "rAnkle"],
  ];
  return (
    <svg viewBox="0 0 120 168" className="h-40 w-auto text-muted-foreground sm:h-48" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {bones.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={joints[a][0]} y1={joints[a][1]} x2={joints[b][0]} y2={joints[b][1]} />
        ))}
      </g>
      <circle cx="60" cy="26" r="11" fill="none" stroke="currentColor" strokeWidth="2.5" />
      {Object.entries(joints).map(([name, [x, y]]) => (
        <circle key={name} cx={x} cy={y} r="3.5" fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * Live pose tracking with the visitor's camera. Everything runs in the browser:
 * frames go from <video> straight into the model, and nothing is uploaded.
 */
export function PoseDemo({ description }: { description: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  // Release the camera and the model if the page unmounts mid-demo.
  useEffect(() => () => stopRef.current?.(), []);

  async function start() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!video || !canvas || !ctx) return;

    setStatus("loading");
    setError("");
    let stream: MediaStream | undefined;
    try {
      // Camera first, so a blocked permission fails fast before the model downloads.
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      const loading = createLandmarker();
      const { landmarker, connections, delegate } = await withTimeout(loading, LOAD_TIMEOUT_MS).catch((error) => {
        // Gave up waiting: if the model still finishes loading later, release it.
        loading.then((late) => late.landmarker.close()).catch(() => {});
        throw error;
      });

      video.srcObject = stream;
      await video.play();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let frame = 0;
      let frames = 0;
      let lastVideoTime = -1;
      let lastFrameAt = performance.now();
      let lastStatsAt = 0;
      let fps = 0;
      let ms = 0;
      let color = getComputedStyle(canvas).color;

      const loop = () => {
        frame = requestAnimationFrame(loop);
        // Only run the model when the camera has produced a new frame.
        if (video.readyState < 2 || video.currentTime === lastVideoTime) return;
        lastVideoTime = video.currentTime;

        const startedAt = performance.now();
        landmarker.detectForVideo(video, startedAt, (result) => {
          drawPose(ctx, result.landmarks[0], connections, color);
        });
        const now = performance.now();
        // The first frames include one-time warm-up (shader compile, allocation); leave them out.
        if (++frames <= WARMUP_FRAMES) {
          lastFrameAt = now;
          return;
        }
        // Exponential moving averages keep the readout steady.
        ms = ms ? ms * 0.9 + (now - startedAt) * 0.1 : now - startedAt;
        fps = fps ? fps * 0.9 + (1000 / (now - lastFrameAt)) * 0.1 : 1000 / (now - lastFrameAt);
        lastFrameAt = now;
        if (now - lastStatsAt > 300) {
          lastStatsAt = now;
          color = getComputedStyle(canvas).color; // follows a theme switch
          setStats({ fps, ms, delegate });
        }
      };

      const activeStream = stream;
      stopRef.current = () => {
        cancelAnimationFrame(frame);
        for (const track of activeStream.getTracks()) track.stop();
        landmarker.close();
        video.srcObject = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stopRef.current = null;
      };
      setStatus("running");
      loop();
    } catch (err) {
      console.error("Pose demo failed to start:", err);
      if (stream) for (const track of stream.getTracks()) track.stop();
      const denied = err instanceof DOMException && err.name === "NotAllowedError";
      const slow = err instanceof Error && err.message.startsWith("Timed out");
      setError(
        denied
          ? "Camera access was blocked. Allow it in your browser's site settings to try the demo."
          : slow
            ? "The model took too long to load. Check your connection and try again."
            : "The demo couldn't start on this device or browser.",
      );
      setStatus("error");
    }
  }

  function stop() {
    stopRef.current?.();
    setStats(null);
    setStatus("idle");
  }

  const running = status === "running";

  return (
    <figure className="print:hidden">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xl shadow-black/5 dark:shadow-black/40">
        {/* Window title bar: status on the left, live numbers on the right. */}
        <div className="flex items-center justify-between gap-4 border-b px-4 py-2.5 text-xs">
          <p className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                running ? "animate-pulse bg-foreground" : "bg-muted-foreground/40",
              )}
            />
            <span className="font-medium">{running ? "Live" : "Pose tracking"}</span>
            <span className="text-muted-foreground">on-device</span>
          </p>
          <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {stats
              ? `${Math.round(stats.fps)} fps · ${stats.ms.toFixed(1)} ms · ${stats.delegate}`
              : "MediaPipe · lite"}
          </p>
        </div>

        <div className="relative grid aspect-[4/3] place-items-center bg-muted/40">
          {/* Mirrored like a selfie camera; the overlay is mirrored the same way so they line up. */}
          <video
            ref={videoRef}
            muted
            playsInline
            className={`absolute inset-0 size-full -scale-x-100 object-cover grayscale ${running ? "opacity-50" : "opacity-0"}`}
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 size-full -scale-x-100 object-cover text-foreground"
          />

          {!running && (
            <div className="relative flex flex-col items-center gap-5 px-6 text-center">
              {status === "error" ? (
                <p className="max-w-sm text-sm text-pretty text-muted-foreground">{error}</p>
              ) : (
                <IdleFigure />
              )}
              <Button size="lg" onClick={start} disabled={status === "loading"}>
                {status === "loading" ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Camera data-icon="inline-start" />
                )}
                {status === "loading" ? "Loading model…" : status === "error" ? "Try again" : "Turn on camera"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex min-h-12 items-center justify-between gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
          <p>Runs in your browser. Your camera feed stays on this device.</p>
          {running && (
            <Button size="sm" variant="outline" onClick={stop}>
              <CameraOff data-icon="inline-start" />
              Stop
            </Button>
          )}
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-pretty text-muted-foreground">{description}</figcaption>
      <p className="sr-only" aria-live="polite">
        {running ? "Camera on. Pose tracking is running." : status === "loading" ? "Loading the pose model." : ""}
      </p>
    </figure>
  );
}
