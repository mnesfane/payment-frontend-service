import { Component, Input } from '@angular/core';

import { PaymentResponse } from '../../models/payment-response.model';

@Component({
  selector: 'app-payment-result-card',
  standalone: true,
  templateUrl: './payment-result-card.component.html',
  styleUrl: './payment-result-card.component.css'
})
export class PaymentResultCardComponent {
  @Input({ required: true }) result!: PaymentResponse;

  get isApproved(): boolean {
    return this.result?.status === 'APPROVED';
  }
}

