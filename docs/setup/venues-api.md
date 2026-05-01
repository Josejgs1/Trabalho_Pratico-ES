[← Back to Index](../INDEX.md)

# Venues API

The venues API powers the map listing, category chips, search bar, and venue
detail drawer.

## List Venues

```http
GET /venues
```

Returns all venues when no filters are provided.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Text search across venue text fields |
| `category` | string | No | Exact category filter |
| `latitude` | number | No | Center latitude for nearby search |
| `longitude` | number | No | Center longitude for nearby search |
| `radiusMeters` | number | No | Nearby search radius, up to 50,000 meters |

`latitude`, `longitude`, and `radiusMeters` must be provided together.

### Examples

```http
GET /venues?search=Casa
GET /venues?category=Arte%20Contempor%C3%A2nea
GET /venues?latitude=-19.9191&longitude=-43.9378&radiusMeters=3000
```

Filters can be combined:

```http
GET /venues?search=Savassi&category=Arte%20Contempor%C3%A2nea
```

## Get Venue

```http
GET /venues/{venue_id}
```

Returns one venue by UUID. The map drawer uses this endpoint for venue details.

## Response Shape

Both endpoints return venue data using the `VenueRead` schema:

```json
{
  "id": "9051116e-98dc-49e7-a7e3-d556c9eb87eb",
  "name": "Casa Fiat de Cultura",
  "description": "Cultural venue description",
  "category": "Arte Contemporânea",
  "address": "Praça da Liberdade, 10 · Savassi, Belo Horizonte · MG, Brasil",
  "latitude": -19.932753,
  "longitude": -43.935467,
  "phone": "(31) 3289 8900",
  "website": "https://casafiatdecultura.com.br/",
  "image_url": "https://example.com/image.jpg",
  "created_at": "2026-04-01T20:36:14.683680Z",
  "updated_at": "2026-04-01T20:36:14.683680Z"
}
```
