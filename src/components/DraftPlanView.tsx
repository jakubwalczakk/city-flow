import { useState } from "react";
import type { PlanDetailsDto, UpdatePlanCommand } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DraftPlanViewProps = {
  plan: PlanDetailsDto;
};

/**
 * Displays the draft plan view with an editable form.
 * This view is shown when the plan status is 'draft'.
 */
export default function DraftPlanView({ plan }: DraftPlanViewProps) {
  const [notes, setNotes] = useState(plan.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const command: UpdatePlanCommand = { notes };

      const response = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      setSaveMessage({ type: "success", text: "Changes saved successfully!" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save notes:", error);
      setSaveMessage({ 
        type: "error", 
        text: "Failed to save changes. Please try again." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = notes !== (plan.notes || "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Draft Plan</CardTitle>
          <CardDescription>
            This plan is in draft status. Add your notes and preferences, then generate your
            personalized itinerary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Destination</Label>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">{plan.destination}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              The destination cannot be changed after plan creation.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes" className="text-base font-medium">
                Travel Notes & Preferences
              </Label>
            </div>
            <Textarea
              id="notes"
              placeholder="Add notes about your travel style, interests, budget, dietary restrictions, or anything else that will help create your perfect itinerary..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Share your preferences to help us create a personalized travel plan. Include things
              like: Must-see attractions, food preferences, activity levels, budget considerations,
              or any special requirements.
            </p>
          </div>

          {saveMessage && (
            <div
              className={`rounded-md p-3 text-sm ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              variant="outline"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              onClick={() => {
                // TODO: Implement plan generation
                alert("Plan generation will be implemented in a future step");
              }}
              size="lg"
            >
              Generate Plan
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      {plan.start_date && plan.end_date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Travel Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(plan.start_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                -{" "}
                {new Date(plan.end_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

