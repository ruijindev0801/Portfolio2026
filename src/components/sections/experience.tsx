import { Briefcase } from "lucide-react";
import { Bullets, Entry, TechTags, TextLink } from "@/components/entry";
import { Timeline } from "@/components/timeline";
import { formatRange } from "@/lib/format";
import type { Experience } from "@/lib/types";

export function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <Timeline
      items={items.map((job) => ({
        key: `${job.company}-${job.role}-${job.start}`,
        logo: job.logo,
        icon: <Briefcase aria-hidden="true" />,
        content: (
          <Entry
            title={job.role}
            subtitle={
              <>
                {job.url ? <TextLink href={job.url}>{job.company}</TextLink> : job.company}
                {[job.location, job.type].filter(Boolean).map((part) => (
                  <span key={part}> · {part}</span>
                ))}
              </>
            }
            meta={formatRange(job.start, job.end)}
          >
            {job.summary && <p className="mt-3 text-pretty">{job.summary}</p>}
            <Bullets items={job.highlights} className="mt-3" />
            <TechTags items={job.tech} className="mt-4" />
          </Entry>
        ),
      }))}
    />
  );
}
