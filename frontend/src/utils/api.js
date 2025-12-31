// frontend/src/utils/api.js

const API_BASE_URL = "http://127.0.0.1:8000";

export const apiEndpoints = {
  // =====================
  // CORE INGESTION
  // =====================
  upload: () => `${API_BASE_URL}/upload/`,
  uploadInfo: (pdfHash) => `${API_BASE_URL}/upload/${pdfHash}/info`,

  // =====================
  // OBSERVATIONS / MISSIONS
  // =====================
  allMissions: () => `${API_BASE_URL}/observations`,
  missionSummary: (mission) => `${API_BASE_URL}/observations/${mission}`,

  instruments: (mission) =>
    `${API_BASE_URL}/observations/${mission}/instruments`,

  instrumentDetails: (mission, name) =>
    `${API_BASE_URL}/observations/${mission}/instruments/${name}/details`,

  phases: (mission) =>
    `${API_BASE_URL}/observations/${mission}/phases`,

  tables: (mission) =>
    `${API_BASE_URL}/observations/${mission}/tables`,

  entitiesSummary: (mission) =>
    `${API_BASE_URL}/observations/${mission}/entities/summary`,

  pageContent: (mission, pageNumber) =>
    `${API_BASE_URL}/observations/${mission}/page/${pageNumber}`,

  // =====================
  // MISSION IMAGES
  // =====================
  missionImages: (mission) =>
    `${API_BASE_URL}/api/missions/${encodeURIComponent(mission)}/images`,



  // =====================
  // SEARCH
  // =====================
  searchGlobal: (query) =>
    `${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`,

  searchMission: (name) =>
    `${API_BASE_URL}/search/mission?name=${encodeURIComponent(name)}`,

  searchInstrument: (name) =>
    `${API_BASE_URL}/search/instrument?name=${encodeURIComponent(name)}`,

  searchMeasurements: (query) =>
    `${API_BASE_URL}/search/measurements?q=${encodeURIComponent(query)}`,

  searchPeople: (query) =>
    `${API_BASE_URL}/search/people?q=${encodeURIComponent(query)}`,

  searchCoordinates: (query) =>
    `${API_BASE_URL}/search/coordinates?q=${encodeURIComponent(query)}`,

  searchPages: (mission, query) =>
    `${API_BASE_URL}/search/pages?mission=${encodeURIComponent(
      mission
    )}&q=${encodeURIComponent(query)}`,

  // =====================
  // RAG Q&A (FINAL)
  // =====================
  askQuestion: () => `${API_BASE_URL}/query/query/`,
};

export const getApiBaseUrl = () => API_BASE_URL;
