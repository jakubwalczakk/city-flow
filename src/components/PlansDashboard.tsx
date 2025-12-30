import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { usePlansDashboard } from '@/hooks/usePlansDashboard';
import { PlanList } from '@/components/PlanList';
import { PaginationControls } from '@/components/PaginationControls';
import NewPlanForm from './NewPlanForm';

/**
 * Main dashboard component for displaying user's travel plans.
 * Manages tabs (My Plans / History), pagination, and plan data fetching.
 */
export const PlansDashboard = () => {
  const {
    activeTab,
    isModalOpen,
    editingPlan,
    plans,
    pagination,
    isLoading,
    error,
    showPagination,
    handleTabChange,
    handlePageChange,
    handleModalClose,
    handleCreatePlan,
    handlePlanClick,
    handlePlanDelete,
    setIsModalOpen,
    setEditingPlan,
  } = usePlansDashboard();

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Moje Plany</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              className='w-full sm:w-auto'
              onClick={() => {
                setEditingPlan(null);
                setIsModalOpen(true);
              }}
              data-testid='create-new-plan-btn'
            >
              + Utwórz nowy plan
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-4xl'>
            <NewPlanForm onFinished={handleModalClose} editingPlan={editingPlan} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
        <TabsList className='mb-6 grid w-full max-w-md grid-cols-2'>
          <TabsTrigger value='my-plans'>Moje Plany</TabsTrigger>
          <TabsTrigger value='history'>Historia</TabsTrigger>
        </TabsList>

        {/* Plans Content - same for both tabs, data differs based on status filter */}
        <TabsContent value='my-plans'>
          <PlansTabContent
            plans={plans}
            isLoading={isLoading}
            error={error}
            showPagination={showPagination}
            pagination={pagination}
            onPlanClick={handlePlanClick}
            onPlanDelete={handlePlanDelete}
            onCreatePlan={handleCreatePlan}
            onPageChange={handlePageChange}
          />
        </TabsContent>

        <TabsContent value='history'>
          <PlansTabContent
            plans={plans}
            isLoading={isLoading}
            error={error}
            showPagination={showPagination}
            pagination={pagination}
            onPlanClick={handlePlanClick}
            onPlanDelete={handlePlanDelete}
            onCreatePlan={handleCreatePlan}
            onPageChange={handlePageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Extracted component to reduce duplication between tabs
type PlansTabContentProps = {
  plans: ReturnType<typeof usePlansDashboard>['plans'];
  isLoading: boolean;
  error: string | null;
  showPagination: boolean | undefined;
  pagination: ReturnType<typeof usePlansDashboard>['pagination'];
  onPlanClick: (plan: ReturnType<typeof usePlansDashboard>['plans'][0]) => void;
  onPlanDelete: (planId: string) => Promise<void>;
  onCreatePlan: () => void;
  onPageChange: (page: number) => void;
};

function PlansTabContent({
  plans,
  isLoading,
  error,
  showPagination,
  pagination,
  onPlanClick,
  onPlanDelete,
  onCreatePlan,
  onPageChange,
}: PlansTabContentProps) {
  return (
    <>
      <PlanList
        plans={plans}
        isLoading={isLoading}
        error={error}
        onPlanClick={onPlanClick}
        onPlanDelete={onPlanDelete}
        onCreatePlan={onCreatePlan}
      />
      {showPagination && pagination && (
        <div className='mt-8'>
          <PaginationControls pagination={pagination} onPageChange={onPageChange} />
        </div>
      )}
    </>
  );
}
