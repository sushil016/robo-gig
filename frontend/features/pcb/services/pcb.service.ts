import apiClient from "@/lib/api-client";

type PcbQuoteInput = {
  boardLayers: number;
  boardSizeX: number;
  boardSizeY: number;
  quantity: number;
  surfaceFinish: string;
  copperWeight: string;
  gerberFileUrl: string;
  notes: string;
};

export async function submitPcbQuote(payload: PcbQuoteInput): Promise<void> {
  await apiClient.post("/api/pcb/quote", payload);
}
