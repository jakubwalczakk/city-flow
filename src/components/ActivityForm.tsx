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
  { value: "history", label: "History" },
  { value: "food", label: "Food" },
  { value: "sport", label: "Sport" },
  { value: "nature", label: "Nature" },
  { value: "culture", label: "Culture" },
  { value: "transport", label: "Transport" },
  { value: "accommodation", label: "Accommodation" },
  { value: "other", label: "Other" },
];

/**
 * Converts 24-hour time format (HH:mm) to 12-hour format with AM/PM.
 */
function convertTo12Hour(time24: string): string {
  const [hoursStr, minutes] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }
  
  return `${hours}:${minutes} ${period}`;
}

/**
 * Converts 12-hour time format with AM/PM to 24-hour format (HH:mm).
 */
function convertTo24Hour(time12: string): string {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12; // Return original if can't parse
  
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
      // Convert time from 12-hour format (with AM/PM) to 24-hour format for the input
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

      // Convert 24-hour time to 12-hour format with AM/PM if time is provided
      let formattedTime = formData.time || undefined;
      if (formattedTime) {
        formattedTime = convertTo12Hour(formattedTime);
      }

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
            {mode === "add" ? "Add Activity" : "Edit Activity"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a custom activity to your plan."
              : "Update the details of this activity."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Visit local coffee shop"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
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
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: TimelineItemCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Trastevere district"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add details about this activity..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
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
                placeholder="e.g., 60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Estimated Cost</Label>
              <Input
                id="price"
                value={formData.estimated_price}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_price: e.target.value })
                }
                placeholder="e.g., 5-10 EUR"
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "add"
                  ? "Add Activity"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

