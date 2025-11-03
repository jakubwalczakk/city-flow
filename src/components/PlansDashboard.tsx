import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlans } from "@/hooks/usePlans";
import type { PlansDashboardViewModel } from "@/types";
import { PlanList } from "@/components/PlanList";
import { PaginationControls } from "@/components/PaginationControls";

/**
 * Main dashboard component for displaying user's travel plans.
 * Manages tabs (My Plans / History), pagination, and plan data fetching.
 */
export const PlansDashboard = () => {
  const [activeTab, setActiveTab] = useState<PlansDashboardViewModel["activeTab"]>("my-plans");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const limit = 12;
  const offset = (currentPage - 1) * limit;

  // Determine status filter based on active tab (memoized to prevent infinite re-renders)
  const status = useMemo<("draft" | "generated" | "archived")[]>(
    () => (activeTab === "my-plans" ? ["draft", "generated"] : ["archived"]),
    [activeTab]
  );

  // Fetch plans using custom hook
  const { data, isLoading, error } = usePlans({
    status,
    limit,
    offset,
    sortBy: "created_at",
    order: "desc",
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as PlansDashboardViewModel["activeTab"]);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle navigation to create new plan
  const handleCreatePlan = () => {
    window.location.href = "/plans/new";
  };

  const plans = data?.data ?? [];
  const pagination = data?.pagination;
  const showPagination = pagination && pagination.total > limit;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Moje Plany</h1>
        <Button onClick={handleCreatePlan} className="w-full sm:w-auto">
          + Utwórz nowy plan
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-plans">Moje Plany</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>

        {/* My Plans Tab */}
        <TabsContent value="my-plans">
          <PlanList plans={plans} isLoading={isLoading} error={error} />
          {showPagination && (
            <div className="mt-8">
              <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <PlanList plans={plans} isLoading={isLoading} error={error} />
          {showPagination && (
            <div className="mt-8">
              <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

