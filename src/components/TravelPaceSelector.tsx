import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRAVEL_PACE_LABELS, type TravelPace } from '@/types';

type TravelPaceSelectorProps = {
  value: TravelPace | null;
  onChange: (value: TravelPace) => void;
};

/**
 * Component for selecting travel pace from three predefined options.
 * Uses Shadcn/ui Select component for the dropdown.
 */
export function TravelPaceSelector({ value, onChange }: TravelPaceSelectorProps) {
  const paceOptions: TravelPace[] = ['slow', 'moderate', 'intensive'];

  return (
    <div className='space-y-2'>
      <Label htmlFor='travel-pace'>Tempo zwiedzania</Label>
      <Select value={value || undefined} onValueChange={(newValue) => onChange(newValue as TravelPace)}>
        <SelectTrigger id='travel-pace'>
          <SelectValue placeholder='Wybierz tempo' />
        </SelectTrigger>
        <SelectContent>
          {paceOptions.map((pace) => (
            <SelectItem key={pace} value={pace}>
              {TRAVEL_PACE_LABELS[pace]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
