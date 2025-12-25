const API_BASE_URL = 'http://localhost:8000'

export const apiEndpoints = {
  upload: () => `${API_BASE_URL}/upload/`,
  allMissions: () => `${API_BASE_URL}/observations`,
  missionSummary: (mission) => `${API_BASE_URL}/observations/${mission}`,
  
  // PHASE 1: Upload tracking
  uploadInfo: (pdfHash) => `${API_BASE_URL}/upload/${pdfHash}/info`,
  
  instruments: (mission) => `${API_BASE_URL}/observations/${mission}/instruments`,
  
  // PHASE 3: Instrument details
  instrumentDetails: (mission, name) => `${API_BASE_URL}/observations/${mission}/instruments/${name}/details`,
  
  phases: (mission) => `${API_BASE_URL}/observations/${mission}/phases`,
  tables: (mission) => `${API_BASE_URL}/observations/${mission}/tables`,
  
  // PHASE 4: Entities summary
  entitiesSummary: (mission) => `${API_BASE_URL}/observations/${mission}/entities/summary`,
  
  // PHASE 5: Page viewer
  pageContent: (mission, pageNumber) => `${API_BASE_URL}/observations/${mission}/page/${pageNumber}`,
  
  searchGlobal: (query) => `${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`,
  searchMission: (name) => `${API_BASE_URL}/search/mission?name=${encodeURIComponent(name)}`,
  searchInstrument: (name) => `${API_BASE_URL}/search/instrument?name=${encodeURIComponent(name)}`,
  
  // PHASE 8: Enhanced search
  searchMeasurements: (query) => `${API_BASE_URL}/search/measurements?q=${encodeURIComponent(query)}`,
  searchPeople: (query) => `${API_BASE_URL}/search/people?q=${encodeURIComponent(query)}`,
  searchCoordinates: (query) => `${API_BASE_URL}/search/coordinates?q=${encodeURIComponent(query)}`,
  
  searchPages: (mission, query) => `${API_BASE_URL}/search/pages?mission=${encodeURIComponent(mission)}&q=${encodeURIComponent(query)}`,
  askQuestion: () => `${API_BASE_URL}/query/ask`,
}

export const getApiBaseUrl = () => API_BASE_URL

// utils/api.js

const API_BASE = "http://127.0.0.1:8000";

export async function askQuestion(question, top_k = 5, top_sentences = 4) {
  const res = await fetch(`${API_BASE}/query/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question, top_k, top_sentences }),
  });

  if (!res.ok) {
    throw new Error("Query failed");
  }

  return await res.json();
}
