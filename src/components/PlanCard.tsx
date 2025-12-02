import type { PlanListItemDto, PlanStatus } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

/**
 * Props for the PlanCard component.
 */
interface PlanCardProps {
  plan: PlanListItemDto;
  onClick: () => void;
  onDelete: (planId: string) => void;
}

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
export const PlanCard = ({ plan, onClick, onDelete }: PlanCardProps) => {
  const statusInfo = statusConfig[plan.status];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(plan.id);
  };

  return (
    <Card
      className="group relative cursor-pointer transition-shadow hover:shadow-lg"
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
      {/* Delete button in top right corner */}
      <div className="absolute right-2 top-2 z-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label="Usuń plan"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć ten plan?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna. Plan &quot;{plan.name}&quot; zostanie trwale usunięty.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Usuń
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CardHeader>
        <CardTitle className="line-clamp-1 pr-8">{plan.name}</CardTitle>
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
