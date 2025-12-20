import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { FixedPointFormItem } from '@/types';
import { useFixedPointForm } from '@/hooks/useFixedPointForm';
import { FixedPointForm } from '@/components/fixed-points/FixedPointForm';
import { FixedPointsList } from '@/components/fixed-points/FixedPointsList';

type FixedPointsStepProps = {
  fixedPoints: FixedPointFormItem[];
  addFixedPoint: (point: FixedPointFormItem) => void;
  removeFixedPoint: (index: number) => void;
  updateFixedPoint: (index: number, point: FixedPointFormItem) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  onSave: () => Promise<void>;
};

/**
 * Step component for managing fixed points in the plan
 * Uses React Hook Form for validation and state management
 */
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const {
    form,
    isAdding,
    editingIndex,
    startAdding,
    startEditing,
    resetForm,
    onSubmit,
    getDateForPicker,
    getTimeForInput,
    handleDateSelect,
    handleTimeChange,
  } = useFixedPointForm({
    onAdd: addFixedPoint,
    onUpdate: updateFixedPoint,
  });

  const dateTimeHandlers = {
    getDateForPicker,
    getTimeForInput,
    handleDateSelect,
    handleTimeChange,
  };

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
      <FixedPointsList
        points={fixedPoints}
        onEdit={(index) => startEditing(index, fixedPoints[index])}
        onRemove={removeFixedPoint}
        editingIndex={editingIndex}
      />

      {/* Show form when editing */}
      {editingIndex !== null && (
        <FixedPointForm
          form={form}
          onSubmit={onSubmit}
          onCancel={resetForm}
          isEditing={true}
          dateTimeHandlers={dateTimeHandlers}
          isDatePickerOpen={isDatePickerOpen}
          onDatePickerOpenChange={setIsDatePickerOpen}
        />
      )}

      {/* Add new fixed point form or button */}
      {isAdding ? (
        <FixedPointForm
          form={form}
          onSubmit={onSubmit}
          onCancel={resetForm}
          isEditing={false}
          dateTimeHandlers={dateTimeHandlers}
          isDatePickerOpen={isDatePickerOpen}
          onDatePickerOpenChange={setIsDatePickerOpen}
        />
      ) : (
        !editingIndex && (
          <Button variant='outline' onClick={startAdding} className='w-full' data-testid='add-fixed-point-btn'>
            <Plus className='mr-2 h-4 w-4' />
            Dodaj stały punkt
          </Button>
        )
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
          <Button onClick={goToNextStep} data-testid='fixed-points-next-button'>
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}
