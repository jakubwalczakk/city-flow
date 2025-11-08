import type { PlanDetailsDto, GeneratedContentViewModel, DayPlan } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EventTimeline from "@/components/EventTimeline";
import FeedbackModule from "@/components/FeedbackModule";

type GeneratedPlanViewProps = {
  plan: PlanDetailsDto;
};

/**
 * Parses the generated_content JSON into a structured view model.
 * Validates the structure and provides default values for backward compatibility.
 */
function parseGeneratedContent(content: unknown): GeneratedContentViewModel | null {
  if (!content || typeof content !== "object") {
    return null;
  }

  try {
    const data = content as any;

    if (!data.days || !Array.isArray(data.days)) {
      console.error("Invalid content structure: 'days' array is missing or not an array.");
      return null;
    }

    // Process days and items, adding default category if missing
    const processedDays: DayPlan[] = data.days.map((day: any, dayIndex: number) => {
      if (!day.date || !day.items || !Array.isArray(day.items)) {
        throw new Error(`Day object at index ${dayIndex} is malformed.`);
      }

      const processedItems = day.items.map((item: any, itemIndex: number) => {
        if (!item.id || !item.title) {
          throw new Error(
            `Item object at index ${itemIndex} in day ${dayIndex} is missing required fields.`
          );
        }

        // For backward compatibility, provide a default 'other' category if it's missing.
        return {
          ...item,
          category: item.category || "other",
        };
      });

      return {
        ...day,
        items: processedItems,
      };
    });

    return {
      days: processedDays,
      modifications: data.modifications,
      warnings: data.warnings,
    };
  } catch (error) {
    console.error("Failed to parse generated content:", error);
    return null;
  }
}

/**
 * Displays the generated plan with daily timeline and feedback module.
 * This view is shown when the plan status is 'generated'.
 */
export default function GeneratedPlanView({ plan }: GeneratedPlanViewProps) {
  const generatedContent = parseGeneratedContent(plan.generated_content);

  // If content is not available or invalid
  if (!generatedContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Generated Plan</CardTitle>
          <CardDescription>
            Your plan has been generated, but the content format is invalid or unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please try regenerating your plan or contact support if the issue persists.
          </p>
          {plan.generated_content && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                View raw data
              </summary>
              <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(plan.generated_content, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Warning Banner */}
      {generatedContent.warnings && generatedContent.warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <CardTitle className="text-amber-900 dark:text-amber-100 text-base">
                  Important Reminders
                </CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-200 mt-1">
                  Please review these notes before your trip
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedContent.warnings.map((warning, index) => (
                <li
                  key={index}
                  className="text-sm text-amber-900 dark:text-amber-100 flex items-start gap-2"
                >
                  <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI Modifications Info */}
      {generatedContent.modifications && generatedContent.modifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader>
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                  Plan Adjustments
                </CardTitle>
                <CardDescription className="text-blue-800 dark:text-blue-200 mt-1">
                  Changes made to optimize your itinerary
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedContent.modifications.map((modification, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2"
                >
                  <span className="text-blue-600 dark:text-blue-500 mt-0.5">•</span>
                  <span>{modification}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Daily Itinerary */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Itinerary</CardTitle>
          <CardDescription>
            Expand each day to see your personalized schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {generatedContent.days.map((day, index) => {
              // Calculate activity count for the day
              const activityCount = day.items.filter(
                (i) => i.category !== "transport" && i.category !== "accommodation"
              ).length;

              return (
                <AccordionItem key={index} value={`day-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3 text-left">
                        <div>
                          <div className="font-semibold">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {activityCount} {activityCount === 1 ? "activity" : "activities"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4">
                      <EventTimeline items={day.items} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Feedback module */}
      <FeedbackModule planId={plan.id} />
    </div>
  );
}

