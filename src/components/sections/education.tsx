import { GraduationCap } from "lucide-react";
import { Entry, TextLink } from "@/components/entry";
import { Timeline } from "@/components/timeline";
import { formatRange } from "@/lib/format";
import type { Education } from "@/lib/types";

export function EducationList({ items }: { items: Education[] }) {
  return (
    <Timeline
      items={items.map((school) => ({
        key: `${school.school}-${school.degree}`,
        logo: school.logo,
        icon: <GraduationCap aria-hidden="true" />,
        content: (
          <Entry
            title={school.degree}
            subtitle={
              <>
                {school.url ? <TextLink href={school.url}>{school.school}</TextLink> : school.school}
                {school.location && <span> · {school.location}</span>}
              </>
            }
            meta={formatRange(school.start, school.end)}
          >
            {school.details?.length ? (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {school.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </Entry>
        ),
      }))}
    />
  );
}
