import type { MatSnackBarRef } from '@angular/material/snack-bar';
import type { ToastPosition } from './toast-position';
import type { ToastContainerComponent } from './toast-container/toast-container.component';

/**
 * Encapsulates the state of the active Material snackbar outlet so that the
 * three previously separate fields (`outletRef`, `outletPosition`, `outletOpened`)
 * live together as a single nullable object.
 *
 * @internal
 */
export interface OutletState {
  ref: MatSnackBarRef<ToastContainerComponent>;
  position: ToastPosition;
  fullWidth: boolean;
  opened: boolean;
}
