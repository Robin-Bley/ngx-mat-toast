/*
 * Public API Surface of ngx-mat-toast
 */

export { NgxMatToastService } from './lib/ngx-mat-toast.service';
export { NgxMatToastRef } from './lib/toast.ref';
export type { NgxMatToastConfig, NgxMatToastOptions } from './lib/toast.config';
export { DEFAULT_TOAST_CONFIG } from './lib/toast.config';
export type {
  ToastHorizontalPosition,
  ToastType,
  ToastVerticalPosition,
} from './lib/toast.types';
export type { ToastPosition } from './lib/toast-position';
export type { ToastData } from './lib/toast.model';
export { provideNgxMatToast } from './lib/provide-ngx-mat-toast';
export { NgxMatToastModule } from './lib/ngx-mat-toast.module';
export { NGX_MAT_TOAST_CONFIG } from './lib/toast-config.token';

export { ToastrService, mapNgxToastrConfigToNgxMatToastConfig } from './lib/toastr.service';
export type { ToastrPositionClass } from './lib/toastr.types';
export type { ActiveToast } from './lib/active-toast';
export type { IndividualConfig } from './lib/individual-config';
