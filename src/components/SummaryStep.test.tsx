import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryStep } from "./SummaryStep";
import type { NewPlanViewModel } from "@/types";

// Mock date-fns format to return a predictable string
vi.mock("date-fns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("date-fns")>();
  return {
    ...actual,
    format: (date: Date, formatString: string) => {
      if (formatString === "PPP") {
        return `Formatted Date for ${date.toISOString()}`;
      }
      if (formatString === "HH:mm") {
        return `Formatted Time for ${date.toISOString()}`;
      }
      return date.toISOString();
    },
  };
});

describe("SummaryStep", () => {
  const mockFormData: NewPlanViewModel = {
    basicInfo: {
      name: "Trip to the Future",
      destination: "Future City",
      start_date: new Date("2099-01-01T12:00:00Z"),
      end_date: new Date("2099-01-05T20:00:00Z"),
      notes: "Bring a time machine.",
    },
    fixedPoints: [
      {
        location: "Time Port",
        event_at: "2099-01-01T12:00:00Z",
        event_duration: 120,
        description: "Arrival",
      },
      {
        location: "Cyber Hotel",
        event_at: "2099-01-01T14:00:00Z",
        event_duration: 45,
        description: "Check-in",
      },
    ],
  };

  const defaultProps = {
    formData: mockFormData,
    goToPrevStep: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
    error: null,
  };

  it("should render all basic information correctly", () => {
    // Act
    render(<SummaryStep {...defaultProps} />);

    // Assert
    expect(screen.getByText("Trip to the Future")).toBeInTheDocument();
    expect(screen.getByText("Future City")).toBeInTheDocument();
    expect(screen.getByText("Bring a time machine.")).toBeInTheDocument();
    // Check for mocked date formats
    expect(screen.getByText(/Formatted Date for/)).toBeInTheDocument();
    expect(screen.getByText(/Formatted Time for/)).toBeInTheDocument();
  });

  it("should render all fixed points correctly", () => {
    // Act
    render(<SummaryStep {...defaultProps} />);

    // Assert
    expect(screen.getByText("Time Port")).toBeInTheDocument();
    expect(screen.getByText("Arrival")).toBeInTheDocument();
    expect(screen.getByText("Cyber Hotel")).toBeInTheDocument();
    expect(screen.getByText("Check-in")).toBeInTheDocument();
    expect(screen.getByText("120 min")).toBeInTheDocument();
  });

  it("should display a message when there are no fixed points", () => {
    // Arrange
    const noFixedPointsData = {
      ...mockFormData,
      fixedPoints: [],
    };
    const props = { ...defaultProps, formData: noFixedPointsData };

    // Act
    render(<SummaryStep {...props} />);

    // Assert
    expect(screen.getByText(/Nie dodano stałych punktów/)).toBeInTheDocument();
  });

  it("should display a message when there are no notes", () => {
    // Arrange
    const noNotesData = {
      ...mockFormData,
      basicInfo: { ...mockFormData.basicInfo, notes: "" },
    };
    const props = { ...defaultProps, formData: noNotesData };

    // Act
    render(<SummaryStep {...props} />);

    // Assert
    expect(screen.queryByText("Notatki")).not.toBeInTheDocument();
    expect(screen.queryByText("Bring a time machine.")).not.toBeInTheDocument();
  });

  it("should display an error message if one is provided", () => {
    // Act
    render(<SummaryStep {...defaultProps} error="An error has occurred." />);

    // Assert
    expect(screen.getByText("An error has occurred.")).toBeInTheDocument();
  });

  it("should show loading state in the submit button when isLoading is true", () => {
    // Act
    render(<SummaryStep {...defaultProps} isLoading={true} />);

    // Assert
    expect(screen.getByRole("button", { name: /Tworzenie planu/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Wstecz" })).toBeDisabled();
  });
});
