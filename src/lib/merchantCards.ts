// lib/api/merchantCards.ts
import api from "@/lib/axios";

export interface CardScanResponse {
  success: boolean;
  data: {
    card: {
      card_id: string;
      card_number: string;
      status: string;
      balance: number;
      points: number;
      issued_at: string;
      expires_at: string;
      last_scanned_at?: string;
    };
    user: {
      id: string;
      uuid: string;
      firstname: string;
      lastname: string;
      full_name: string;
      email: string;
      phone: string | null;
      avatar: string | null;
      member_since: string;
    };
    verification: {
      card_active: boolean;
      card_owner_verified: boolean;
      scan_timestamp: string;
      qr_valid: boolean;
    };
  };
  message: string;
}

export interface GenerateQRResponse {
  success: boolean;
  data: {
    card_id: string;
    qr_data: string;
    qr_data_json: string;
    expires_at: string;
  };
  message: string;
}

export const merchantCardAPI = {
  /**
   * Scan a card QR code
   */
  scanCard: async (qrData: string) => {
    const response = await api.post<CardScanResponse>("/merchant/card/scan", {
      qr_data: qrData,
    });
    return response.data;
  },

  /**
   * Get card details by QR code
   */
  getCardByQr: async (qrData: string) => {
    const response = await api.post("/merchant/card/scan-qr", {
      qr_data: qrData,
    });
    return response.data;
  },

  /**
   * Generate QR code for a card
   */
  generateQrData: async (cardId: string) => {
    const response = await api.post<GenerateQRResponse>(
      `/merchant/cards/${cardId}/generate-qr`,
    );
    return response.data;
  },
};
