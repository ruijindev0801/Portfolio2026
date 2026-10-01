"use client";

import type { NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { Camera, CameraOff, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Served from this site (public/models). Everything is fetched only after the visitor presses "Turn on camera".
const MODEL_URL = "/models/pose_landmarker_lite.task";

type Delegate = "GPU" | "CPU";
type Connection = { start: number; end: number };
type Status = "idle" | "loading" | "running" | "error";
type Stats = { fps: number; ms: number; delegate: Delegate };
type Engine = { landmarker: PoseLandmarker; connections: Connection[]; delegate: Delegate };
/** Where the engine's loader script and WebAssembly binary come from (the package doesn't export this type). */
type WasmFileset = Parameters<typeof PoseLandmarker.createFromOptions>[0];

// A download fails only when it stops making progress, so slow connections still get there.
const STALL_TIMEOUT_MS = 20000;
// Some GPUs (and software WebGL) never finish starting the GPU graph instead of failing, so the GPU
// gets a deadline before we fall back to the CPU. Files are already downloaded by then: this is startup only.
const GPU_START_TIMEOUT_MS = 8000;
const CPU_START_TIMEOUT_MS = 30000;
const WARMUP_FRAMES = 10;

/** Where things went wrong, to pick the message the visitor sees. */
class DemoError extends Error {
  constructor(
    readonly stage: "camera" | "ended" | "download" | "start",
    readonly cause: unknown,
  ) {
    super(`Pose demo failed at the ${stage} stage`);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

/**
 * MediaPipe's engine: a JS loader plus a WebAssembly binary, in a SIMD build and a fallback for browsers
 * without WebAssembly SIMD. Referenced from the npm package, so the build serves them from this site in
 * exactly the installed library's version.
 */
function engineFiles(simd: boolean) {
  return simd
    ? {
        loader: new URL("@mediapipe/tasks-vision/vision_wasm_internal.js", import.meta.url).href,
        binary: new URL("@mediapipe/tasks-vision/vision_wasm_internal.wasm", import.meta.url).href,
      }
    : {
        loader: new URL("@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js", import.meta.url).href,
        binary: new URL("@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm", import.meta.url).href,
      };
}

type Progress = (received: number, total: number) => void;

/** Fetches a file as a Blob, reporting bytes as they arrive. Gives up if no data arrives for STALL_TIMEOUT_MS. */
async function download(url: string, type: string, onProgress: Progress): Promise<Blob> {
  const controller = new AbortController();
  let timer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status} for ${url}`);
    // With compression, Content-Length is the compressed size, so it is only a usable total without it.
    const total = response.headers.get("content-encoding") ? 0 : Number(response.headers.get("content-length")) || 0;
    onProgress(0, total);
    const reader = response.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      clearTimeout(timer);
      timer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
      onProgress(received, total);
    }
    return new Blob(chunks, { type });
  } finally {
    clearTimeout(timer);
  }
}

// MediaPipe's engine prints routine status (graph started, GL version, delegate info) at log, warning and
// even error level. Its loader takes print hooks from `self.Module` and reads warnings through a global
// `dbg`, so routine lines go to console.debug (hidden in DevTools by default) and anything else keeps its level.
const ROUTINE_LOG = /^(?:[IW]\d{4} |INFO: |Graph (?:successfully started running|finished closing successfully)\.)/;
type EngineGlobals = typeof globalThis & { Module?: object; dbg?: (text: string) => void };

function routeEngineLogs() {
  const route = (fallback: (text: string) => void) => (text: string) =>
    ROUTINE_LOG.test(text) ? console.debug(text) : fallback(text);
  const scope = globalThis as EngineGlobals;
  // Read and cleared by every create call, so it is set again before each one.
  scope.Module = { print: route((t) => console.log(t)), printErr: route((t) => console.error(t)) };
  scope.dbg ??= route((t) => console.warn(t));
}

/** Downloads the engine and the lite pose model once, then starts on the GPU, falling back to the CPU. */
async function loadEngine(onProgress: (label: string) => void): Promise<Engine> {
  // Percent when every file's size is known, megabytes so far when one is compressed.
  const files = new Map<string, [received: number, total: number]>();
  const track =
    (key: string): Progress =>
    (received, total) => {
      files.set(key, [received, total]);
      let sum = 0;
      let size = 0;
      for (const [r, t] of files.values()) {
        sum += r;
        size = size >= 0 && t > 0 ? size + t : -1;
      }
      onProgress(size > 0 ? `${Math.floor((sum / size) * 100)}%` : `${(sum / 1e6).toFixed(1)} MB`);
    };

  let vision: typeof import("@mediapipe/tasks-vision");
  let fileset: WasmFileset;
  let model: Uint8Array;
  try {
    // The model doesn't depend on the engine build, so it starts downloading right away.
    const modelDownload = download(MODEL_URL, "application/octet-stream", track("model"));
    modelDownload.catch(() => {}); // reported by Promise.all below; this only covers an earlier failure
    vision = await import("@mediapipe/tasks-vision");
    const engine = engineFiles(await vision.FilesetResolver.isSimdSupported());
    const [loader, binary, modelBlob] = await Promise.all([
      download(engine.loader, "text/javascript", track("loader")),
      download(engine.binary, "application/wasm", track("binary")),
      modelDownload,
    ]);
    // Both start attempts load the engine from memory, so the GPU deadline never includes network time.
    fileset = { wasmLoaderPath: URL.createObjectURL(loader), wasmBinaryPath: URL.createObjectURL(binary) };
    model = new Uint8Array(await modelBlob.arrayBuffer());
  } catch (error) {
    throw new DemoError("download", error);
  }

  onProgress("");
  const { PoseLandmarker } = vision;
  const connections: Connection[] = PoseLandmarker.POSE_CONNECTIONS;
  const options = (delegate: Delegate) => ({
    // Each attempt gets its own copy of the model bytes.
    baseOptions: { modelAssetBuffer: model.slice(), delegate },
    runningMode: "VIDEO" as const,
    numPoses: 1,
  });
  try {
    routeEngineLogs();
    // GPU inference needs its own WebGL canvas, separate from the one we draw on.
    const gpu = PoseLandmarker.createFromOptions(fileset, {
      ...options("GPU"),
      canvas: document.createElement("canvas"),
    });
    try {
      return { landmarker: await withTimeout(gpu, GPU_START_TIMEOUT_MS), connections, delegate: "GPU" };
    } catch {
      // If the GPU instance shows up after the deadline, release it.
      gpu.then((late) => late.close()).catch(() => {});
      routeEngineLogs();
      const cpu = PoseLandmarker.createFromOptions(fileset, options("CPU"));
      cpu.catch(() => {}); // a late failure after the timeout below has nothing left to report
      try {
        return { landmarker: await withTimeout(cpu, CPU_START_TIMEOUT_MS), connections, delegate: "CPU" };
      } catch (error) {
        cpu.then((late) => late.close()).catch(() => {});
        throw error;
      }
    }
  } catch (error) {
    throw new DemoError("start", error);
  } finally {
    URL.revokeObjectURL(fileset.wasmLoaderPath);
    URL.revokeObjectURL(fileset.wasmBinaryPath);
  }
}

/** The sentence shown when the demo can't run, based on where it failed. Unexpected failures are logged. */
function errorMessage(error: unknown): string {
  const stage = error instanceof DemoError ? error.stage : "start";
  const cause = error instanceof DemoError ? error.cause : error;
  const name = cause instanceof DOMException ? cause.name : "";
  if (stage === "ended") return "The camera turned off. Press Try again to restart the demo.";
  if (stage === "camera") {
    if (name === "NotAllowedError" || name === "SecurityError")
      return "Camera access was blocked. Allow it in your browser's site settings to try the demo.";
    if (name === "NotFoundError" || name === "OverconstrainedError") return "No camera was found on this device.";
    if (name === "NotReadableError" || name === "AbortError")
      return "Your camera is busy in another app. Close that app and try again.";
    if (!navigator.mediaDevices?.getUserMedia) return "This browser can't open a camera for the demo.";
  }
  console.error("Pose demo failed:", cause);
  if (stage === "download") return "The model didn't finish downloading. Check your connection and try again.";
  return "The demo couldn't start on this device or browser.";
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
  // Bumped on every start and on unmount, so a start that finishes late knows it's no longer wanted.
  const sessionRef = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  // Release the camera and the model if the page unmounts mid-demo.
  useEffect(
    () => () => {
      sessionRef.current++;
      stopRef.current?.();
    },
    [],
  );

  function fail(err: unknown) {
    stopRef.current?.();
    setStats(null);
    setError(errorMessage(err));
    setStatus("error");
  }

  async function start() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!video || !canvas || !ctx) return;

    const session = ++sessionRef.current;
    const current = () => session === sessionRef.current;
    setStatus("loading");
    setLoadingText("Starting camera…");
    setError("");

    let stream: MediaStream | undefined;
    let engine: Engine | undefined;
    // Releases whatever this attempt holds; replaced by the full stop once it's running.
    const release = () => {
      for (const track of stream?.getTracks() ?? []) track.stop();
      engine?.landmarker.close();
      video.srcObject = null;
    };
    stopRef.current = release;

    try {
      // Camera first, so a blocked permission fails fast before the model downloads.
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (err) {
        throw new DemoError("camera", err);
      }
      if (!current()) return release();
      // The camera shows right away, behind the loading button, so it's clear it's on.
      video.srcObject = stream;
      await video.play();

      setLoadingText("Loading model…");
      engine = await loadEngine((label) => current() && setLoadingText(`Loading model… ${label}`.trim()));
      if (!current()) return release();
      const { landmarker, connections, delegate } = engine;

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
        // Phones change the frame shape when rotated; keep the overlay matched to it.
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const startedAt = performance.now();
        try {
          landmarker.detectForVideo(video, startedAt, (result) => {
            drawPose(ctx, result.landmarks[0], connections, color);
          });
        } catch (err) {
          fail(new DemoError("start", err));
          return;
        }
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

      stopRef.current = () => {
        cancelAnimationFrame(frame);
        release();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stopRef.current = null;
      };
      // If the camera goes away (unplugged, or turned off by the system), say so instead of freezing.
      for (const track of stream.getVideoTracks()) {
        track.addEventListener("ended", () => current() && fail(new DemoError("ended", null)));
      }
      setStatus("running");
      loop();
    } catch (err) {
      if (current()) fail(err);
      else release();
    }
  }

  function stop() {
    sessionRef.current++;
    stopRef.current?.();
    setStats(null);
    setStatus("idle");
  }

  const running = status === "running";
  const loading = status === "loading";

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
            className={cn(
              "absolute inset-0 size-full -scale-x-100 object-cover grayscale",
              running ? "opacity-50" : loading ? "opacity-30" : "opacity-0",
            )}
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 size-full -scale-x-100 object-cover text-foreground"
          />

          {!running && (
            <div className="relative flex flex-col items-center gap-5 px-6 text-center">
              {/* While loading, the camera is already showing behind the button, so the figure steps aside. */}
              {status === "idle" && <IdleFigure />}
              {status === "error" && <p className="max-w-sm text-sm text-pretty text-muted-foreground">{error}</p>}
              <Button size="lg" onClick={start} disabled={loading}>
                {loading ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Camera data-icon="inline-start" />
                )}
                {loading ? loadingText : status === "error" ? "Try again" : "Turn on camera"}
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
        {running ? "Camera on. Pose tracking is running." : loading ? "Loading the pose model." : ""}
      </p>
    </figure>
  );
}
