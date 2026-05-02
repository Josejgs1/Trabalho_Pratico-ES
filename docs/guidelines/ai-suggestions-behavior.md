[← Back to Index](../INDEX.md)

# AI Suggestions Behavior

This document defines the logic and flow for the KULTI recommendation system powered by the Gemini API. It ensures that AI suggestions are contextually relevant, geographically feasible, and technically reliable.

## 1. Interaction Flow (Sequence Diagram)

This diagram illustrates how the system coordinates between the user, the local PostGIS database, and the external Gemini API.

```mermaid
sequenceDiagram
    participant User
    participant App as Frontend (React)
    participant API as Backend (FastAPI)
    participant DB as Database (PostgreSQL)
    participant AI as Gemini API

    User->>App: Opens "Digital Passport" Page
    Note over App: Page Load Event
    App->>API: GET /recommendations
    API->>DB: Fetch User History & Wishlist (RECORDS table)
    DB-->>API: User Context
    alt User has no history
        API->>DB: Fetch Top Reviewed Venues (COUNT on RECORDS)
        DB-->>API: Popular Venue Metadata
    else User has history
        API->>DB: Fetch Venues matching preferred Categories
        DB-->>API: Context-Specific Venues
    end
    API->>AI: Send Prompt (Enriched Context + Popularity Data)
    AI-->>API: Return Recommended Venue Names (JSON)
    API->>API: Validate & Match Names to Database UUIDs
    API-->>App: Return Curated List
    App-->>User: Display Recommendations Section
```

## 2. Decision Logic (Flowchart)

This flowchart defines the internal logic used to filter data and handle potential AI errors.

```mermaid
graph TD
A[User Opens Digital Passport] --> B[API: Fetch User Records & Wishlist]
    B --> C{History or Wishlist found?}
    C -- Yes --> D[Extract Preferred Categories & Visit Patterns]
    C -- No --> E[DB Query: Identify Venues with Highest Review Count]
    D --> F[Select Candidates for AI Prompt]
    E --> F
    F --> G[Generate Structured Prompt for Gemini]
    G --> H[Call Gemini API]
    H --> I{Valid JSON Received?}
    I -- Yes --> J[Map Names back to DB UUIDs]
    I -- No --> K[Error Fallback: Return Top 3 Most Popular Venues]
    J --> L[Success: Display Recommendations]
```

## 3. Rationale & Justifications

* **Hallucination Protection**: The system sends venue names and metadata to the AI but performs the ID matching on the backend. This prevents the hallucination of non-existent UUIDs, ensuring the system never attempts to display a venue that doesn't exist in the PostgreSQL database.

* **Popularity-Based Fallback**: For users without history, the system identifies "popular" venues by calculating the frequency of entries for each `venue_id` within the `RECORDS` table. This uses existing data without requiring new tables or columns.

* **Consistency with ADR-004**: In alignment with ADR-004, popularity is computed on-demand via queries rather than being stored as a denormalized "rating_count" column in the `VENUES` table.

* **Consistent Spatial Logic**: The logic explicitly uses the coordinates stored in the `location` column to maintain consistency with the spatial indexing strategy defined in the database schema.

## 4. Implementation Notes

* **API Response**: The Gemini API must be instructed to return data in a structured JSON format so the FastAPI backend can parse it without complex text processing.

* **Data Minimization**: Only necessary metadata (Name, Category, Description) is sent to the AI to stay within free-tier rate limits and ensure faster response times.

* **Popularity Query**: The backend identifies popular venues by performing a `GROUP BY venue_id` and `COUNT(*)` on the `RECORDS` table.