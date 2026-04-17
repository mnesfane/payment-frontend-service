import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'payment'
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./pages/payment-terminal/payment-terminal.page').then((m) => m.PaymentTerminalPage)
  },
  {
    path: '**',
    redirectTo: 'payment'
  }
];
