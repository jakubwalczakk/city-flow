import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Feedback Module component
 * Handles interactions with plan feedback (thumbs up/down and comments)
 */
export class FeedbackModule {
  readonly page: Page;
  readonly module: Locator;
  readonly thumbsUpButton: Locator;
  readonly thumbsDownButton: Locator;
  readonly commentTextarea: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.module = page.getByTestId('feedback-module');
    this.thumbsUpButton = page.getByTestId('thumbs-up');
    this.thumbsDownButton = page.getByTestId('thumbs-down');
    this.commentTextarea = page.getByTestId('feedback-comment');
    this.submitButton = page.getByTestId('submit-feedback');
    this.successMessage = page.getByTestId('feedback-success');
    this.errorMessage = page.getByTestId('feedback-error');
  }

  /**
   * Check if feedback module is visible
   */
  async isVisible(): Promise<boolean> {
    try {
      return await this.module.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Rate plan positively (thumbs up)
   */
  async ratePositive(): Promise<void> {
    await this.thumbsUpButton.click();
    // Wait for UI to update
    await this.page.waitForTimeout(300);
  }

  /**
   * Rate plan negatively (thumbs down)
   */
  async rateNegative(): Promise<void> {
    await this.thumbsDownButton.click();
    // Wait for UI to update
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if thumbs up button is active/selected
   */
  async isThumbsUpActive(): Promise<boolean> {
    const className = await this.thumbsUpButton.getAttribute('class');
    const ariaPressed = await this.thumbsUpButton.getAttribute('aria-pressed');
    return className?.includes('active') || className?.includes('selected') || ariaPressed === 'true' || false;
  }

  /**
   * Check if thumbs down button is active/selected
   */
  async isThumbsDownActive(): Promise<boolean> {
    const className = await this.thumbsDownButton.getAttribute('class');
    const ariaPressed = await this.thumbsDownButton.getAttribute('aria-pressed');
    return className?.includes('active') || className?.includes('selected') || ariaPressed === 'true' || false;
  }

  /**
   * Write a comment in the feedback textarea
   */
  async writeComment(text: string): Promise<void> {
    await this.commentTextarea.fill(text);
  }

  /**
   * Get the current comment text
   */
  async getComment(): Promise<string> {
    return await this.commentTextarea.inputValue();
  }

  /**
   * Clear the comment textarea
   */
  async clearComment(): Promise<void> {
    await this.commentTextarea.fill('');
  }

  /**
   * Submit feedback (rating and/or comment)
   */
  async submitFeedback(): Promise<void> {
    await this.submitButton.click();
    // Wait for submission to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    try {
      return (await this.successMessage.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    try {
      return (await this.errorMessage.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if success message is visible
   */
  async hasSuccessMessage(): Promise<boolean> {
    try {
      return await this.successMessage.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Check if error message is visible
   */
  async hasErrorMessage(): Promise<boolean> {
    try {
      return await this.errorMessage.isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitEnabled(): Promise<boolean> {
    try {
      return await this.submitButton.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Scroll to feedback module
   */
  async scrollIntoView(): Promise<void> {
    await this.module.scrollIntoViewIfNeeded();
  }

  /**
   * Get character count of comment (if displayed)
   */
  async getCharacterCount(): Promise<string> {
    const charCount = this.page.getByTestId('feedback-char-count');
    try {
      return (await charCount.textContent()) || '';
    } catch {
      return '';
    }
  }
}
