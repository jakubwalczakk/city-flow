import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Onboarding Modal.
 * Handles interactions with travel pace and preferences selection.
 */
export class OnboardingModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly travelPaceSelect: Locator;
  readonly preferenceBadges: Locator;
  readonly saveButton: Locator;
  readonly skipButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('[role="dialog"]').filter({ hasText: /Witaj w CityFlow/i });
    this.travelPaceSelect = page.locator('#travel-pace');
    this.preferenceBadges = page
      .locator('[class*="cursor-pointer"]')
      .filter({ hasText: /Sztuka|Jedzenie|Natura|Historia/i });
    this.saveButton = page.getByTestId('onboarding-save-btn');
    this.skipButton = page.getByTestId('onboarding-skip-btn');
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.modal.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async selectTravelPace(pace: 'slow' | 'moderate' | 'intensive') {
    await this.travelPaceSelect.click();

    const paceLabels: Record<string, string> = {
      slow: 'Spokojne',
      moderate: 'Umiarkowane',
      intensive: 'Intensywne',
    };

    await this.page.locator(`[role="option"]`).filter({ hasText: paceLabels[pace] }).click();

    // Wait for selection to register
    await this.page.waitForTimeout(300);
  }

  async selectPreferences(preferences: string[]) {
    // Map English preference names to Polish labels
    const preferenceLabels: Record<string, string> = {
      art: 'Sztuka i Muzea',
      food: 'Lokalne Jedzenie',
      nature: 'Natura i Parki',
      history: 'Historia i Kultura',
      nightlife: 'Życie Nocne',
      shopping: 'Zakupy',
      architecture: 'Architektura',
      adventure: 'Przygoda i Sport',
    };

    for (const pref of preferences) {
      const label = preferenceLabels[pref] || pref;
      const badge = this.page.locator('[class*="cursor-pointer"]').filter({ hasText: new RegExp(label, 'i') });
      await badge.first().click();
      await this.page.waitForTimeout(200);
    }
  }

  async save() {
    await this.saveButton.click();
    // Wait for modal to close
    await this.modal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async skip() {
    await this.skipButton.click();
    // Wait for modal to close
    await this.modal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async waitForModalToDisappear() {
    await this.modal.waitFor({ state: 'hidden', timeout: 10000 });
  }
}
