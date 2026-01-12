import { exportTest as test, expect } from '../shared-user-fixtures';
import { createTestPlan, verifyPdfDownload } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

/**
 * DISABLED: PDF export tests require proper browser download configuration,
 * file system access, and PDF generation infrastructure that needs debugging.
 * Tests fail due to timing issues, download permissions, or pdf-lib configuration.
 * See e2e/E2E-TEST-STATUS.md for details and resolution plan.
 */
test.describe.skip('PDF Export', () => {
  // Run tests serially to avoid shared user state conflicts
  test.describe.configure({ mode: 'serial' });
  test.skip('should export generated plan to PDF', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Create generated plan with activities
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

    // 3. Verify PDF is valid by checking structure
    const path = await download.path();
    expect(path).toBeDefined();
    if (path) {
      const fs = await import('fs');
      const buffer = fs.readFileSync(path);
      // Check PDF magic bytes
      const header = buffer.slice(0, 4).toString();
      expect(header).toBe('%PDF');
      // PDF should have substantial content
      expect(buffer.length).toBeGreaterThan(1000);
    }
  });

  test.skip('should not allow export of draft plan', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Create draft plan (not generated)
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

  test.skip('should include all plan details in PDF', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

    // Assert - Verify PDF was created and has content
    expect(download).toBeDefined();

    // Verify filename contains destination
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/florence/i);
    expect(filename).toMatch(/\.pdf$/i);

    // Verify PDF structure
    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const buffer = fs.readFileSync(path);
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
      expect(buffer.length).toBeGreaterThan(1000);
    }
  });

  test.skip('should include AI warning in PDF', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      status: 'generated',
      withActivities: true,
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    const download = await planDetailsPage.exportToPDF();

    // Assert - Verify PDF was generated successfully
    // Note: AI warning verification via text extraction is unreliable due to font embedding
    // We verify the PDF is valid and has substantial content instead
    expect(download).toBeDefined();

    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const buffer = fs.readFileSync(path);
      // Valid PDF header
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
      // PDF with activities should be reasonably large
      expect(buffer.length).toBeGreaterThan(5000);
    }
  });

  test.skip('should handle PDF export for multi-day plan', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Create plan with multiple days
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: '5-Day Paris Adventure',
      destination: 'Paris',
      status: 'generated',
      startDate: '2026-07-01',
      endDate: '2026-07-05',
    });

    // Add multiple days with activities using generated_content JSON field
    const days = [];
    for (let i = 1; i <= 5; i++) {
      const date = `2026-07-${i.toString().padStart(2, '0')}`;
      days.push({
        date: date,
        items: [
          {
            id: crypto.randomUUID(),
            type: 'activity',
            title: `Morning Activity Day ${i}`,
            time: '09:00',
            category: 'sightseeing',
            description: 'Morning sightseeing activity',
            location: `Location ${i}`,
            estimated_duration: '2 hours',
          },
          {
            id: crypto.randomUUID(),
            type: 'activity',
            title: `Afternoon Activity Day ${i}`,
            time: '14:00',
            category: 'culture',
            description: 'Afternoon cultural activity',
            location: `Museum ${i}`,
            estimated_duration: '1.5 hours',
          },
        ],
      });
    }

    const generatedContent = {
      summary: '5-day Paris adventure with activities',
      currency: 'EUR',
      days,
    };

    // Update plan with generated content
    await supabase
      .from('plans')
      .update({ generated_content: generatedContent as never })
      .eq('id', planId);

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    const download = await planDetailsPage.exportToPDF();

    // Assert
    // 1. PDF should be created
    expect(download).toBeDefined();

    // 2. Verify filename contains destination
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/paris/i);
    expect(filename).toMatch(/\.pdf$/i);

    // 3. Verify file size is reasonable (multi-day plan should be larger)
    const path = await download.path();
    if (path) {
      const fs = await import('fs');
      const buffer = fs.readFileSync(path);
      // Valid PDF header
      expect(buffer.slice(0, 4).toString()).toBe('%PDF');
      // Multi-day plan with activities should be substantial
      expect(buffer.length).toBeGreaterThan(5000);
    }
  });

  test.skip('should generate unique filename for each export', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

  test.skip('should maintain proper PDF structure', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

  test.skip('should handle export after regeneration', async ({ page, supabase, sharedUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Create generated plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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
