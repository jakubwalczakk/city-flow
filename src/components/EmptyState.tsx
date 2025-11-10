import { Button } from "@/components/ui/button";

/**
 * Component displayed when user has no plans.
 * Encourages the user to create their first plan.
 */
type EmptyStateProps = {
  onCreatePlan?: () => void;
};

export const EmptyState = ({ onCreatePlan }: EmptyStateProps) => {
  const handleCreatePlan = () => {
    if (onCreatePlan) {
      onCreatePlan();
    } else {
      // Fallback to navigation if no callback provided
      window.location.href = "/plans/new";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-6 text-center">
      {/* Icon */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-10 w-10 text-muted-foreground"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
          />
        </svg>
      </div>

      {/* Heading */}
      <h3 className="mb-2 text-lg font-semibold">Nie masz jeszcze żadnych planów</h3>

      {/* Description */}
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Zacznij planować swoją przygodę! Utwórz swój pierwszy plan podróży i pozwól nam pomóc Ci w
        organizacji niezapomnianego wypadu.
      </p>

      {/* CTA Button */}
      <Button onClick={handleCreatePlan}>Utwórz swój pierwszy plan</Button>
    </div>
  );
};

