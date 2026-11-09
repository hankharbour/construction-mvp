# Dead On Pro — Product Specification v1.0
Status: Proposed requirements; not implemented by this document. Brand provisional pending trademark clearance.
## Product
Standalone subscription construction software with future BuildOS integration. Core flow: upload plans/photos -> calibrate -> identify geometry -> human review -> traceable quantity takeoff -> editable 3D -> cost estimate -> proposal -> purchasing -> job financials.
## MVP
- Auth, company/project roles, secure storage, project versions and audit events.
- Upload PDF/images, mobile camera capture, plan page organization, scale calibration, manual dimension corrections, measurement overlays and source references.
- Core takeoff: slabs, basic wall framing, roofing, siding, insulation, drywall, windows/doors, basic interior finishes; show measured/assumed/unverified and confidence.
- Conceptual editable 3D geometry tied to reviewed dimensions; exterior color/material choices; changes recalculate impacted quantities.
- Estimating: editable pricebook, waste, labor, equipment, taxes, freight, overhead, margin vs markup, allowances, exclusions; proposal PDF and CSV/XLSX exports.
- Job finance lite: customers, contracts, invoices, payment recording, receipt image upload/OCR with user approval, cost codes, job expenses, budget vs actual and receivables.
- Billing: trial, subscriptions, usage caps, admin usage and account controls.
- Roof MVP: manual plan-based roof estimator and labor pricing; imagery-assisted roof measurement as phase 2 unless licensing/coverage and accuracy validation permit earlier pilot.
## Phase 2
- Advanced trade takeoffs (MEP, rebar, site work), drawing revisions, plan chat, risk detection and value engineering.
- Satellite/aerial roof measurement: address lookup, licensed imagery, roof plane editing, pitch verification, penetrations, waste, tearoff, material and labor estimates, provenance.
- RFQs, supplier catalog pricing, lead times, substitutions, purchasing, deliveries, subcontractor comparison.
- Change orders and approvals; project schedule, tasks, progress, daily logs, client portal.
- Accounts payable, retainage, progress billing, expense approval, reconciliation/export, accounting integrations.
## Future
- DWG/DXF/IFC ingestion and robust BIM geometry; full architectural edits, advanced rendering and walk-through.
- Code/energy/structural flags for professional review, not stamped designs.
- Cutting optimization, cross-project leftover inventory, enterprise administration and BuildOS sync.
## Explicit exclusions
Voice assistant, offline access, drone reconstruction, AR placement, terrain grading visualization, energy operating-cost comparisons, contractor marketplace.
## Non-negotiable quality requirements
1. Never invent measurements; record source page, polygon/segment, scale, formula, units, assumption, confidence, reviewer and timestamp.
2. Separate conceptual preview from verified geometry and approved takeoffs; prevent unreviewed AI quantities being labeled final.
3. Model geometry and quantity engine share one versioned canonical project model; edits trigger dependency-aware recalculation.
4. Store drawing revisions, source provenance and before/after cost deltas; ensure user approval before publishing bids.
5. Tenant isolation, role-based access, encrypted uploads, malware scanning, backups, retention/deletion, access audit and subscription entitlements.
6. Financial controls: invoice numbering, immutable posted transactions/adjustments, sales tax jurisdiction, receipts linked to jobs, approval workflows, duplicate detection; no implied full accounting compliance in MVP.
7. Roof imagery licensing, coverage dates and resolution disclosure; pitch and roof plane verification required.
8. Transparent calculations with configurable regional labor/material prices; estimates are not guarantees or engineering approvals.
9. Accessible responsive mobile UI, automated regression tests, performance targets, error monitoring, backups and restore tests.
10. BuildOS API via versioned project IDs, scoped tokens, idempotent sync, permission boundaries and conflict resolution.
## Acceptance tests for MVP
- User uploads a sample multi-page PDF, calibrates two known dimensions and saves annotated measurements.
- Quantity row links back to its drawing geometry, formula, waste factor and reviewer.
- Changing siding from vinyl to brick updates only relevant takeoff rows and cost; flags unknown wall support.
- User exports estimate with allowances, exclusions, taxes, overhead and distinct markup/margin calculations.
- Receipt photo is extracted into a draft expense, reviewed and assigned to a job; duplicate warning works.
- Invoice tracks issue, partial payment, outstanding balance and customer/job assignment.
- Users from separate companies cannot access each other's projects, documents or invoices.
- Project revisions and estimate changes are auditable and recoverable.
## Key unresolved decisions
Initial trades and residential/commercial scope; US jurisdiction; measurement accuracy thresholds; pricing providers; aerial imagery licensing; subscription prices; payment processor; accountant integration and tax compliance; branding clearance.
