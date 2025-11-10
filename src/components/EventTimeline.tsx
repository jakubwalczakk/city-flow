import type { TimelineItem, TimelineItemCategory } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

type EventTimelineProps = {
  items: TimelineItem[];
  onEdit?: (item: TimelineItem) => void;
  onDelete?: (itemId: string) => void;
};

/**
 * Returns the appropriate icon for an item category.
 */
function getCategoryIcon(category: TimelineItemCategory) {
  const iconClass = "h-3 w-3";
  switch (category) {
    case "history":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
          <path d="M8.5 4.75a.75.75 0 0 0-1.5 0V7.5h.75A2.75 2.75 0 0 0 10.5 4.75h-2Z" />
          <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm0-1.5A5.5 5.5 0 1 0 8 2.5a5.5 5.5 0 0 0 0 11Z" clipRule="evenodd" />
        </svg>
      );
    case "food":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
          <path d="M6.75 1A5.25 5.25 0 0 0 1.5 6.25v.278A4.473 4.473 0 0 0 5.027 10H11a4.5 4.5 0 0 0 4.243-6.027A5.233 5.233 0 0 0 11.5 1h-2.125A5.232 5.232 0 0 0 6.75 1ZM11 8.5H5.027A3.001 3.001 0 0 1 2.96 6.64l.01-.016a3.75 3.75 0 0 1 3.78-3.624h.125a3.75 3.75 0 0 1 3.625 2.875H11A3.001 3.001 0 0 1 11 8.5Zm-1.5 2.25a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" />
          <path d="M8.5 12.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
        </svg>
      );
    case "sport":
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
                <path d="M8.5 2.25a.75.75 0 0 0-1.5 0v3.835a2.25 2.25 0 0 0-1.331 2.058 2.5 2.5 0 0 0 4.162 1.852l.004-.003.876.876a.75.75 0 0 0 1.06-1.06l-.875-.875a2.5 2.5 0 0 0-1.853-4.162A2.25 2.25 0 0 0 8.5 6.085V2.25Z" />
                <path d="M3.75 9.5a4.5 4.5 0 0 1 4.25-4.475v.016a3.75 3.75 0 0 1 3.484 3.484h.016a4.5 4.5 0 0 1-7.75 1.01V9.5Z" />
            </svg>
        );
    case "nature":
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
                <path fillRule="evenodd" d="M8.455.516a.75.75 0 0 0-.91 0l-6.25 4.5a.75.75 0 0 0 .41 1.348h.295v5.386A2.25 2.25 0 0 0 4.25 14h7.5a2.25 2.25 0 0 0 2.25-2.25V6.364h.295a.75.75 0 0 0 .41-1.348l-6.25-4.5ZM9.5 8.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
            </svg>
        );
    case "culture":
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
                <path fillRule="evenodd" d="M5.5 1a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5ZM4 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5ZM2.5 5a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11ZM1 7.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5Zm-.5 2a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1H.5Z" clipRule="evenodd" />
                <path d="M2.5 11a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5Zm11 0a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5Z" />
            </svg>
        );
    case "transport":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    case "accommodation":
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
                <path d="M3.5 1.75a.75.75 0 0 0-1.5 0V10a.75.75 0 0 0 .75.75h10.5a.75.75 0 0 0 .75-.75V1.75a.75.75 0 0 0-1.5 0V3h-2.25V1.75a.75.75 0 0 0-1.5 0V3H6.25V1.75a.75.75 0 0 0-1.5 0V3H3.5V1.75Z" />
                <path d="M2.5 12.25a.75.75 0 0 0-1.5 0v.25a.75.75 0 0 0 .75.75h11.5a.75.75 0 0 0 .75-.75v-.25a.75.75 0 0 0-1.5 0v.25H2.5v-.25Z" />
            </svg>
        );
    case "other":
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
                <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
        );
  }
}

/**
 * Returns a human-readable label for an item category.
 */
function getCategoryLabel(category: TimelineItemCategory) {
  const labels: Record<TimelineItemCategory, string> = {
    history: "Historia",
    food: "Jedzenie",
    sport: "Sport",
    nature: "Natura",
    culture: "Kultura",
    transport: "Transport",
    accommodation: "Zakwaterowanie",
    other: "Inne",
  };
  return labels[category] || "Inne";
}

/**
 * Displays a timeline of items for a single day.
 * Shows time, title, description, location, type, and optional estimated cost/duration for each item.
 */
export default function EventTimeline({ items, onEdit, onDelete }: EventTimelineProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TimelineItem | null>(null);

  const handleDeleteClick = (item: TimelineItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete.id);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Brak zaplanowanych aktywności na ten dzień.
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pl-8 pb-4">
      {/* Timeline vertical line */}
      <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-border" />

      {items.map((item) => (
        <div key={item.id} className="relative">
          {/* Timeline dot */}
          <div className="absolute -left-[29px] top-1.5 flex h-4 w-4 items-center justify-center">
            <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
          </div>

          {/* Item card */}
          <div className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {/* Time badge */}
                  {item.time && (
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
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
                      {item.time}
                    </div>
                  )}

                  {/* Category badge */}
                  <Badge variant="outline" className="inline-flex items-center gap-1.5">
                    {getCategoryIcon(item.category)}
                    {getCategoryLabel(item.category)}
                  </Badge>

                  {/* Duration badge */}
                  {item.estimated_duration && (
                    <Badge variant="secondary" className="text-xs">
                      {item.estimated_duration}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-semibold text-base">{item.title}</h4>

                {/* Location */}
                {item.location && (
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <svg
                      className="h-4 w-4 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{item.location}</span>
                  </div>
                )}

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground border-l-2 border-primary/50">
                    <span className="font-medium">Notatka:</span> {item.notes}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex items-start gap-2">
                {/* Estimated cost */}
                {item.estimated_price && (
                  <div className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
                    {item.estimated_price}
                  </div>
                )}

                {/* Actions menu */}
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Otwórz menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edytuj
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usuń
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń aktywność</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć "{itemToDelete?.title}"? Ta akcja jest
              nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

