import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { PaymentRequest } from '../models/payment-request.model';
import { PaymentResponse } from '../models/payment-response.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);

  /**
   * Frontend MUST call ONLY the Switch Service.
   * If you later add environments, move this base URL to `environment.ts`.
   */
  private readonly switchPaymentUrl = 'http://localhost:8081/switch/payment';

  submitPayment(payload: PaymentRequest) {
    return this.http.post<PaymentResponse>(this.switchPaymentUrl, payload).pipe(
      // Convert low-level network / HTTP errors into a user-friendly message.
      catchError((err: unknown) => throwError(() => new Error(this.toUserMessage(err))))
    );
  }

  private toUserMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return 'Unexpected error occurred while processing the payment.';
    }

    // Network errors (CORS, DNS, backend down, etc.)
    if (err.status === 0) {
      return 'Unable to reach the Switch Service. Please check the backend is running on localhost:8081.';
    }

    // If backend returns a structured error body, try to surface something meaningful.
    const body = err.error as unknown;
    if (body && typeof body === 'object' && 'message' in body) {
      const msg = (body as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim().length > 0) {
        return msg;
      }
    }

    return `Payment request failed (${err.status}). Please try again.`;
  }
}

