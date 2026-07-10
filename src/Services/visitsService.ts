import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

export type Office = {
  id: number;
  name?: string;
  officeName?: string;
  [key: string]: unknown;
};

export type VisitCreateDto = {
  visitorId: number;
  officeId: number;
  visitDate: string;
  expectedArrival?: string | null;
  purpose?: string | null;
  attachmentUrl?: string | null;
};

const ensureApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error("Missing required env var: VITE_API_BASE_URL.");
  }
  return API_BASE_URL;
};

export const createVisitor = async (visitor: Record<string, unknown>) => {
  try {
    const response = await axios.post(`${ensureApiBaseUrl()}/visitors`, visitor);
    return response.data;
  } catch (error) {
    console.error("Error creating visitor:", error);
    throw error;
  }
};

export const getOffices = async (): Promise<Office[]> => {
  try {
    const response = await axios.get(`${ensureApiBaseUrl()}/offices`);
    const data = response.data;
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch (error) {
    console.error("Error fetching offices:", error);
    throw error;
  }
};

export const createVisit = async (visit: VisitCreateDto) => {
  try {
    const response = await axios.post(`${ensureApiBaseUrl()}/visits`, visit);
    return response.data;
  } catch (error) {
    console.error("Error scheduling visit:", error);
    throw error;
  }
};
