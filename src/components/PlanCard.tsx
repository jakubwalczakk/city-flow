import type { PlanListItemDto, PlanStatus } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Props for the PlanCard component.
 */
type PlanCardProps = {
  plan: PlanListItemDto;
  onClick: () => void;
};

/**
 * Map plan status to human-readable label and badge variant.
 */
const statusConfig: Record<
  PlanStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "Szkic", variant: "secondary" },
  generated: { label: "Wygenerowany", variant: "default" },
  archived: { label: "Zarchiwizowany", variant: "outline" },
};

/**
 * Format datetime string to human-readable format with date and time.
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Component displaying a summary card for a single plan.
 * The entire card is clickable and navigates to the plan details page.
 */
export const PlanCard = ({ plan, onClick }: PlanCardProps) => {
  const statusInfo = statusConfig[plan.status];

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View plan: ${plan.name}`}
    >
      <CardHeader>
        <CardTitle className="line-clamp-1">{plan.name}</CardTitle>
        <CardDescription className="line-clamp-1">{plan.destination}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Data rozpoczęcia:</span>
            <span className="font-medium">{formatDateTime(plan.start_date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Data zakończenia:</span>
            <span className="font-medium">{formatDateTime(plan.end_date)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </CardFooter>
    </Card>
  );
};

