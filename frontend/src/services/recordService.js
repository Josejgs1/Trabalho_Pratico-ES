import { apiRequest } from "./api.js";

/**
 * Fetch all records for the authenticated user
 */
export function fetchRecords() {
  return apiRequest("/records/");
}

/**
 * Fetch records filtered by venue
 */
export function fetchRecordsByVenue(venueId) {
  return apiRequest(`/records?venue_id=${venueId}`);
}

/**
 * Fetch a single record by ID
 */
export function fetchRecordById(recordId) {
  return apiRequest(`/records/${recordId}`);
}

/**
 * Create a new record
 */
export function createRecord(data) {
  return apiRequest("/records/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing record
 */
export function updateRecord(recordId, data) {
  return apiRequest(`/records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}