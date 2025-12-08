import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { fixedPointSchema } from '@/lib/schemas/plan.schema';
import type { CreateFixedPointCommand } from '@/types';
import { Trash2, Plus, MapPin, Clock, Pencil } from 'lucide-react';
import { ZodError } from 'zod';

type FixedPointsStepProps = {
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
};

export function FixedPointsStep({
  fixedPoints,
  addFixedPoint,
  removeFixedPoint,
  updateFixedPoint,
  goToNextStep,
  goToPrevStep,
  onCancel: _onCancel, // eslint-disable-line @typescript-eslint/no-unused-vars
  isLoading,
  error,
  onSave,
}: FixedPointsStepProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentPoint, setCurrentPoint] = useState<CreateFixedPointCommand>({
    location: '',
    event_at: '',
    event_duration: null,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helpers for date/time handling
  const getEventDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    return new Date(dateStr);
  };

  const getEventTime = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const current = currentPoint.event_at ? new Date(currentPoint.event_at) : new Date();
    // If new date, keep current time or default to 12:00
    const hours = currentPoint.event_at ? current.getHours() : 12;
    const minutes = currentPoint.event_at ? current.getMinutes() : 0;

    date.setHours(hours);
    date.setMinutes(minutes);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');

    setCurrentPoint({ ...currentPoint, event_at: `${year}-${month}-${day}T${h}:${m}` });
  };

  const handleTimeChange = (timeStr: string) => {
    if (!timeStr) return;
    const [hours, minutes] = timeStr.split(':').map(Number);

    // If no date selected yet, use today
    const date = currentPoint.event_at ? new Date(currentPoint.event_at) : new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');

    setCurrentPoint({ ...currentPoint, event_at: `${year}-${month}-${day}T${h}:${m}` });
  };

  const validateAndGetPoint = () => {
    const pointToValidate = {
      ...currentPoint,
      event_at: currentPoint.event_at ? new Date(currentPoint.event_at).toISOString() : '',
    };
    fixedPointSchema.parse(pointToValidate);
    return pointToValidate;
  };

  const handleError = (error: unknown) => {
    if (error instanceof ZodError) {
      const newErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path[0];
        if (typeof path === 'string') {
          newErrors[path] = err.message;
        }
      });
      setErrors(newErrors);
    }
  };

  const resetForm = () => {
    setCurrentPoint({
      location: '',
      event_at: '',
      event_duration: null,
      description: '',
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
      event_at: point.event_at ? new Date(point.event_at).toISOString().slice(0, 16) : '',
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
      return date.toLocaleString('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: false,
      });
    } catch {
      return dateTimeString;
    }
  };

  const renderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{isAdding ? 'Dodaj stały punkt' : 'Edytuj stały punkt'}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='location'>
            Lokalizacja <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='location'
            placeholder='np. Lotnisko Chopina'
            value={currentPoint.location}
            onChange={(e) => setCurrentPoint({ ...currentPoint, location: e.target.value })}
            className={errors.location ? 'border-destructive' : ''}
          />
          {errors.location && <p className='text-sm text-destructive'>{errors.location}</p>}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='event_at'>
              Data i godzina <span className='text-destructive'>*</span>
            </Label>
            <div className='flex gap-2'>
              <div className='flex-1'>
                <DatePicker
                  date={getEventDate(currentPoint.event_at)}
                  onSelect={handleDateSelect}
                  placeholder='Wybierz datę'
                />
              </div>
              <div className='w-28'>
                <Input
                  id='event_time'
                  type='time'
                  value={getEventTime(currentPoint.event_at)}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>
            </div>
            {errors.event_at && <p className='text-sm text-destructive'>{errors.event_at}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='event_duration'>Czas trwania (minuty) - opcjonalnie</Label>
            <Input
              id='event_duration'
              type='number'
              min='0'
              value={currentPoint.event_duration || ''}
              onChange={(e) =>
                setCurrentPoint({
                  ...currentPoint,
                  event_duration: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              placeholder='np. 120'
              className={errors.event_duration ? 'border-destructive' : ''}
            />
            {errors.event_duration && <p className='text-sm text-destructive'>{errors.event_duration}</p>}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Opis (opcjonalnie)</Label>
          <Textarea
            id='description'
            placeholder='np. Przylot, zameldowanie w hotelu'
            value={currentPoint.description || ''}
            onChange={(e) =>
              setCurrentPoint({
                ...currentPoint,
                description: e.target.value || null,
              })
            }
            rows={3}
          />
        </div>

        <div className='flex gap-2'>
          <Button onClick={isAdding ? handleAddPoint : handleUpdatePoint} disabled={!isFormValid()} className='flex-1'>
            {isAdding ? 'Dodaj punkt' : 'Zapisz zmiany'}
          </Button>
          <Button variant='outline' onClick={resetForm}>
            Anuluj
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold mb-2'>Stałe punkty</h3>
        <p className='text-sm text-muted-foreground mb-4'>
          Dodaj wszelkie stałe zobowiązania, takie jak loty, zameldowania w hotelu czy bilety na wydarzenia. Będą one
          zablokowane w Twoim planie.
        </p>
      </div>

      {/* List of existing fixed points */}
      {fixedPoints.length > 0 && (
        <div className='space-y-3'>
          {fixedPoints.map((point, index) =>
            editingIndex === index ? (
              <div key={index}>{renderForm()}</div>
            ) : (
              <Card key={index}>
                <CardContent className='pt-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-start gap-2'>
                        <MapPin className='h-4 w-4 mt-1 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>{point.location}</p>
                          {point.description && <p className='text-sm text-muted-foreground'>{point.description}</p>}
                        </div>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Clock className='h-4 w-4' />
                        <span>{formatDateTime(point.event_at)}</span>
                        {point.event_duration && (
                          <>
                            <span>•</span>
                            <span>{point.event_duration} minut</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center'>
                      <Button variant='ghost' size='icon' onClick={() => handleEditClick(index)}>
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => removeFixedPoint(index)}
                        className='text-destructive hover:text-destructive'
                      >
                        <Trash2 className='h-4 w-4' />
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
        <Button variant='outline' onClick={handleAddClick} className='w-full'>
          <Plus className='mr-2 h-4 w-4' />
          Dodaj stały punkt
        </Button>
      )}

      {error && <p className='text-sm text-destructive text-center my-2'>{error}</p>}

      {/* Navigation buttons */}
      <div className='flex justify-between pt-4'>
        <Button variant='outline' onClick={goToPrevStep}>
          Wstecz
        </Button>
        <div>
          <Button
            variant='outline'
            onClick={onSave}
            disabled={isLoading || isAdding || editingIndex !== null}
            className='mr-2'
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz jako szkic'}
          </Button>
          <Button onClick={goToNextStep}>Dalej</Button>
        </div>
      </div>
    </div>
  );
}
