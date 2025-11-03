import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fixedPointSchema } from "@/lib/schemas/plan.schema";
import type { CreateFixedPointCommand } from "@/types";
import { Trash2, Plus, MapPin, Clock } from "lucide-react";

interface FixedPointsStepProps {
  fixedPoints: CreateFixedPointCommand[];
  addFixedPoint: (point: CreateFixedPointCommand) => void;
  removeFixedPoint: (index: number) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}

export function FixedPointsStep({
  fixedPoints,
  addFixedPoint,
  removeFixedPoint,
  goToNextStep,
  goToPrevStep,
}: FixedPointsStepProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newPoint, setNewPoint] = useState<CreateFixedPointCommand>({
    location: "",
    event_at: "",
    event_duration: 60,
    description: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddPoint = () => {
    try {
      // Convert datetime-local to ISO 8601 string
      const pointToAdd = {
        ...newPoint,
        event_at: newPoint.event_at
          ? new Date(newPoint.event_at).toISOString()
          : newPoint.event_at,
      };
      
      fixedPointSchema.parse(pointToAdd);
      addFixedPoint(pointToAdd);
      setNewPoint({
        location: "",
        event_at: "",
        event_duration: 60,
        description: null,
      });
      setErrors({});
      setIsAdding(false);
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as any;
        const newErrors: Record<string, string> = {};
        zodError.errors.forEach((err: any) => {
          const path = err.path[0];
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const isFormValid = () => {
    try {
      // Convert datetime-local to ISO 8601 string for validation
      const pointToValidate = {
        ...newPoint,
        event_at: newPoint.event_at
          ? new Date(newPoint.event_at).toISOString()
          : newPoint.event_at,
      };
      fixedPointSchema.parse(pointToValidate);
      return true;
    } catch {
      return false;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateTimeString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Fixed Points</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add any fixed commitments like flights, hotel check-ins, or event
          tickets. These will be locked in your itinerary.
        </p>
      </div>

      {/* List of existing fixed points */}
      {fixedPoints.length > 0 && (
        <div className="space-y-3">
          {fixedPoints.map((point, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{point.location}</p>
                        {point.description && (
                          <p className="text-sm text-muted-foreground">
                            {point.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDateTime(point.event_at)}</span>
                      <span>•</span>
                      <span>{point.event_duration} minutes</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFixedPoint(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new fixed point form */}
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Fixed Point</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Charles de Gaulle Airport"
                value={newPoint.location}
                onChange={(e) =>
                  setNewPoint({ ...newPoint, location: e.target.value })
                }
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_at">
                  Date & Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event_at"
                  type="datetime-local"
                  value={newPoint.event_at}
                  onChange={(e) =>
                    setNewPoint({ ...newPoint, event_at: e.target.value })
                  }
                  className={errors.event_at ? "border-destructive" : ""}
                />
                {errors.event_at && (
                  <p className="text-sm text-destructive">{errors.event_at}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_duration">Duration (minutes)</Label>
                <Input
                  id="event_duration"
                  type="number"
                  min="0"
                  value={newPoint.event_duration}
                  onChange={(e) =>
                    setNewPoint({
                      ...newPoint,
                      event_duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className={errors.event_duration ? "border-destructive" : ""}
                />
                {errors.event_duration && (
                  <p className="text-sm text-destructive">
                    {errors.event_duration}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g., Flight arrival, hotel check-in"
                value={newPoint.description || ""}
                onChange={(e) =>
                  setNewPoint({
                    ...newPoint,
                    description: e.target.value || null,
                  })
                }
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddPoint}
                disabled={!isFormValid()}
                className="flex-1"
              >
                Add Point
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setErrors({});
                  setNewPoint({
                    location: "",
                    event_at: "",
                    event_duration: 60,
                    description: null,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Fixed Point
        </Button>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPrevStep}>
          Back
        </Button>
        <Button onClick={goToNextStep}>Next</Button>
      </div>
    </div>
  );
}

