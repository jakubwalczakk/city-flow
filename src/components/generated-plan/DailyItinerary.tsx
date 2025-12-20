import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EventTimeline from '@/components/EventTimeline';
import type { DayPlan, TimelineItem } from '@/types';

type DailyItineraryProps = {
  days: DayPlan[];
  currency: string;
  onAddActivity?: (date: string) => void;
  onEditActivity?: (date: string, item: TimelineItem) => void;
  onDeleteActivity?: (date: string, itemId: string) => void;
};

/**
 * Displays daily itinerary with expandable days
 */
export function DailyItinerary({
  days,
  currency,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: DailyItineraryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan dzienny</CardTitle>
        <CardDescription>Rozwiń każdy dzień, aby zobaczyć spersonalizowany harmonogram</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type='single' collapsible className='w-full'>
          {days.map((day, index) => (
            <DayAccordionItem
              key={index}
              day={day}
              index={index}
              currency={currency}
              onAddActivity={onAddActivity}
              onEditActivity={onEditActivity}
              onDeleteActivity={onDeleteActivity}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

type DayAccordionItemProps = {
  day: DayPlan;
  index: number;
  currency: string;
  onAddActivity?: (date: string) => void;
  onEditActivity?: (date: string, item: TimelineItem) => void;
  onDeleteActivity?: (date: string, itemId: string) => void;
};

function DayAccordionItem({
  day,
  index,
  currency,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: DayAccordionItemProps) {
  // Calculate activity count for the day (memoized)
  const activityCount = useMemo(() => {
    return day.items.filter((i) => i.category !== 'transport' && i.category !== 'accommodation').length;
  }, [day.items]);

  const dateLabel = useMemo(() => {
    return new Date(day.date).toLocaleDateString('pl-PL', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [day.date]);

  const activityLabel = useMemo(() => {
    if (activityCount === 1) return 'aktywność';
    if (activityCount < 5) return 'aktywności';
    return 'aktywności';
  }, [activityCount]);

  return (
    <AccordionItem value={`day-${index}`}>
      <AccordionTrigger className='hover:no-underline'>
        <div className='flex items-center justify-between w-full pr-4'>
          <div className='flex items-center gap-3 text-left'>
            <div>
              <div className='font-semibold'>{dateLabel}</div>
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-xs text-muted-foreground'>
                  {activityCount} {activityLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className='pt-4 space-y-4'>
          {onAddActivity && (
            <div className='flex justify-end'>
              <Button variant='outline' size='sm' onClick={() => onAddActivity(day.date)} className='gap-2'>
                <Plus className='h-4 w-4' />
                Dodaj aktywność
              </Button>
            </div>
          )}
          <EventTimeline
            items={day.items}
            currency={currency}
            onEdit={onEditActivity ? (item) => onEditActivity(day.date, item) : undefined}
            onDelete={onDeleteActivity ? (itemId) => onDeleteActivity(day.date, itemId) : undefined}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
