import type { PlanDetailsDto, GeneratedContentViewModel, DayPlan, TimelineItem } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EventTimeline from "@/components/EventTimeline";
import FeedbackModule from "@/components/FeedbackModule";
import { Plus } from "lucide-react";

type GeneratedPlanViewProps = {
  plan: PlanDetailsDto;
  onAddActivity?: (date: string) => void;
  onEditActivity?: (date: string, item: TimelineItem) => void;
  onDeleteActivity?: (date: string, itemId: string) => void;
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

        // For backward compatibility, provide defaults if missing
        return {
          ...item,
          category: item.category || "other",
          type: item.type || "activity", // Required by database schema
        };
      });

      return {
        ...day,
        items: processedItems,
      };
    });

    return {
      summary: data.summary || "Brak podsumowania.", // Extract summary, provide default
      currency: data.currency || "PLN", // Extract currency, default to PLN
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
export default function GeneratedPlanView({
  plan,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: GeneratedPlanViewProps) {
  const generatedContent = parseGeneratedContent(plan.generated_content);

  // If content is not available or invalid
  if (!generatedContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wygenerowany plan</CardTitle>
          <CardDescription>
            Twój plan został wygenerowany, ale format zawartości jest nieprawidłowy lub niedostępny.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Spróbuj ponownie wygenerować plan lub skontaktuj się z pomocą techniczną, jeśli problem będzie się powtarzał.
          </p>
          {plan.generated_content && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Pokaż surowe dane
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
      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie planu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{generatedContent.summary}</p>
        </CardContent>
      </Card>

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
                  Ważne przypomnienia
                </CardTitle>
                <CardDescription className="text-amber-800 dark:text-amber-200 mt-1">
                  Przejrzyj te notatki przed podróżą
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
                  Dostosowania planu
                </CardTitle>
                <CardDescription className="text-blue-800 dark:text-blue-200 mt-1">
                  Zmiany wprowadzone w celu optymalizacji planu
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
          <CardTitle>Plan dzienny</CardTitle>
          <CardDescription>
            Rozwiń każdy dzień, aby zobaczyć spersonalizowany harmonogram
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
                            {new Date(day.date).toLocaleDateString("pl-PL", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {activityCount} {activityCount === 1 ? "aktywność" : activityCount < 5 ? "aktywności" : "aktywności"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-4">
                      {onAddActivity && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddActivity(day.date)}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Dodaj aktywność
                          </Button>
                        </div>
                      )}
                      <EventTimeline
                        items={day.items}
                        currency={generatedContent.currency}
                        onEdit={
                          onEditActivity
                            ? (item) => onEditActivity(day.date, item)
                            : undefined
                        }
                        onDelete={
                          onDeleteActivity
                            ? (itemId) => onDeleteActivity(day.date, itemId)
                            : undefined
                        }
                      />
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

