import type { PlanDetailsDto, GeneratedContentViewModel, DayPlan } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EventTimeline from "@/components/EventTimeline";
import FeedbackModule from "@/components/FeedbackModule";

type GeneratedPlanViewProps = {
  plan: PlanDetailsDto;
};

/**
 * Parses the generated_content JSON into a structured view model.
 */
function parseGeneratedContent(content: unknown): GeneratedContentViewModel | null {
  if (!content || typeof content !== "object") {
    return null;
  }

  try {
    const data = content as any;
    
    // Validate structure
    if (!data.days || !Array.isArray(data.days)) {
      return null;
    }

    return {
      days: data.days as DayPlan[],
      summary: data.summary || "",
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
      {generatedContent.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Trip Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {generatedContent.summary}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daily Itinerary</CardTitle>
          <CardDescription>
            Expand each day to see your personalized schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {generatedContent.days.map((day, index) => (
              <AccordionItem key={index} value={`day-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{day.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">
                    <EventTimeline events={day.events} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Feedback module */}
      <FeedbackModule planId={plan.id} />
    </div>
  );
}

