import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { MatSnackBar, type MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import {
  DEFAULT_TOAST_CONFIG,
  type NgxMatToastConfig,
  type NgxMatToastOptions,
} from './toast.config';
import { NGX_MAT_TOAST_CONFIG } from './toast-config.token';
import type { ToastData } from './toast.model';
import { NgxMatToastRef } from './toast.ref';
import type { ToastType } from './toast.types';
import type { ToastPosition } from './toast-position';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import type { ToastOutletData } from './toast-container/toast-outlet-data';

let nextToastId: number = 0;

function createToastId(): string {
  nextToastId += 1;
  return `ngx-mat-toast-${nextToastId}`;
}

function positionsMatch(a: ToastPosition, b: ToastPosition): boolean {
  return a.horizontal === b.horizontal && a.vertical === b.vertical;
}

/**
 * Encapsulates the state of the active Material snackbar outlet so that the
 * three previously separate fields (`outletRef`, `outletPosition`, `outletOpened`)
 * live together as a single nullable object.
 */
interface OutletState {
  ref: MatSnackBarRef<ToastContainerComponent>;
  position: ToastPosition;
  fullWidth: boolean;
  opened: boolean;
}

function outletMatchesRequest(
  state: OutletState,
  position: ToastPosition,
  fullWidth: boolean,
): boolean {
  return positionsMatch(state.position, position) && state.fullWidth === fullWidth;
}

function resolveToastConfig(...configs: Array<NgxMatToastOptions | undefined>): NgxMatToastConfig {
  let resolved: NgxMatToastConfig = {
    ...DEFAULT_TOAST_CONFIG,
    position: { ...DEFAULT_TOAST_CONFIG.position },
  };

  for (const config of configs) {
    if (!config) {
      continue;
    }

    resolved = {
      ...resolved,
      ...config,
      position: {
        ...resolved.position,
        ...config.position,
      },
    };
  }

  return resolved;
}

/**
 * Primary service for displaying toast notifications.
 *
 * Internally the library uses Angular Material `MatSnackBar` as a host outlet, while
 * rendering a stack of rich toast cards inside that snackbar so the API stays as simple
 * as `ngx-toastr`.
 */
@Injectable({ providedIn: 'root' })
export class NgxMatToastService {
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly globalConfig: NgxMatToastOptions =
    inject(NGX_MAT_TOAST_CONFIG, { optional: true }) ?? {};

  private readonly _toasts: WritableSignal<ToastData[]> = signal<ToastData[]>([]);

  public readonly toasts: Signal<ToastData[]> = this._toasts.asReadonly();

  private outlet: OutletState | null = null;
  private readonly activeRefs: Map<string, NgxMatToastRef> = new Map<string, NgxMatToastRef>();
  private readonly dismissTimers: Map<string, ReturnType<typeof setTimeout>> = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  public success(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'success', title, config);
  }

  public error(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'error', title, config);
  }

  public warning(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'warning', title, config);
  }

  public info(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'info', title, config);
  }

  public show(
    message: string,
    type: ToastType = 'info',
    title?: string,
    config?: NgxMatToastOptions,
  ): NgxMatToastRef {
    const resolvedConfig: NgxMatToastConfig = resolveToastConfig(this.globalConfig, config);

    if (resolvedConfig.enableDebug) {
      console.debug('[ngx-mat-toast]', { message, title, type, config: resolvedConfig });
    }

    if (resolvedConfig.preventDuplicates) {
      const duplicateToast: ToastData | undefined = this._toasts().find(
        (toast: ToastData) =>
          toast.message === message && toast.title === title && toast.type === type,
      );

      if (duplicateToast) {
        const duplicateRef: NgxMatToastRef | undefined = this.activeRefs.get(duplicateToast.id);
        if (duplicateRef) {
          return duplicateRef;
        }
      }
    }

    if (resolvedConfig.maxToasts > 0) {
      while (this._toasts().length >= resolvedConfig.maxToasts) {
        const oldestToast: ToastData | undefined = this._toasts()[0];
        if (!oldestToast) {
          break;
        }
        this.removeToast(oldestToast.id);
      }
    }

    const id: string = createToastId();
    const isVisible: boolean = this.canShowToastImmediately(
      resolvedConfig.position,
      resolvedConfig.fullWidth,
    );
    const toast: ToastData = {
      id,
      message,
      title,
      type,
      config: resolvedConfig,
      createdAt: Date.now(),
      isVisible,
    };

    const ref: NgxMatToastRef = new NgxMatToastRef(id, this);
    this.activeRefs.set(id, ref);

    this._toasts.update((current: ToastData[]) => [...current, toast]);

    if (toast.isVisible) {
      this.scheduleDismiss(toast);
      ref._notifyShown();
    }

    this.ensureOutlet(resolvedConfig.position, resolvedConfig.fullWidth);

    return ref;
  }

  public dismiss(id: string): boolean {
    if (!this.activeRefs.has(id)) {
      return false;
    }

    this.removeToast(id);
    return true;
  }

  public clear(): void {
    const ids: string[] = this._toasts().map((toast: ToastData) => toast.id);
    for (const id of ids) {
      this.removeToast(id);
    }
  }

  private removeToast(id: string): void {
    const timer: ReturnType<typeof setTimeout> | undefined = this.dismissTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.dismissTimers.delete(id);
    }

    this._toasts.update((current: ToastData[]) =>
      current.filter((toast: ToastData) => toast.id !== id),
    );

    const ref: NgxMatToastRef | undefined = this.activeRefs.get(id);
    if (ref) {
      ref._notifyDismissed();
      this.activeRefs.delete(id);
    }

    if (this._toasts().length === 0) {
      this.destroyOutlet();
    }
  }

  private handleTap(id: string): void {
    const ref: NgxMatToastRef | undefined = this.activeRefs.get(id);
    if (ref) {
      ref._notifyTapped();
    }
  }

  private ensureOutlet(position: ToastPosition, fullWidth: boolean): void {
    if (this.outlet && outletMatchesRequest(this.outlet, position, fullWidth)) {
      return;
    }

    if (this.outlet) {
      const previousRef: MatSnackBarRef<ToastContainerComponent> = this.outlet.ref;
      this.outlet = null;
      previousRef.dismiss();
    }

    const data: ToastOutletData = {
      toasts: this._toasts.asReadonly(),
      dismiss: (id: string) => this.removeToast(id),
      tap: (id: string) => this.handleTap(id),
      position,
      fullWidth,
    };

    const panelClasses: string[] = ['ngx-mat-toast-snack-panel'];
    if (fullWidth) {
      panelClasses.push('ngx-mat-toast-snack-panel--full-width');
    }

    const config: MatSnackBarConfig<ToastOutletData> = {
      data,
      duration: 0,
      horizontalPosition: position.horizontal,
      verticalPosition: position.vertical,
      panelClass: panelClasses,
    };

    const outletRef: MatSnackBarRef<ToastContainerComponent> = this.snackBar.openFromComponent(
      ToastContainerComponent,
      config,
    );

    this.outlet = { ref: outletRef, position, fullWidth, opened: false };

    outletRef.afterOpened().subscribe((): void => {
      if (this.outlet?.ref === outletRef) {
        this.outlet.opened = true;
        this.revealPendingToasts();
      }
    });

    outletRef.afterDismissed().subscribe((): void => {
      if (this.outlet?.ref === outletRef) {
        this.outlet = null;
      }
    });
  }

  private canShowToastImmediately(position: ToastPosition, fullWidth: boolean): boolean {
    return (
      this.outlet !== null &&
      this.outlet.opened &&
      outletMatchesRequest(this.outlet, position, fullWidth)
    );
  }

  private revealPendingToasts(): void {
    const pendingToasts: ToastData[] = this._toasts().filter(
      (toast: ToastData) => !toast.isVisible,
    );

    if (pendingToasts.length === 0) {
      return;
    }

    this._toasts.update((current: ToastData[]) =>
      current.map((toast: ToastData) => (toast.isVisible ? toast : { ...toast, isVisible: true })),
    );

    for (const toast of pendingToasts) {
      this.scheduleDismiss(toast);
      const ref: NgxMatToastRef | undefined = this.activeRefs.get(toast.id);
      if (ref) {
        ref._notifyShown();
      }
    }
  }

  private scheduleDismiss(toast: ToastData): void {
    if (toast.config.duration <= 0 || this.dismissTimers.has(toast.id)) {
      return;
    }

    const timer: ReturnType<typeof setTimeout> = setTimeout(
      (): void => this.removeToast(toast.id),
      toast.config.duration,
    );
    this.dismissTimers.set(toast.id, timer);
  }

  private destroyOutlet(): void {
    if (!this.outlet) {
      return;
    }

    const outletRef: MatSnackBarRef<ToastContainerComponent> = this.outlet.ref;
    this.outlet = null;
    outletRef.dismiss();
  }
}
