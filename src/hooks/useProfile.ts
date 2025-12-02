import { useState, useEffect } from "react";
import type { ProfileViewModel, ProfileDto, UpdateProfileCommand } from "@/types";

/**
 * Custom hook for managing profile data and operations.
 * Handles fetching, updating, and error states for the user profile.
 */
export function useProfile() {
  const [viewModel, setViewModel] = useState<ProfileViewModel>({
    isLoading: true,
    isSaving: false,
    error: null,
    profile: null,
  });

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   * Fetches the user's profile from the API.
   */
  const fetchProfile = async () => {
    try {
      setViewModel((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch("/api/profiles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Handle 401 - redirect to login
      if (response.status === 401) {
        window.location.href = "/";
        return;
      }

      // Handle 404 - new user without profile
      if (response.status === 404) {
        setViewModel({
          isLoading: false,
          isSaving: false,
          error: null,
          profile: null,
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Nie udało się załadować profilu");
      }

      const profile: ProfileDto = await response.json();

      setViewModel({
        isLoading: false,
        isSaving: false,
        error: null,
        profile,
      });
    } catch (error) {
      setViewModel({
        isLoading: false,
        isSaving: false,
        error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
        profile: null,
      });
    }
  };

  /**
   * Updates the user's profile with new data.
   */
  const updateProfile = async (data: UpdateProfileCommand) => {
    try {
      setViewModel((prev) => ({ ...prev, isSaving: true, error: null }));

      const response = await fetch("/api/profiles", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      // Handle 401 - redirect to login
      if (response.status === 401) {
        window.location.href = "/";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nie udało się zapisać zmian");
      }

      const updatedProfile: ProfileDto = await response.json();

      setViewModel((prev) => ({
        ...prev,
        isSaving: false,
        profile: updatedProfile,
      }));
    } catch (error) {
      setViewModel((prev) => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
      }));
      throw error; // Re-throw to allow component to handle it
    }
  };

  return {
    isLoading: viewModel.isLoading,
    isSaving: viewModel.isSaving,
    error: viewModel.error,
    profile: viewModel.profile,
    updateProfile,
    refetch: fetchProfile,
  };
}
