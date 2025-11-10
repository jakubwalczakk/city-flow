import { useState, useEffect } from "react";
import type { TimelineItem, TimelineItemCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActivityFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Partial<TimelineItem>) => Promise<void>;
  initialData?: Partial<TimelineItem>;
  mode: "add" | "edit";
};

const CATEGORIES: { value: TimelineItemCategory; label: string }[] = [
  { value: "history", label: "Historia" },
  { value: "food", label: "Jedzenie" },
  { value: "sport", label: "Sport" },
  { value: "nature", label: "Natura" },
  { value: "culture", label: "Kultura" },
  { value: "transport", label: "Transport" },
  { value: "accommodation", label: "Zakwaterowanie" },
  { value: "other", label: "Inne" },
];

/**
 * Ensures time is in 24-hour format (HH:mm).
 * Converts from 12-hour format if needed.
 */
function convertTo24Hour(time12: string): string {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12; // Already in 24h format or invalid
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * A form component for adding or editing activities in a plan.
 * Displays in a modal dialog and handles validation.
 */
export default function ActivityForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    time: initialData?.time || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    estimated_price: initialData?.estimated_price || "",
    estimated_duration: initialData?.estimated_duration || "",
    category: (initialData?.category || "other") as TimelineItemCategory,
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      // Ensure time is in 24-hour format for the input
      let timeValue = initialData?.time || "";
      if (timeValue && /AM|PM/i.test(timeValue)) {
        timeValue = convertTo24Hour(timeValue);
      }

      setFormData({
        time: timeValue,
        title: initialData?.title || "",
        description: initialData?.description || "",
        location: initialData?.location || "",
        estimated_price: initialData?.estimated_price || "",
        estimated_duration: initialData?.estimated_duration || "",
        category: (initialData?.category || "other") as TimelineItemCategory,
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse duration from string (e.g., "60 min" -> 60)
      const durationMatch = formData.estimated_duration.match(/(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1], 10) : undefined;

      // Keep time in 24-hour format (no conversion needed)
      const formattedTime = formData.time || undefined;

      await onSubmit({
        time: formattedTime,
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        estimated_price: formData.estimated_price || undefined,
        estimated_duration: formData.estimated_duration || undefined,
        category: formData.category,
        // Include duration as a number for the API
        ...(duration && { duration }),
      });

      onClose();
    } catch (error) {
      console.error("Failed to submit activity:", error);
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Dodaj aktywność" : "Edytuj aktywność"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Dodaj własną aktywność do swojego planu."
              : "Zaktualizuj szczegóły tej aktywności."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Tytuł <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="np. Wizyta w lokalnej kawiarni"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Godzina</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Kategoria <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: TimelineItemCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokalizacja</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="np. Dzielnica Trastevere"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Dodaj szczegóły dotyczące tej aktywności..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Czas trwania (minuty)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.estimated_duration.replace(/\D/g, '')}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow digits
                  if (value === '' || /^\d+$/.test(value)) {
                    setFormData({
                      ...formData,
                      estimated_duration: value ? `${value} min` : '',
                    });
                  }
                }}
                placeholder="np. 60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Szacowany koszt</Label>
              <Input
                id="price"
                value={formData.estimated_price}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_price: e.target.value })
                }
                placeholder="np. 20-40 PLN"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Zapisywanie..."
                : mode === "add"
                  ? "Dodaj aktywność"
                  : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

