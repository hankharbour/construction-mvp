# Repository audit and engineering backlog

Audit date: 2026-11-09. Baseline: e02ec79. All five original tracked files reviewed, including the complete PRODUCT_SPEC.md. This repository is a public static demo, not a production SaaS.

## Findings and first milestone acceptance

- P0: index.html contained an injected script and premature closing document inside the estimator's currency formatter, plus duplicate design code. This broke the estimator and document structure. Repaired; scripts/styles now have separate modules.
- P0: deployment uploaded the entire repository without tests. It now builds and tests before uploading only dist. PR validation is independent of deployment. Repository branch protection and environment approval settings still need administrator configuration.
- P0: browser storage was unvalidated and persisted only line items. A versioned storage adapter now migrates valid legacy lines and saves settings; numeric/text shape validation is added; secure tenant storage is still absent. Public demo must only use sample data.
- P1: PDF measurement was explicitly unsupported. Local PDF.js rendering now supports page selection, independent scales, length/area/count, zoom with scroll panning, recalibration, geometry-preserving export/restore and SHA-256 source matching.
- P1: original measurement exports discarded points. New sessions retain page coordinates, scale/calibration points, formula, timestamp and source. All measurements remain unverified. Recalibration recomputes current page quantities.
- P1: margin formula was mathematically correct but unreachable due to broken JavaScript. Shared tested engine now distinguishes markup and margin, rejects invalid domain inputs, and applies waste only to materials. Material tax remains an illustrative allowance.
- P1: spreadsheet formula injection in CSV text fields. Export cells now neutralize formula prefixes.
- P2: three stacked stylesheets, compressed legacy UI logic and inaccessible drawing interaction. Existing design preserved; structural CSS and modules extracted, focus indicators/status announcements added. Full keyboard geometry editing remains outstanding.
- P2: conceptual 3D has no openings, accurate finish assemblies or linkage to drawing geometry. Retained with honest conceptual labeling.

Acceptance: type checking, calculation tests, production Pages-base build, desktop/mobile navigation, PDF calibration and page independence, zoom, session restore and estimate transfer all pass. Dependency audit has no reported vulnerabilities after updating PDF.js to a patched release. No real customer files used. No merge or deployment authorized/performed.

## Next milestones, in order

1. Harden measurement correction and review: second-dimension scale checks, rotation handling, keyboard controls, perspective warnings, explicit reviewer identity. Add large/rotated/encrypted/malformed PDF fixtures and page cache limits. Current bitmap cache can grow with visited pages; upload cap is 40 MB.
2. Complete estimate lifecycle: reviewer identity, versioned revisions and revision deltas, freight/allowances/contingency, rounding policy and tax jurisdiction rules. Line editing, source navigation, unverified assumption display, saved settings and consistent CSV/JSON settings/summary are now implemented. New lines have stable IDs; legacy lines migrate when edited. Current measurement-to-estimate copy is a snapshot; later drawing edits do not update existing estimate lines automatically.
3. Define canonical persistence schema and API boundaries for organizations, users, memberships, projects, drawings, trades, assemblies, quantities, revisions and audit events. Backend hosting/provider is undecided. Do not claim tenant isolation or store actual customer data until authenticated authorization, isolation tests, private object storage, malware scanning, retention and backup/restore are implemented.
4. Establish design-system components, route focus management, responsive estimate editing, accessible chart/table patterns, project dashboard and tested empty/error states. Home remains a sample tool launcher.
5. Reviewed geometry/roof quantity dependencies: gable openings/overhangs, roof planes/pitch provenance, exterior finish assemblies, change impact. Licensed imagery is blocked on provider/licensing decisions; no satellite measurements claimed.
6. Job ledger drafts with customer/job assignment, invoice IDs, partial payments and duplicate receipt review. Posted transactions must be immutable with adjustments before accounting claims.
7. Secure subscriptions/entitlements, company roles, audit logging, monitoring and recovery drills. Pricing, payment provider and legal jurisdiction remain decisions.
8. AI interpretation only after source geometry, human correction and review are dependable; supplier APIs, rendering and BuildOS sync follow scoped/versioned interfaces.

## Remaining limitations

Static demo has no authentication, tenant isolation, backup, cloud document persistence, subscription billing, AI interpretation, supplier procurement or accounting. Session JSON is user-managed and does not embed the original drawing. Scales assume flat, undistorted drawings. Quantities are not professional verification. Canonical drawing coordinates use the stored page raster size; scale is independent of CSS zoom. Type checking currently covers domain functions/models, not every legacy UI module. Browser tests emulate mobile Chromium; they do not certify real iOS camera/PDF behavior. Signed PDFs, complex fonts and uncommon image formats need broader testing. PDF pages currently render without optional CMap/standard-font packs; some documents may have missing glyphs. Browser-specific memory/storage limits apply.

## Second milestone acceptance

Estimate editor now supports saved pricing settings, editable line items, runtime-validated storage migration, drawing source navigation and consistent summary/settings in JSON and CSV. Quantity/unit corrections detach the drawing snapshot and record a manual assumption. Domain model remains open to all starter/custom trades. Crossed polygon boundaries are rejected. Eight unit tests cover calculations, geometry and persistence. Browser tests run against the actual production build under the GitHub Pages base, on mobile and desktop. No bid approval, audit history or automatic drawing-to-estimate dependencies are claimed.

## Third milestone acceptance

Existing length, polygon and count points can be corrected by choosing a point and clicking its replacement position. Saving recomputes the quantity and retains prior points/value/timestamp in exported sessions; cancel leaves the original unchanged. Measurements remain unverified and prior estimate snapshots remain unchanged. Mobile and desktop browser tests exercise a length correction and check its saved history and recalculated quantity. This is local revision evidence, not an authenticated or tamper-proof audit log.
