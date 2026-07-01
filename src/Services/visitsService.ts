export interface VisitData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  visitorCompany?: string;
  officeId: string | number;
  visitDate: string;
  expectedArrival?: string;
  purpose?: string;
  attachmentUrl?: string;
  reserveParking: boolean;
  parkingSpotPreference?: string;
  vehiclePlate?: string;
}

export const scheduleVisit = async (visitData: VisitData): Promise<VisitData> => {
  // Simulate API latency/delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    ...visitData,
  };
};
