import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fixedPointSchema } from "@/lib/schemas/plan.schema";
import type { CreateFixedPointCommand } from "@/types";
import { Trash2, Plus, MapPin, Clock, Pencil } from "lucide-react";

interface FixedPointsStepProps {
  fixedPoints: CreateFixedPointCommand[];
  addFixedPoint: (point: CreateFixedPointCommand) => void;
  removeFixedPoint: (index: number) => void;
  updateFixedPoint: (index: number, point: CreateFixedPointCommand) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  onSave: () => Promise<void>;
}

export function FixedPointsStep({
  fixedPoints,
  addFixedPoint,
  removeFixedPoint,
  updateFixedPoint,
  goToNextStep,
  goToPrevStep,
  onCancel,
  isLoading,
  error,
  onSave,
}: FixedPointsStepProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentPoint, setCurrentPoint] = useState<CreateFixedPointCommand>({
    location: "",
    event_at: "",
    event_duration: null,
    description: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndGetPoint = () => {
    const pointToValidate = {
      ...currentPoint,
      event_at: currentPoint.event_at
        ? new Date(currentPoint.event_at).toISOString()
        : "",
    };
    fixedPointSchema.parse(pointToValidate);
    return pointToValidate;
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error && "errors" in error) {
      const zodError = error as any;
      const newErrors: Record<string, string> = {};
      zodError.errors.forEach((err: any) => {
        const path = err.path[0];
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  const resetForm = () => {
    setCurrentPoint({
      location: "",
      event_at: "",
      event_duration: null,
      description: null,
    });
    setErrors({});
    setIsAdding(false);
    setEditingIndex(null);
  };

  const handleAddPoint = () => {
    try {
      const pointToAdd = validateAndGetPoint();
      addFixedPoint(pointToAdd);
      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdatePoint = () => {
    if (editingIndex === null) return;
    try {
      const pointToUpdate = validateAndGetPoint();
      updateFixedPoint(editingIndex, pointToUpdate);
      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  const handleEditClick = (index: number) => {
    const point = fixedPoints[index];
    setEditingIndex(index);
    setIsAdding(false);
    setCurrentPoint({
      ...point,
      event_at: point.event_at
        ? new Date(point.event_at).toISOString().slice(0, 16)
        : "",
    });
    setErrors({});
  };

  const handleAddClick = () => {
    resetForm();
    setIsAdding(true);
  };

  const isFormValid = () => {
    try {
      validateAndGetPoint();
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

  const renderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isAdding ? "Add Fixed Point" : "Edit Fixed Point"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            placeholder="e.g., Charles de Gaulle Airport"
            value={currentPoint.location}
            onChange={(e) =>
              setCurrentPoint({ ...currentPoint, location: e.target.value })
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
              value={currentPoint.event_at}
              onChange={(e) =>
                setCurrentPoint({ ...currentPoint, event_at: e.target.value })
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
              value={currentPoint.event_duration ?? ""}
              onChange={(e) =>
                setCurrentPoint({
                  ...currentPoint,
                  event_duration: e.target.value
                    ? parseInt(e.target.value, 10)
                    : null,
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
            value={currentPoint.description || ""}
            onChange={(e) =>
              setCurrentPoint({
                ...currentPoint,
                description: e.target.value || null,
              })
            }
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={isAdding ? handleAddPoint : handleUpdatePoint}
            disabled={!isFormValid()}
            className="flex-1"
          >
            {isAdding ? "Add Point" : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          {fixedPoints.map((point, index) =>
            editingIndex === index ? (
              <div key={index}>{renderForm()}</div>
            ) : (
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
                        {point.event_duration && (
                          <>
                            <span>•</span>
                            <span>{point.event_duration} minutes</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(index)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFixedPoint(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Add new fixed point form */}
      {isAdding ? (
        renderForm()
      ) : (
        <Button
          variant="outline"
          onClick={handleAddClick}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Fixed Point
        </Button>
      )}

      {error && (
        <p className="text-sm text-destructive text-center my-2">{error}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={goToPrevStep}>
          Back
        </Button>
        <div>
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isLoading || isAdding || editingIndex !== null}
            className="mr-2"
          >
            {isLoading ? "Saving..." : "Save as draft"}
          </Button>
          <Button onClick={goToNextStep}>Next</Button>
        </div>
      </div>
    </div>
  );
}

