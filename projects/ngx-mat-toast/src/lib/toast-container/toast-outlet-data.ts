import type { Signal } from '@angular/core';
import type { ToastData } from '../toast.model';
import type { ToastPosition } from '../toast.types';

/**
 * Data passed from `NgxMatToastService` into the persistent Material snackbar outlet.
 *
 * @internal
 */
export interface ToastOutletData {
  toasts: Signal<ToastData[]>;
  dismiss: (id: string) => void;
  position: ToastPosition;
}
