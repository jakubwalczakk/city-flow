import type { TimelineEvent } from "@/types";

type EventTimelineProps = {
  events: TimelineEvent[];
};

/**
 * Displays a timeline of events for a single day.
 * Shows time, title, description, and optional estimated cost for each event.
 */
export default function EventTimeline({ events }: EventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No events scheduled for this day.
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pl-8 pb-4">
      {/* Timeline vertical line */}
      <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-border" />

      {events.map((event, index) => (
        <div key={index} className="relative">
          {/* Timeline dot */}
          <div className="absolute -left-[29px] top-1.5 flex h-4 w-4 items-center justify-center">
            <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
          </div>

          {/* Event card */}
          <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Time badge */}
                <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary mb-2">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {event.time}
                </div>

                {/* Title */}
                <h4 className="font-semibold text-base mb-2">{event.title}</h4>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Estimated cost */}
              {event.estimated_cost && (
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
                    {event.estimated_cost}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

