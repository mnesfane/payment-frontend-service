import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { PaymentResultCardComponent } from '../../components/payment-result-card/payment-result-card.component';
import { TransactionHistoryComponent } from '../../components/transaction-history/transaction-history.component';
import { PaymentRequest } from '../../models/payment-request.model';
import { PaymentResponse } from '../../models/payment-response.model';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-terminal-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    PaymentResultCardComponent,
    TransactionHistoryComponent
  ],
  templateUrl: './payment-terminal.page.html',
  styleUrl: './payment-terminal.page.css'
})
export class PaymentTerminalPage {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);

  // UI state signals (simple, explicit, and easy to extend).
  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);
  readonly lastResult = signal<PaymentResponse | null>(null);
  readonly formValid = signal(false);

  readonly form = this.fb.nonNullable.group({
    pan: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\d{16}$/) // 16 digits
    ]),
    merchant: this.fb.nonNullable.control('', [Validators.required]),
    amount: this.fb.nonNullable.control<number | null>(null, [Validators.required, Validators.min(0.01)])
  });

  // Zoneless note: `form.valid` is not reactive for signals/computed; bridge validity via `statusChanges`.
  readonly canSubmit = computed(() => this.formValid() && !this.isSubmitting());

  constructor() {
    // #region agent log
    fetch('http://127.0.0.1:7920/ingest/f8afe917-a703-41b6-b944-803bcfbd3d06', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'e8a9b8' },
      body: JSON.stringify({
        sessionId: 'e8a9b8',
        runId: 'pre-fix',
        hypothesisId: 'H1',
        location: 'payment-terminal.page.ts:constructor',
        message: 'Page constructed (initial form state)',
        data: {
          valid: this.form.valid,
          status: this.form.status,
          errors: this.form.errors,
          isSubmitting: this.isSubmitting()
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion agent log

    this.form.statusChanges.subscribe((status) => {
      const isValidNow = status === 'VALID';
      this.formValid.set(isValidNow);

      // #region agent log
      fetch('http://127.0.0.1:7920/ingest/f8afe917-a703-41b6-b944-803bcfbd3d06', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'e8a9b8' },
        body: JSON.stringify({
          sessionId: 'e8a9b8',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'payment-terminal.page.ts:statusChanges->formValid',
          message: 'Bridged form status into formValid signal',
          data: { status, formValidSignal: this.formValid(), canSubmitComputedNow: this.canSubmit() },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log

      // #region agent log
      fetch('http://127.0.0.1:7920/ingest/f8afe917-a703-41b6-b944-803bcfbd3d06', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'e8a9b8' },
        body: JSON.stringify({
          sessionId: 'e8a9b8',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          location: 'payment-terminal.page.ts:statusChanges',
          message: 'Form status changed',
          data: {
            status,
            valid: this.form.valid,
            canSubmitComputedNow: this.canSubmit(),
            panErrors: this.form.controls.pan.errors,
            merchantErrors: this.form.controls.merchant.errors,
            amountErrors: this.form.controls.amount.errors
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log
    });

    this.form.valueChanges.subscribe((value) => {
      // #region agent log
      fetch('http://127.0.0.1:7920/ingest/f8afe917-a703-41b6-b944-803bcfbd3d06', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'e8a9b8' },
        body: JSON.stringify({
          sessionId: 'e8a9b8',
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'payment-terminal.page.ts:valueChanges',
          message: 'Form value changed (redacted)',
          data: {
            // Do NOT log PAN (PII). Only log length + last4.
            panLen: typeof value.pan === 'string' ? value.pan.length : null,
            panLast4: typeof value.pan === 'string' ? value.pan.slice(-4) : null,
            merchantLen: typeof value.merchant === 'string' ? value.merchant.length : null,
            amount: typeof value.amount === 'number' ? value.amount : value.amount ?? null,
            valid: this.form.valid,
            canSubmitComputedNow: this.canSubmit()
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log
    });
  }

  submit(): void {
    this.apiError.set(null);
    this.lastResult.set(null);

    // Prevent accidental submissions and ensure validation hints are visible.
    this.form.markAllAsTouched();

    // #region agent log
    fetch('http://127.0.0.1:7920/ingest/f8afe917-a703-41b6-b944-803bcfbd3d06', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'e8a9b8' },
      body: JSON.stringify({
        sessionId: 'e8a9b8',
        runId: 'pre-fix',
        hypothesisId: 'H3',
        location: 'payment-terminal.page.ts:submit',
        message: 'Submit invoked',
        data: {
          invalid: this.form.invalid,
          valid: this.form.valid,
          status: this.form.status,
          canSubmitComputedNow: this.canSubmit(),
          isSubmitting: this.isSubmitting()
        },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion agent log

    if (this.form.invalid || this.isSubmitting()) return;

    const payload: PaymentRequest = {
      pan: this.form.controls.pan.value,
      merchant: this.form.controls.merchant.value.trim(),
      amount: Number(this.form.controls.amount.value)
    };

    this.isSubmitting.set(true);

    // Major logic: Call ONLY the Switch Service and bind response to the Result Card.
    this.paymentService
      .submitPayment(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => this.lastResult.set(res),
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
          this.apiError.set(message);
        }
      });
  }

  // Small helper to keep the template readable.
  get panError(): string | null {
    const c = this.form.controls.pan;
    if (!c.touched) return null;
    if (c.hasError('required')) return 'PAN is required.';
    if (c.hasError('pattern')) return 'PAN must be exactly 16 digits.';
    return null;
  }

  get merchantError(): string | null {
    const c = this.form.controls.merchant;
    if (!c.touched) return null;
    if (c.hasError('required')) return 'Merchant is required.';
    return null;
  }

  get amountError(): string | null {
    const c = this.form.controls.amount;
    if (!c.touched) return null;
    if (c.hasError('required')) return 'Amount is required.';
    if (c.hasError('min')) return 'Amount must be greater than 0.';
    return null;
  }
}

