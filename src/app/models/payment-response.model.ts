export type PaymentStatus = 'APPROVED' | 'DECLINED';

export interface PaymentResponse {
  transactionRef: string;
  status: PaymentStatus;
  message: string;
}

