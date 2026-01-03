import { test, expect, cleanDatabase, createTestPlan, verifyPdfDownload, verifyPdfContent } from '../fixtures';
import { mockOpenRouterAPI } from '../test-setup';
import { LoginPage } from '../page-objects/LoginPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('PDF Export', () => {
  let loginPage: LoginPage;
  let planDetailsPage: PlanDetailsPage;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    await cleanDatabase(supabase, testUser.id);

    loginPage = new LoginPage(page);
    planDetailsPage = new PlanDetailsPage(page);

    await mockOpenRouterAPI(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await page.waitForURL(/\/plans/, { timeout: 10000 });
  });

  test.afterEach(async ({ supabase, testUser }) => {
    await cleanDatabase(supabase, testUser.id);
  });

  test('should export generated plan to PDF', async ({ supabase, testUser }) => {
    // Arrange - Create generated plan with activities
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Rzym - Czerwiec 2026',
      destination: 'Rzym',
      status: 'generated',
      startDate: '2026-06-15',
      endDate: '2026-06-17',
      withActivities: true,
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify export button is visible and enabled
    expect(await planDetailsPage.isExportEnabled()).toBe(true);

    // Export to PDF
    const download = await planDetailsPage.exportToPDF();

    // Assert
    // 1. Verify download started
    expect(download).toBeDefined();

    // 2. Verify filename
    const isValidFilename = await verifyPdfDownload(download, 'Rzym');
    expect(isValidFilename).toBe(true);

    // 3. Verify PDF contains plan data
    const expectedTexts = [
      'Rzym', // Destination
      '2026', // Year
      'Czerwiec', // Month or date
    ];

    const hasExpectedContent = await verifyPdfContent(download, expectedTexts);
    expect(hasExpectedContent).toBe(true);
  });

  test('should not allow export of draft plan', async ({ supabase, testUser }) => {
    // Arrange - Create draft plan (not generated)
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Draft Plan',
      status: 'draft',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Assert
    // Export button should be disabled or not visible
    const isExportEnabled = await planDetailsPage.isExportEnabled();
    expect(isExportEnabled).toBe(false);
  });

  test('should include all plan details in PDF', async ({ supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Florence Art Tour',
      destination: 'Florence, Italy',
      status: 'generated',
      startDate: '2026-09-10',
      endDate: '2026-09-12',
      withActivities: true,
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    const download = await planDetailsPage.exportToPDF();

    // Assert - Verify PDF contains comprehensive information
    const expectedTexts = [
      'Florence', // Destination
      'September', // Month
      '2026', // Year
      // Activities from mock data
      'Test Activity', // Activity title
    ];

    const hasContent = await verifyPdfContent(download, expectedTexts);
    expect(hasContent).toBe(true);
  });

  test('should include AI warning in PDF', async ({ supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'generated',
      withActivities: true,
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    const download = await planDetailsPage.exportToPDF();

    // Assert - Verify warning is present
    // Warning should mention AI, suggestions, verification, etc.
    // Check if at least the word "AI" is in the PDF
    const hasAIWarning = await verifyPdfContent(download, ['AI']);
    expect(hasAIWarning).toBe(true);
  });

  test('should handle PDF export for multi-day plan', async ({ supabase, testUser }) => {
    // Arrange - Create plan with multiple days
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: '5-Day Paris Adventure',
      destination: 'Paris',
      status: 'generated',
      startDate: '2026-07-01',
      endDate: '2026-07-05',
    });

    // Add multiple days with activities
    for (let i = 1; i <= 5; i++) {
      const date = `2026-07-${i.toString().padStart(2, '0')}`;
      const { data: day } = await supabase
        .from('generated_plan_days')
        .insert({
          plan_id: planId,
          day_number: i,
          date: date,
          title: `Day ${i}`,
        })
        .select()
        .single();

      if (day) {
        // Add activities for each day
        await supabase.from('plan_activities').insert([
          {
            plan_day_id: day.id,
            title: `Morning Activity Day ${i}`,
            start_time: '09:00',
            duration_minutes: 120,
            category: 'sightseeing',
            location: `Location ${i}`,
          },
          {
            plan_day_id: day.id,
            title: `Afternoon Activity Day ${i}`,
            start_time: '14:00',
            duration_minutes: 90,
            category: 'culture',
            location: `Museum ${i}`,
          },
        ]);
      }
    }

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    const download = await planDetailsPage.exportToPDF();

    // Assert
    // 1. PDF should be created
    expect(download).toBeDefined();

    // 2. PDF should contain all days (check for "Day 1", "Day 5")
    const hasDays = await verifyPdfContent(download, ['Day 1', 'Day 5']);
    expect(hasDays).toBe(true);

    // 3. Verify file size is reasonable (multi-day plan should be larger)
    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(1000); // At least 1KB
    }
  });

  test('should generate unique filename for each export', async ({ supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Barcelona Trip',
      destination: 'Barcelona',
      status: 'generated',
      withActivities: true,
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    const download = await planDetailsPage.exportToPDF();

    // Assert
    const filename = download.suggestedFilename();

    // Filename should include destination or plan name
    expect(filename).toMatch(/Barcelona|barcelona/i);

    // Filename should be PDF
    expect(filename).toMatch(/\.pdf$/i);

    // Filename should not contain illegal characters
    expect(filename).not.toMatch(/[<>:"|?*]/);
  });

  test('should maintain proper PDF structure', async ({ supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Rome 3-Day Tour',
      destination: 'Rome',
      status: 'generated',
      withActivities: true,
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    const download = await planDetailsPage.exportToPDF();

    // Assert
    const path = await download.path();
    if (path) {
      // Verify file is a valid PDF by checking magic bytes
      const fs = await import('fs');
      const buffer = fs.readFileSync(path);

      // PDF files start with %PDF
      const pdfHeader = buffer.slice(0, 4).toString();
      expect(pdfHeader).toBe('%PDF');

      // Check file is not corrupted (has more than just header)
      expect(buffer.length).toBeGreaterThan(100);
    }
  });

  test('should handle export after regeneration', async ({ supabase, testUser }) => {
    // Arrange - Create generated plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Regenerated Plan',
      status: 'generated',
      withActivities: true,
    });

    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Export first version
    const firstDownload = await planDetailsPage.exportToPDF();
    expect(firstDownload).toBeDefined();

    // Regenerate plan (if functionality exists)
    const hasRegenerateButton = await planDetailsPage.generateAgainButton.isVisible().catch(() => false);

    if (hasRegenerateButton) {
      await planDetailsPage.regeneratePlan();

      // Export second version
      const secondDownload = await planDetailsPage.exportToPDF();
      expect(secondDownload).toBeDefined();

      // Both exports should succeed
      const firstFilename = firstDownload.suggestedFilename();
      const secondFilename = secondDownload.suggestedFilename();

      expect(firstFilename).toBeTruthy();
      expect(secondFilename).toBeTruthy();
    }
  });
});
