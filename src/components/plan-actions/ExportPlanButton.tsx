import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ExportPlanButtonProps = {
  planId: string;
  planName: string;
  className?: string;
};

/**
 * Button component for exporting a plan to PDF.
 * Handles the export process, loading states, and error handling.
 */
export default function ExportPlanButton({ planId, planName, className }: ExportPlanButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!planId) {
      return;
    }

    setIsLoading(true);

    try {
      // Make API request to export endpoint
      const response = await fetch(`/api/plans/${planId}/export?format=pdf`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      // Handle error responses
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Nie znaleziono podanego planu.');
        } else if (response.status === 500) {
          throw new Error('Wystąpił błąd po stronie serwera. Prosimy spróbować ponownie później.');
        } else {
          throw new Error(`Błąd eksportu: ${response.status}`);
        }
      }

      // Get the PDF as a blob
      const blob = await response.blob();

      // Extract filename from Content-Disposition header or use fallback
      let filename = `${planName}.pdf`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Show success message
      toast.success('Plan został pomyślnie wyeksportowany', {
        description: `Plik ${filename} został pobrany`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się wyeksportować planu.';

      // Show error toast
      toast.error('Błąd eksportu', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Button is disabled if planId is missing or export is in progress
  const isDisabled = !planId || isLoading;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline' size='sm' onClick={handleExport} disabled={isDisabled} className={className}>
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
