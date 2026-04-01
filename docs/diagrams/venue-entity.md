# Venue Entity Diagram

```mermaid
erDiagram
    VENUES {
        UUID id PK
        VARCHAR(255) name
        TEXT description
        VARCHAR(100) category
        VARCHAR(500) address
        GEOGRAPHY(POINT) location
        VARCHAR(50) phone
        VARCHAR(500) website
        VARCHAR(500) image_url
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
```

## Column Notes

| Column | Purpose | User Story |
|--------|---------|------------|
| `name` | Venue display name | US2, US3 |
| `description` | Detailed info shown on venue page | US3 |
| `category` | Filter by type (e.g. "Contemporary Art", "History") | US4 |
| `address` | Human-readable address | US3 |
| `location` | PostGIS POINT (SRID 4326) for map display and proximity queries | US2 |
| `phone` | Contact info | US3 |
| `website` | External link | US3 |
| `image_url` | Venue photo | US3 |
