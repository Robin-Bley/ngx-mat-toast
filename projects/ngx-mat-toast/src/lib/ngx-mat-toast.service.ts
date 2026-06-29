import { inject, Injectable, signal } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, type MatSnackBarConfig } from '@angular/material/snack-bar';
import { DEFAULT_TOAST_CONFIG, NgxMatToastConfig, NgxMatToastOptions } from './toast.config';
import { NGX_MAT_TOAST_CONFIG } from './toast-config.token';
import { ToastData } from './toast.model';
import { NgxMatToastRef } from './toast.ref';
import { ToastPosition, ToastType } from './toast.types';
import {
  ToastContainerComponent,
  type ToastOutletData,
} from './toast-container/toast-container.component';

let nextToastId = 0;

function createToastId(): string {
  nextToastId += 1;
  return `ngx-mat-toast-${nextToastId}`;
}

function positionsMatch(a: ToastPosition | null, b: ToastPosition): boolean {
  return a?.horizontal === b.horizontal && a?.vertical === b.vertical;
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
  private readonly snackBar = inject(MatSnackBar);
  private readonly globalConfig = inject(NGX_MAT_TOAST_CONFIG, { optional: true }) ?? {};

  /** @internal Reactive list of active toasts used by the outlet component. */
  readonly _toasts = signal<ToastData[]>([]);

  private outletRef: MatSnackBarRef<ToastContainerComponent> | null = null;
  private outletPosition: ToastPosition | null = null;
  private outletOpened = false;
  private readonly activeRefs = new Map<string, NgxMatToastRef>();
  private readonly dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

  success(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'success', title, config);
  }

  error(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'error', title, config);
  }

  warning(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'warning', title, config);
  }

  info(message: string, title?: string, config?: NgxMatToastOptions): NgxMatToastRef {
    return this.show(message, 'info', title, config);
  }

  show(
    message: string,
    type: ToastType = 'info',
    title?: string,
    config?: NgxMatToastOptions,
  ): NgxMatToastRef {
    const resolvedConfig = resolveToastConfig(this.globalConfig, config);

    if (resolvedConfig.enableDebug) {
      console.debug('[ngx-mat-toast]', { message, title, type, config: resolvedConfig });
    }

    if (resolvedConfig.preventDuplicates) {
      const duplicateToast = this._toasts().find(
        (toast) => toast.message === message && toast.title === title && toast.type === type,
      );

      if (duplicateToast) {
        const duplicateRef = this.activeRefs.get(duplicateToast.id);
        if (duplicateRef) {
          return duplicateRef;
        }
      }
    }

    if (resolvedConfig.maxToasts > 0) {
      while (this._toasts().length >= resolvedConfig.maxToasts) {
        const oldestToast = this._toasts()[0];
        if (!oldestToast) {
          break;
        }
        this.removeToast(oldestToast.id);
      }
    }

    const id = createToastId();
    const toast: ToastData = {
      id,
      message,
      title,
      type,
      config: resolvedConfig,
      createdAt: Date.now(),
      isVisible: this.canShowToastImmediately(resolvedConfig.position),
    };

    const ref = new NgxMatToastRef(id, this);
    this.activeRefs.set(id, ref);

    this._toasts.update((current) => [...current, toast]);

    if (toast.isVisible) {
      this.scheduleDismiss(toast);
    }

    this.ensureOutlet(resolvedConfig.position);

    return ref;
  }

  dismiss(id: string): boolean {
    if (!this.activeRefs.has(id)) {
      return false;
    }

    this.removeToast(id);
    return true;
  }

  clear(): void {
    const ids = this._toasts().map((toast) => toast.id);
    for (const id of ids) {
      this.removeToast(id);
    }
  }

  private removeToast(id: string): void {
    const timer = this.dismissTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.dismissTimers.delete(id);
    }

    this._toasts.update((current) => current.filter((toast) => toast.id !== id));

    const ref = this.activeRefs.get(id);
    if (ref) {
      ref._notifyDismissed();
      this.activeRefs.delete(id);
    }

    if (this._toasts().length === 0) {
      this.destroyOutlet();
    }
  }

  private ensureOutlet(position: ToastPosition): void {
    if (this.outletRef && positionsMatch(this.outletPosition, position)) {
      return;
    }

    if (this.outletRef) {
      const previousRef = this.outletRef;
      this.outletRef = null;
      this.outletPosition = null;
      this.outletOpened = false;
      previousRef.dismiss();
    }

    const data: ToastOutletData = {
      toasts: this._toasts.asReadonly(),
      dismiss: (id: string) => this.removeToast(id),
      position,
    };

    const config: MatSnackBarConfig<ToastOutletData> = {
      data,
      duration: 0,
      horizontalPosition: position.horizontal,
      verticalPosition: position.vertical,
      panelClass: ['ngx-mat-toast-snack-panel'],
    };

    const outletRef = this.snackBar.openFromComponent(ToastContainerComponent, config);
    this.outletRef = outletRef;
    this.outletPosition = position;
    this.outletOpened = false;

    outletRef.afterOpened().subscribe(() => {
      if (this.outletRef === outletRef) {
        this.outletOpened = true;
        this.revealPendingToasts();
      }
    });

    outletRef.afterDismissed().subscribe(() => {
      if (this.outletRef === outletRef) {
        this.outletRef = null;
        this.outletPosition = null;
        this.outletOpened = false;
      }
    });
  }

  private canShowToastImmediately(position: ToastPosition): boolean {
    return !!this.outletRef && positionsMatch(this.outletPosition, position) && this.outletOpened;
  }

  private revealPendingToasts(): void {
    const pendingToasts = this._toasts().filter((toast) => !toast.isVisible);

    if (pendingToasts.length === 0) {
      return;
    }

    this._toasts.update((current) =>
      current.map((toast) => (toast.isVisible ? toast : { ...toast, isVisible: true })),
    );

    for (const toast of pendingToasts) {
      this.scheduleDismiss(toast);
    }
  }

  private scheduleDismiss(toast: ToastData): void {
    if (toast.config.duration <= 0 || this.dismissTimers.has(toast.id)) {
      return;
    }

    const timer = setTimeout(() => this.removeToast(toast.id), toast.config.duration);
    this.dismissTimers.set(toast.id, timer);
  }

  private destroyOutlet(): void {
    if (!this.outletRef) {
      return;
    }

    const outletRef = this.outletRef;
    this.outletRef = null;
    this.outletPosition = null;
    this.outletOpened = false;
    outletRef.dismiss();
  }
}
