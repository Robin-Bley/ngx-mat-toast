import type { Observable } from 'rxjs';
import type { NgxMatToastRef } from './toast.ref';

/**
 * Lightweight compatibility result that mirrors the most useful parts of
 * `ngx-toastr`'s `ActiveToast` contract.
 */
export interface ActiveToast {
  toastId: string;
  title?: string;
  message?: string;
  toastRef: NgxMatToastRef;
  /** Emits once when the toast becomes visible. */
  onShown: Observable<void>;
  /** Emits every time the user taps / clicks the toast. */
  onTap: Observable<void>;
}
