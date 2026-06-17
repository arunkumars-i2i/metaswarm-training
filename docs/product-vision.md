# CRM Product Vision

**Status**: Draft | **Created**: 2026-06-17 | **Technical governance**: see
[`.specify/memory/constitution.md`](../.specify/memory/constitution.md)

## Vision

A Simple CRM that gives a sales team one trustworthy place to **track leads and customers**,
so representatives spend less time on admin and managers gain clear visibility into the
pipeline.

The product keeps the customer record at the center. Representatives capture and update
customer information and log running **Customer Notes** as relationships progress; everyone
finds what they need fast through **Search**; and a **Dashboard** turns that day-to-day
activity into an at-a-glance picture of the pipeline. **Authentication** ensures each person
sees the right data securely. The deliberate goal is simplicity — a tool the team actually
uses instead of spreadsheets and scattered notes.

### Scope

**In scope (v1 core features):**

- Authentication — secure sign-in and access to customer data.
- Customer Management — create, view, update, and organize customer and lead records.
- Customer Notes — chronological notes captured against a customer.
- Dashboard — a summary view of customers, leads, and activity.
- Search — fast lookup of customers and related information.

**Out of scope (for now):** billing and invoicing, email/marketing automation, multi-tenant
or multi-organization support, and third-party integrations. These may be revisited once the
core experience is proven.

## Personas

### Sales Representative

The front-line, day-to-day user of the CRM.

- **Goals**: capture new leads quickly, keep customer records and notes current, and find a
  customer's details in seconds before a call or meeting.
- **Frustrations**: data scattered across spreadsheets and inboxes, slow or fruitless lookups,
  and re-entering the same information.
- **How the CRM helps**: a single customer record with quick capture and editing, running
  notes for context, and fast search — so the rep stays focused on selling, not bookkeeping.
- **Relies most on**: Customer Management, Customer Notes, Search, Authentication.

### Sales Manager

The oversight user who coaches the team and watches the pipeline.

- **Goals**: see team pipeline and activity at a glance, keep customer data clean and complete,
  and identify where reps need support.
- **Frustrations**: no consolidated view of what the team is working on, stale or inconsistent
  records, and having to chase reps for status updates.
- **How the CRM helps**: a dashboard summarizing customers, leads, and activity, plus search
  and access to the same records reps maintain — turning scattered effort into visibility.
- **Relies most on**: Dashboard, Search, Customer Management (oversight), Authentication.

## Success Metrics

Directional outcomes describing what success looks like. These are qualitative for now;
concrete, measurable targets will be defined later as the product and usage data mature.

- **Rep efficiency**: representatives spend less time on data entry and less time hunting for
  customer records.
- **Manager visibility**: managers gain a clear, current view of pipeline and team activity
  without chasing updates.
- **Data quality**: customer information and notes stay current, consistent, and easy to find.
- **Adoption**: the team chooses the CRM as its source of truth over spreadsheets and ad-hoc
  tracking.

## Related Documents

- [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) — technical
  principles, stack, and governance.
- `specs/` — per-feature specifications (e.g., Authentication, Customer Management, Customer
  Notes, Dashboard, Search) that trace back to this vision, created via the Spec Kit workflow.
