# API Endpoint Implementation Plan: Export Plan to PDF

## 1. Endpoint Overview
This endpoint generates a PDF representation of a travel plan and returns it as a file download.

## 2. Request Details
- **HTTP Method**: `GET`
- **URL Structure**: `/api/plans/{id}/export`
- **URL Parameters**:
  - `id` (string, required): The ID of the plan to export.
- **Query Parameters**:
  - `format` (string, required): The desired output format. Must be `pdf`.
- **Request Body**: None

## 3. Types Used
- None directly for the response, as it's a binary file. Internally, `PlanDetailsDto` will be used.

## 4. Response Details
- **Success Response (`200 OK`)**:
  - **Headers**:
    - `Content-Type: application/pdf`
    - `Content-Disposition: attachment; filename="plan-name.pdf"` (where "plan-name" is derived from the plan's name).
  - **Content**: The binary data of the generated PDF file.
- **Error Response (`400 Bad Request`)**: Returned if the `format` query parameter is missing or is not `pdf`.
- **Error Response (`404 Not Found`)**: Returned if the plan is not found.
- **Error Response (`409 Conflict`)**: Returned if the plan is not in the `generated` state.

## 5. Data Flow
1. The client sends a `GET` request to the export URL, e.g., `/api/plans/{id}/export?format=pdf`.
2. Astro middleware verifies the user's token.
3. The API handler in `src/pages/api/plans/[id]/export.ts` receives the request.
4. The handler validates that the `format` query parameter is present and equals `pdf`.
5. The handler extracts `planId` from the URL and `userId` from the session.
6. The handler calls the existing `planService.getPlanById(planId, userId)` to fetch the plan details. It also checks that the plan's status is `generated`.
7. If the plan is found, the handler passes the `PlanDetailsDto` to a new `PdfService`.
8. `PdfService` uses a library (e.g., `pdf-lib` or a headless browser like Puppeteer via a serverless function) to render the plan data into a PDF document.
9. `PdfService` returns the generated PDF as a `Buffer` or `ArrayBuffer`.
10. The API handler constructs a `Response` object with the PDF buffer, setting the appropriate `Content-Type` and `Content-Disposition` headers.

## 6. Security Considerations
- **Authentication & Authorization**: Standard checks ensure only the plan's owner can export it.
- **Server-Side Rendering**: PDF generation should be handled carefully to avoid performance issues or vulnerabilities. Using a dedicated library is generally safer than trying to construct a PDF manually. If using a headless browser, it must be properly sandboxed.

## 7. Error Handling
- **`400 Bad Request`**: For missing or invalid `format` parameter.
- **`401 Unauthorized`**: Unauthenticated user.
- **`404 Not Found`**: If the plan does not exist for the user.
- **`409 Conflict`**: If the plan is not in the `generated` state.
- **`500 Internal Server Error`**: For failures during the PDF generation process.

## 8. Performance Considerations
- PDF generation can be CPU and memory intensive. For complex plans, this could become a bottleneck.
- This is a candidate for being offloaded to a separate serverless function to avoid blocking the main API server, especially if a headless browser is used. For the initial implementation, running it in the same process is acceptable.

## 9. Implementation Steps
1. **Choose PDF Library**:
   - Research and select a suitable Node.js library for creating PDFs (e.g., `pdf-lib`, `jspdf` on the server, or `puppeteer-core` for HTML-to-PDF).
2. **Create PDF Service**:
   - Create a new file `src/lib/services/pdf.service.ts`.
   - Implement a function `generatePlanPdf(plan: PlanDetailsDto): Promise<Buffer>`.
   - This function will contain the logic for laying out the plan data and generating the PDF file buffer.
3. **Implement the API Endpoint**:
   - Create the file `src/pages/api/plans/[id]/export.ts`.
   - Implement the `GET` handler. It will validate the query parameter, fetch the plan data using `PlanService`, call the `PdfService`, and return the file response with correct headers.
4. **Testing**:
   - Unit test the `PdfService` (this might be complex; at a minimum, test that it produces a non-empty buffer for valid input).
   - Integration test the endpoint to ensure it returns a valid PDF file with the correct headers and handles all error cases.
