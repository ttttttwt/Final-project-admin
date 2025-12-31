import api from '@/lib/api';
import type { AdminPaymentDTO, PagedPayments, RefundRequest } from './types';

const BASE_URL = '/admin/payments';

export const paymentApi = {
  getPayments: async (page = 0, size = 10, search?: string, status?: string): Promise<PagedPayments> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);
    
    const response = await api.get<PagedPayments>(`${BASE_URL}?${params}`);
    return response.data;
  },

  refundPayment: async (id: string, data?: RefundRequest): Promise<AdminPaymentDTO> => {
    const response = await api.post<AdminPaymentDTO>(`${BASE_URL}/${id}/refund`, data);
    return response.data;
  },
};
