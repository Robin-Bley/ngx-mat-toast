import { Injectable, inject } from '@angular/core';
import type { NgxMatToastOptions } from './toast.config';
import { NgxMatToastService } from './ngx-mat-toast.service';
import { NgxMatToastRef } from './toast.ref';
import type { ToastType } from './toast.types';
import type { ToastPosition } from './toast-position';
import type { ToastrPositionClass } from './toastr.types';
import type { ActiveToast } from './active-toast';
import type { IndividualConfig } from './individual-config';

const POSITION_CLASS_MAP: Record<ToastrPositionClass, ToastPosition> = {
  'toast-top-left': { horizontal: 'start', vertical: 'top' },
  'toast-top-center': { horizontal: 'center', vertical: 'top' },
  'toast-top-right': { horizontal: 'end', vertical: 'top' },
  'toast-top-full-width': { horizontal: 'center', vertical: 'top' },
  'toast-bottom-left': { horizontal: 'start', vertical: 'bottom' },
  'toast-bottom-center': { horizontal: 'center', vertical: 'bottom' },
  'toast-bottom-right': { horizontal: 'end', vertical: 'bottom' },
  'toast-bottom-full-width': { horizontal: 'center', vertical: 'bottom' },
};

/** Position classes that should also enable the `fullWidth` layout option. */
const FULL_WIDTH_POSITION_CLASSES: ReadonlySet<ToastrPositionClass> = new Set<ToastrPositionClass>([
  'toast-top-full-width',
  'toast-bottom-full-width',
]);

function normalizeType(type?: string): ToastType {
  switch (type) {
    case 'success':
    case 'toast-success':
      return 'success';
    case 'error':
    case 'toast-error':
      return 'error';
    case 'warning':
    case 'toast-warning':
      return 'warning';
    case 'info':
    case 'toast-info':
    default:
      return 'info';
  }
}

function mapCompatConfig(config?: Partial<IndividualConfig>): NgxMatToastOptions {
  if (!config) {
    return {};
  }

  const isFullWidth: boolean =
    !!config.positionClass && FULL_WIDTH_POSITION_CLASSES.has(config.positionClass);

  const result: NgxMatToastOptions = {};

  if (config.disableTimeOut === true || config.disableTimeOut === 'timeOut') {
    result.duration = 0;
  } else if (config.timeOut !== undefined) {
    result.duration = config.timeOut;
  }

  if (config.closeButton !== undefined) {
    result.closeable = config.closeButton;
  }

  if (config.progressBar !== undefined) {
    result.progressBar = config.progressBar;
  }

  if (config.tapToDismiss !== undefined) {
    result.tapToDismiss = config.tapToDismiss;
  }

  if (config.preventDuplicates !== undefined) {
    result.preventDuplicates = config.preventDuplicates;
  }

  if (config.maxOpened !== undefined) {
    result.maxToasts = config.maxOpened;
  }

  if (config.progressAnimation !== undefined) {
    result.progressBarDirection = config.progressAnimation;
  }

  if (config.positionClass) {
    result.position = POSITION_CLASS_MAP[config.positionClass];
  }

  if (isFullWidth) {
    result.fullWidth = true;
  }

  return result;
}

/**
 * Minimal compatibility adapter for projects migrating from `ngx-toastr`.
 *
 * This allows many existing `ToastrService` call sites to continue working after
 * switching imports from `ngx-toastr` to `ngx-mat-toast`.
 */
@Injectable({ providedIn: 'root' })
export class ToastrService {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public success(
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>,
  ): ActiveToast {
    return this.createActiveToast(
      this.toast.success(message ?? '', title, mapCompatConfig(override)),
      message,
      title,
    );
  }

  public error(
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>,
  ): ActiveToast {
    return this.createActiveToast(
      this.toast.error(message ?? '', title, mapCompatConfig(override)),
      message,
      title,
    );
  }

  public info(message?: string, title?: string, override?: Partial<IndividualConfig>): ActiveToast {
    return this.createActiveToast(
      this.toast.info(message ?? '', title, mapCompatConfig(override)),
      message,
      title,
    );
  }

  public warning(
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>,
  ): ActiveToast {
    return this.createActiveToast(
      this.toast.warning(message ?? '', title, mapCompatConfig(override)),
      message,
      title,
    );
  }

  public show(
    message?: string,
    title?: string,
    override?: Partial<IndividualConfig>,
    type?: string,
  ): ActiveToast {
    return this.createActiveToast(
      this.toast.show(message ?? '', normalizeType(type), title, mapCompatConfig(override)),
      message,
      title,
    );
  }

  public clear(toastId?: string): void {
    if (toastId) {
      this.toast.dismiss(toastId);
      return;
    }

    this.toast.clear();
  }

  public remove(toastId?: string): boolean {
    if (!toastId) {
      this.toast.clear();
      return true;
    }

    return this.toast.dismiss(toastId);
  }

  private createActiveToast(
    toastRef: NgxMatToastRef,
    message?: string,
    title?: string,
  ): ActiveToast {
    return {
      toastId: toastRef.id,
      message,
      title,
      toastRef,
    };
  }
}

export { mapCompatConfig as mapNgxToastrConfigToNgxMatToastConfig };
