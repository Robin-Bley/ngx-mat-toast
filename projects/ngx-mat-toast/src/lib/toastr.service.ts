import { Injectable, inject } from '@angular/core';
import type { NgxMatToastOptions } from './toast.config';
import { NgxMatToastService } from './ngx-mat-toast.service';
import { NgxMatToastRef } from './toast.ref';
import type { ToastType } from './toast.types';
import type { ToastPosition } from './toast-position';
import type { ToastrPositionClass } from './toastr.types';
import type { ActiveToast } from './active-toast';
import type { IndividualConfig } from './individual-config';
import type { PositionMapping } from './position-mapping';

const POSITION_CLASS_MAP: Record<ToastrPositionClass, PositionMapping> = {
  'toast-top-left': { position: { horizontal: 'start', vertical: 'top' }, fullWidth: false },
  'toast-top-center': { position: { horizontal: 'center', vertical: 'top' }, fullWidth: false },
  'toast-top-right': { position: { horizontal: 'end', vertical: 'top' }, fullWidth: false },
  'toast-top-full-width': {
    position: { horizontal: 'center', vertical: 'top' },
    fullWidth: true,
  },
  'toast-bottom-left': {
    position: { horizontal: 'start', vertical: 'bottom' },
    fullWidth: false,
  },
  'toast-bottom-center': {
    position: { horizontal: 'center', vertical: 'bottom' },
    fullWidth: false,
  },
  'toast-bottom-right': {
    position: { horizontal: 'end', vertical: 'bottom' },
    fullWidth: false,
  },
  'toast-bottom-full-width': {
    position: { horizontal: 'center', vertical: 'bottom' },
    fullWidth: true,
  },
};

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

  const mapping: PositionMapping | undefined = config.positionClass
    ? POSITION_CLASS_MAP[config.positionClass]
    : undefined;

  return {
    duration: config.disableTimeOut ? 0 : config.timeOut,
    closeable: config.closeButton,
    progressBar: config.progressBar,
    tapToDismiss: config.tapToDismiss,
    preventDuplicates: config.preventDuplicates,
    maxToasts: config.maxOpened,
    progressBarDirection: config.progressAnimation,
    position: mapping?.position,
    fullWidth: mapping?.fullWidth,
  };
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
      onShown: toastRef.onShown(),
      onTap: toastRef.onTap(),
    };
  }
}

export { mapCompatConfig as mapNgxToastrConfigToNgxMatToastConfig };
