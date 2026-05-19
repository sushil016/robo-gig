import api from "@/lib/api-client";
import type { Address, AddressInput } from "@/types/marketplace.types";

export const addressApi = {
  list: async (): Promise<Address[]> => {
    const response = await api.get("/api/addresses");
    return response.data.data;
  },

  create: async (data: AddressInput): Promise<Address> => {
    const response = await api.post("/api/addresses", data);
    return response.data.data;
  },

  update: async (id: string, data: AddressInput): Promise<Address> => {
    const response = await api.patch(`/api/addresses/${id}`, data);
    return response.data.data;
  },

  setDefault: async (id: string): Promise<Address> => {
    const response = await api.post(`/api/addresses/${id}/default`);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/api/addresses/${id}`);
  },
};
