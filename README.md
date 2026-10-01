# Rui Jin, portfolio

Live at **[ruijin-ai-dev.vercel.app](https://ruijin-ai-dev.vercel.app)**.

The main thing here is a live pose-tracking demo that runs in the visitor's browser. It's the closest thing I can show in public to the on-device body tracking I worked on at Nex.

## The pose demo

Code: [`src/components/sections/pose-demo.tsx`](src/components/sections/pose-demo.tsx)

- **Model:** MediaPipe Pose Landmarker (lite, float16, 33 body points), served from this site (`public/models`) rather than Google's storage, which can be slow or blocked. Nothing is downloaded until someone presses "Turn on camera", and the model is fetched once even if the GPU attempt fails and the CPU takes over. A stalled load gives up after 45 seconds with a "try again" message instead of spinning forever.
- **Privacy:** frames go from the `<video>` element straight into the model. No video leaves the device.
- **GPU first, CPU fallback:** it starts on the GPU (WebGL) and falls back to the CPU (WASM with XNNPACK). Some GPUs and software renderers hang instead of throwing, so the GPU gets an 8-second deadline. A GPU instance that shows up after the deadline is closed.
- **Frame pacing:** the model only runs when the camera has produced a new frame, not on every animation frame.
- **Honest numbers:** the fps / ms readout skips the first 10 frames, because they include one-time warm-up (shader compile, allocation) and would make the averages look worse than they are.
- **Drawing:** the skeleton is drawn on a 2D canvas in the video's pixel space and mirrored with CSS, like a selfie camera. Face points are skipped because they blur into a blob at this size.

## Stack

Next.js 16 (static export), React 19, TypeScript, Tailwind CSS 4, shadcn/ui and Motion. Deployed on Vercel.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/
npm run resume   # rebuild the resume PDF (needs Chrome or Edge)
npm run lint     # Biome
```

Node.js 24 is required.

## Content

Everything on the page comes from [`data/info.json`](data/info.json), which is type-checked against [`src/lib/types.ts`](src/lib/types.ts) at build time. The resume PDF in `public/` is generated from the same file by [`scripts/resume.mjs`](scripts/resume.mjs), so the site and the resume never disagree.

## Contact: ruijin.developer@gmail.com
