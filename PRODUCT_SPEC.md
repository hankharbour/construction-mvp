# Dead On Pro — Product Specification v1.1
Status: Proposed requirements; not implemented by this document. Brand provisional pending trademark clearance.
## Product
Standalone subscription construction software with future BuildOS integration. Core flow: upload plans/photos -> calibrate -> identify geometry -> human review -> traceable quantity takeoff -> editable 3D -> cost estimate -> proposal -> purchasing -> job financials.
## Market decision — confirmed 2026-11-09
All construction trades from day one, including residential, commercial, remodeling, roofing, and specialty contractors. This means universal trade support, cost codes, custom assemblies, and manual/verified takeoffs in MVP; it does NOT mean complete AI automation for every trade at launch. General contractors can combine multiple trades in a single estimate. No trade is excluded from the data model.

## MVP
- Auth, company/project roles, secure storage, project versions and audit events.
- Upload PDF/images, mobile camera capture, plan page organization, scale calibration, manual dimension corrections, measurement overlays and source references.
- Universal estimating data model: trades, cost codes, assemblies, units, labor, equipment, subcontractors, user-defined quantities and prices for every construction trade.
- Starter quantity calculators and editable assemblies for sitework, concrete, structural/framing, roofing, exterior finishes, electrical, plumbing, HVAC, drywall/insulation, interiors, openings, and specialty trades. Quantities may be manually entered or verified; show measured/assumed/unverified and confidence.
- Multi-trade general contractor estimates, trade-specific estimate views, reusable templates, and trade-specific waste/labor rules.
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
US jurisdiction; measurement accuracy thresholds; pricing providers; aerial imagery licensing; subscription prices; payment processor; accountant integration and tax compliance; branding clearance.

## Immediate engineering work order (in priority order)
1. Implement canonical database schema for organizations, users, projects, trades, cost codes, assemblies, quantities, estimate versions, source drawings, invoices, receipts and payments.
2. Build mobile-first multi-trade estimate editor: add any trade, assembly, item, unit, quantity, unit price, labor and markup/margin; export CSV/JSON.
3. Build drawing upload and calibrated measurement workspace with provenance; require human verification.
4. Add job ledger lite: invoice and receipt drafts, cost codes, payment status and audit events.
5. Connect reviewed geometry to conceptual 3D and roof takeoff; satellite imagery requires licensed source and verified pitch.
6. Add tenant isolation, automated test coverage and deployment pipeline before accepting real customer plans or payment data.

## All-trades MVP acceptance criteria
- An estimator can create one project containing at least 12 distinct trades and a custom specialty trade without a schema change.
- Each trade can have material, labor, equipment and subcontract line items, with independent units, quantities, waste, taxes and cost codes.
- Multi-trade totals, profit margin and markup calculations remain consistent after revisions and exports.
- An unrecognized trade plan can still be measured and manually estimated without pretending AI has recognized it.
