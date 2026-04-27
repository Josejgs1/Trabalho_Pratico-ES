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
    App->>API: GET /recommendations (with Browser GPS)
    API->>DB: Fetch nearby Venues (PostGIS Query - SRID 4326)
    DB-->>API: Venue Metadata (Names, Categories)
    API->>DB: Fetch User History & Wishlist
    DB-->>API: User Context
    API->>AI: Send Prompt (Nearby Venues + User Preferences)
    AI-->>API: Return Recommended Venue Names (JSON)
    API->>API: Validate & Match Names to Database IDs
    API-->>App: Return Curated List
    App-->>User: Display Recommendations Section
```

## 2. Decision Logic (Flowchart)

This flowchart defines the internal logic used to filter data and handle potential AI errors.

```mermaid
graph TD
    A[User Opens Digital Passport] --> B[App Requests Browser Geolocation]
    B --> C{Permission Granted?}
    C -- No --> D[Use Default City Center Coordinates]
    C -- Yes --> E[Send Lat/Lon to API]
    E --> F[DB Query: Find Venues within Proximity Radius]
    F --> G{User has history?}
    G -- Yes --> H[Extract Preferred Categories]
    G -- No --> I[Use Default Popular Categories]
    H --> J[Build Context-Aware Prompt]
    I --> J
    J --> K[Call Gemini API]
    K --> L{Valid JSON Received?}
    L -- Yes --> M[Validate Suggestions against DB Records]
    L -- No --> N[Error Fallback: Return Top 3 Closest Venues]
    M --> O[Success: Display Recommendations]
```

## 3. Rationale & Justifications

* **Hallucination Protection**: The system sends venue names and metadata to the AI but performs the ID matching on the backend. This prevents the hallucination of non-existent UUIDs, ensuring the system never attempts to display a venue that doesn't exist in the PostgreSQL database.

* **Spatial Pre-Filtering**: By performing a PostGIS proximity query before calling the AI, we reduce API costs (tokens) and prevent the AI from recommending places that are geographically out of reach for the user.

* **Contextual Fallback**: A fallback mechanism ensures that if the AI fails or returns invalid data, the user still receives a helpful nearby list instead of an empty screen or an error message.

* **Consistent Spatial Logic**: The logic explicitly uses the coordinates stored in the `location` column to maintain consistency with the spatial indexing strategy defined in the database schema.

## 4. Implementation Notes

* **API Response**: The Gemini API must be instructed to return data in a structured JSON format so the FastAPI backend can parse it without complex text processing.

* **Data Minimization**: Only necessary metadata (Name, Category, Description) is sent to the AI to stay within free-tier rate limits and ensure faster response times.