export interface AdminPaymentDTO {
  id: string;
  userEmail: string;
  userName: string;
  stripePaymentId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELED';
  paymentType: string;
  description: string;
  paidAt: string;
  createdAt: string;
}

export interface PagedPayments {
  content: AdminPaymentDTO[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface RefundRequest {
  reason?: 'requested_by_customer' | 'duplicate' | 'fraudulent';
}

export interface PaymentSummary {
  totalRevenue: number;
  revenueThisMonth: number;
  totalTransactions: number;
  transactionsThisMonth: number;
  refundedAmount: number;
  refundCount: number;
}
