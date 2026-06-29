import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, type MatSnackBarConfig } from '@angular/material/snack-bar';
import {
  DEFAULT_TOAST_CONFIG,
  type NgxMatToastConfig,
  type NgxMatToastOptions,
} from './toast.config';
import { NGX_MAT_TOAST_CONFIG } from './toast-config.token';
import type { ToastData } from './toast.model';
import { NgxMatToastRef } from './toast.ref';
import type { ToastPosition, ToastType } from './toast.types';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import type { ToastOutletData } from './toast-container/toast-outlet-data';

let nextToastId: number = 0;

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
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly globalConfig: NgxMatToastOptions =
    inject(NGX_MAT_TOAST_CONFIG, { optional: true }) ?? {};

  /** @internal Reactive list of active toasts used by the outlet component. */
  public readonly _toasts: WritableSignal<ToastData[]> = signal<ToastData[]>([]);

  private outletRef: MatSnackBarRef<ToastContainerComponent> | null = null;
  private outletPosition: ToastPosition | null = null;
  private outletOpened: boolean = false;
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
    const toast: ToastData = {
      id,
      message,
      title,
      type,
      config: resolvedConfig,
      createdAt: Date.now(),
      isVisible: this.canShowToastImmediately(resolvedConfig.position),
    };

    const ref: NgxMatToastRef = new NgxMatToastRef(id, this);
    this.activeRefs.set(id, ref);

    this._toasts.update((current: ToastData[]) => [...current, toast]);

    if (toast.isVisible) {
      this.scheduleDismiss(toast);
    }

    this.ensureOutlet(resolvedConfig.position);

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

  private ensureOutlet(position: ToastPosition): void {
    if (this.outletRef && positionsMatch(this.outletPosition, position)) {
      return;
    }

    if (this.outletRef) {
      const previousRef: MatSnackBarRef<ToastContainerComponent> = this.outletRef;
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

    const outletRef: MatSnackBarRef<ToastContainerComponent> = this.snackBar.openFromComponent(
      ToastContainerComponent,
      config,
    );
    this.outletRef = outletRef;
    this.outletPosition = position;
    this.outletOpened = false;

    outletRef.afterOpened().subscribe((): void => {
      if (this.outletRef === outletRef) {
        this.outletOpened = true;
        this.revealPendingToasts();
      }
    });

    outletRef.afterDismissed().subscribe((): void => {
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
    if (!this.outletRef) {
      return;
    }

    const outletRef: MatSnackBarRef<ToastContainerComponent> = this.outletRef;
    this.outletRef = null;
    this.outletPosition = null;
    this.outletOpened = false;
    outletRef.dismiss();
  }
}
