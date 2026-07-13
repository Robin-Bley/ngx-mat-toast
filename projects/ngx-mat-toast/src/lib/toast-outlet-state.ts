import type { MatSnackBarRef } from '@angular/material/snack-bar';
import type { ToastPosition } from './toast-position';
import type { ToastContainerComponent } from './toast-container/toast-container.component';

/** @internal Consolidated state of the snackbar outlet. */
export interface ToastOutletState {
  ref: MatSnackBarRef<ToastContainerComponent>;
  position: ToastPosition;
  fullWidth: boolean;
  isOpen: boolean;
}
