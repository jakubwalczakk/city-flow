import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useExportPlan } from '@/hooks/useExportPlan';

type ExportPlanButtonProps = {
  planId: string;
  planName: string;
  className?: string;
};

/**
 * Button component for exporting a plan to PDF.
 * Uses useExportPlan hook for export logic and state management.
 */
export default function ExportPlanButton({ planId, planName, className }: ExportPlanButtonProps) {
  const { handleExport, isLoading, isDisabled } = useExportPlan({ planId, planName });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExport}
            disabled={isDisabled}
            className={className}
            data-testid='export-pdf-button'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Eksportowanie...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Eksportuj do PDF
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Pobierz plan jako plik PDF</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
