import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

export class NewPlanPage {
  readonly page: Page;

  // Basic Info Step
  readonly nameInput: Locator;
  readonly destinationInput: Locator;
  readonly startDatePicker: Locator;
  readonly endDatePicker: Locator;
  readonly basicInfoNextButton: Locator;

  // Fixed Points Step
  readonly addFixedPointButton: Locator; // The initial "Add fixed point" button
  readonly saveFixedPointButton: Locator; // The "Save point" button in the form
  readonly locationInput: Locator;
  readonly fixedPointDatePicker: Locator;
  readonly fixedPointsNextButton: Locator;

  // Summary Step
  readonly createPlanButton: Locator;

  // Onboarding
  readonly onboardingSkipButton: Locator;

  // Dashboard
  readonly createNewPlanButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Basic Info
    this.nameInput = page.getByTestId('plan-name-input');
    this.destinationInput = page.getByTestId('plan-destination-input');
    this.startDatePicker = page.getByTestId('start-date-picker');
    this.endDatePicker = page.getByTestId('end-date-picker');
    this.basicInfoNextButton = page.getByTestId('basic-info-next-button');

    // Fixed Points
    this.addFixedPointButton = page.getByTestId('add-fixed-point-btn');
    this.saveFixedPointButton = page.getByTestId('save-fixed-point-btn');
    this.locationInput = page.getByTestId('fixed-point-location-input');
    this.fixedPointDatePicker = page.getByTestId('fixed-point-date-picker');
    this.fixedPointsNextButton = page.getByTestId('fixed-points-next-button');

    // Summary
    this.createPlanButton = page.getByTestId('create-plan-button');

    // Onboarding
    this.onboardingSkipButton = page.getByTestId('onboarding-skip-btn');

    // Dashboard
    this.createNewPlanButton = page.getByTestId('create-new-plan-btn');
  }

  async goto() {
    await this.page.goto('/plans');
  }

  /**
   * Handles onboarding modal if it appears.
   * Note: If test user has `onboarding_completed: true` in profile,
   * the modal won't appear and this will just wait for dashboard to load.
   */
  async handleOnboarding() {
    // Wait for dashboard to be ready
    await expect(this.createNewPlanButton).toBeVisible({ timeout: 10000 });

    // Wait for React hydration to complete
    await this.page.waitForTimeout(1000);

    // Check if onboarding modal appeared (only for users with onboarding_completed: false)
    const isOnboardingVisible = await this.onboardingSkipButton.isVisible();
    if (isOnboardingVisible) {
      await this.onboardingSkipButton.click();
      await this.onboardingSkipButton.waitFor({ state: 'hidden', timeout: 5000 });
    }
  }

  /**
   * Opens the New Plan modal by clicking the create button.
   * Waits for the modal to fully render before proceeding.
   */
  async openNewPlanModal() {
    // Ensure the button is visible and ready to click
    await expect(this.createNewPlanButton).toBeVisible();
    await expect(this.createNewPlanButton).toBeEnabled();

    // Wait for React to be fully hydrated
    await this.page.waitForLoadState('networkidle');

    // Click to open modal and wait for navigation/state changes to settle
    await Promise.all([
      this.createNewPlanButton.click(),
      // Wait for the dialog to actually appear in DOM
      this.page.waitForSelector('[role="dialog"]', { state: 'attached', timeout: 15000 }),
    ]);

    // Wait for dialog animations to complete and content to be visible
    await this.page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 5000 });

    // Wait for the form inputs to be actually visible and interactive
    await expect(this.nameInput).toBeVisible({ timeout: 10000 });
    await expect(this.nameInput).toBeEnabled({ timeout: 5000 });

    // Additional wait for any remaining animations to complete
    await this.page.waitForTimeout(500);
  }

  async fillBasicInfo(name: string, destination: string) {
    await this.nameInput.fill(name);
    await this.destinationInput.fill(destination);

    // Wait a moment for React Hook Form validation to complete
    // (validation runs onChange after fields are filled)
    await this.page.waitForTimeout(500);

    // The dates should have defaults set, proceed to next step
    await expect(this.basicInfoNextButton).toBeEnabled({ timeout: 3000 });
    await this.basicInfoNextButton.click();
  }

  async addFixedPoint(location: string) {
    // Wait for fixed points step to load
    await this.page.waitForTimeout(500);

    // Check if the "Add fixed point" button (initial big button) is visible
    const isAddButtonVisible = await this.addFixedPointButton.isVisible();
    if (isAddButtonVisible) {
      await this.addFixedPointButton.click();
    }

    // Wait for location input
    await expect(this.locationInput).toBeVisible({ timeout: 5000 });
    await this.locationInput.fill(location);

    // Date is required - click date picker
    await this.fixedPointDatePicker.click();

    // Wait for calendar to appear and select today's date
    await this.page.waitForTimeout(300);
    const todayButton = this.page.locator('.rdp-day_today');
    if (await todayButton.isVisible()) {
      await todayButton.click();
    } else {
      // If today is not visible, try clicking any available day
      const availableDay = this.page.locator('[role="gridcell"]:not([disabled]) button').first();
      await availableDay.click();
    }

    // Save fixed point
    await expect(this.saveFixedPointButton).toBeEnabled({ timeout: 3000 });
    await this.saveFixedPointButton.click();
  }

  async proceedToSummary() {
    await expect(this.fixedPointsNextButton).toBeVisible({ timeout: 5000 });
    await this.fixedPointsNextButton.click();
  }

  async submitPlan() {
    await expect(this.createPlanButton).toBeVisible({ timeout: 5000 });
    await this.createPlanButton.click();
  }
}
