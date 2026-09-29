import { BlurFade } from "@/components/ui/blur-fade";

export function About({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-prose space-y-4 text-pretty text-foreground/90">
      {paragraphs.map((text, i) => (
        <BlurFade key={text} inView direction="up" delay={0.05 * i}>
          <p>{text}</p>
        </BlurFade>
      ))}
    </div>
  );
}
