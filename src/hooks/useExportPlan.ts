import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type UseExportPlanProps = {
  planId: string;
  planName: string;
};

/**
 * Custom hook for managing plan export to PDF functionality.
 * Handles API calls, blob processing, file download, and error states.
 *
 * @example
 * const { handleExport, isLoading, isDisabled } = useExportPlan({ planId, planName });
 */
export function useExportPlan({ planId, planName }: UseExportPlanProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Downloads the exported PDF from the API response.
   */
  const downloadPdf = useCallback(async (response: Response, fallbackFilename: string) => {
    const blob = await response.blob();

    // Extract filename from Content-Disposition header or use fallback
    let filename = fallbackFilename;
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Create a temporary URL for the blob and trigger download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    return filename;
  }, []);

  /**
   * Handles the export process - API call, error handling, and download.
   */
  const handleExport = useCallback(async () => {
    if (!planId) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/plans/${planId}/export?format=pdf`, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Nie znaleziono podanego planu.');
        } else if (response.status === 500) {
          throw new Error('Wystąpił błąd po stronie serwera. Prosimy spróbować ponownie później.');
        } else {
          throw new Error(`Błąd eksportu: ${response.status}`);
        }
      }

      const filename = await downloadPdf(response, `${planName}.pdf`);

      toast.success('Plan został pomyślnie wyeksportowany', {
        description: `Plik ${filename} został pobrany`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się wyeksportować planu.';
      toast.error('Błąd eksportu', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [planId, planName, downloadPdf]);

  const isDisabled = !planId || isLoading;

  return {
    handleExport,
    isLoading,
    isDisabled,
  };
}
