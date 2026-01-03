import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Profile page (/profile).
 * Handles user profile interactions including logout.
 */
export class ProfilePage {
  readonly page: Page;
  readonly userEmail: Locator;
  readonly travelPaceDisplay: Locator;
  readonly preferencesDisplay: Locator;
  readonly userMenuButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userEmail = page.locator('[class*="text-muted-foreground"]').filter({ hasText: /@/i });
    this.travelPaceDisplay = page.locator('text=/tempo|pace/i');
    this.preferencesDisplay = page.locator('text=/preferencje|preferences/i');
    this.userMenuButton = page.locator('button[class*="rounded-full"]');
    this.logoutButton = page.locator('[role="menuitem"]').filter({ hasText: /Wyloguj/i });
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async openUserMenu() {
    await this.userMenuButton.click();
    await this.logoutButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async logout() {
    // If menu is not open, open it first
    const isMenuOpen = await this.logoutButton.isVisible().catch(() => false);
    if (!isMenuOpen) {
      await this.openUserMenu();
    }

    await this.logoutButton.click();

    // Wait for redirect to home page
    await expect(this.page).toHaveURL(/\/$/, { timeout: 10000 });
  }

  async getUserEmail(): Promise<string | null> {
    try {
      return await this.userEmail.textContent();
    } catch {
      return null;
    }
  }

  async isUserMenuVisible(): Promise<boolean> {
    return await this.userMenuButton.isVisible();
  }
}
