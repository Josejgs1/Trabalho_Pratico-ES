[← Back to Index](../INDEX.md)

# ADR-004: Compute Average Rating on Demand Instead of Denormalizing

## Status
Accepted

## Date
2026-04-04

## Context
KULTI allows users to rate venues (US6). Each rating is stored in a records table that relates users to venues. The system needs to display the average rating for each venue on detail pages (US3) and potentially on map markers (US2). Three strategies were considered:

1. **Denormalized columns** — store `average_rating` and `rating_count` directly on the `venues` table, updating them on every insert/update/delete of a rating.
2. **Computed on demand** — calculate `AVG(rating)` via JOIN at query time, storing nothing on the `venues` table.
3. **Materialized view** — pre-compute averages in a PostgreSQL materialized view, refreshed on a schedule.

## Decision
We will compute the average rating on demand using `AVG()` with a `LEFT JOIN` and `GROUP BY` at query time. No rating-related columns will be added to the `venues` table.

## Rationale

### Why `average_rating` was not added to the `venues` table
The `venues` table was designed to hold static venue data — name, address, category, coordinates (ADR-003). An `average_rating` column is fundamentally different: it is derived data that changes every time a user submits, edits, or deletes a rating. Mixing static and derived data in the same table creates several problems:
- The `updated_at` timestamp loses its meaning — it would change on every new rating, not just when venue information is actually edited.
- Every rating write requires an additional `UPDATE` on the `venues` row, introducing row-level lock contention when multiple users rate the same venue concurrently.
- A `rating_count` column would also be needed to recalculate the average incrementally, further coupling the venue schema to the rating logic.
- If the update fails or is skipped (e.g., application crash between inserting the rating and updating the venue), the stored average silently drifts from the real value with no automatic recovery.

### Why computing on demand is sufficient
- The query cost of `AVG()` depends on ratings per venue, not total ratings in the system. PostgreSQL handles aggregation over hundreds of rows per group in microseconds with an index on the foreign key.
- At MVP scale (city-level venues, tens to hundreds of ratings per venue), the aggregation cost is negligible even when listing many venues at once.
- If performance becomes a measurable problem at larger scale, a materialized view (`REFRESH CONCURRENTLY` on a schedule) or a cache layer (Redis) are better solutions than manual denormalization — they avoid write-path complexity entirely.

## Consequences
- The `venues` table remains unchanged — no migration needed.
- Queries that need the average rating must include a JOIN to the records table.
- Application-layer code (services/repositories) should provide a reusable query pattern for fetching venues with their computed average.
- No risk of rating data getting out of sync with the source records.
- If the on-demand approach proves insufficient under real load, the team should revisit this decision and consider a materialized view (Option 3), not denormalization.

## See Also
- [ADR-003: Venue Modeling](adr-003-venue-modeling.md) — venue table design and static-data rationale
- [Database Schema](../setup/database-schema.md) — ER diagram and column reference
