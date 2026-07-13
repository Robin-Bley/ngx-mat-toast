/*
 * Public API Surface of ngx-mat-toast/toastr-adapter
 *
 * Secondary entry point for the ngx-toastr compatibility layer.
 * Consumers who do not need the ToastrService adapter can import
 * from the primary entry point ('ngx-mat-toast') without pulling
 * in this code.
 *
 * @example
 * ```ts
 * import { ToastrService } from 'ngx-mat-toast/toastr-adapter';
 * ```
 */

export { ToastrService, mapNgxToastrConfigToNgxMatToastConfig } from 'ngx-mat-toast';
export type { ToastrPositionClass, ActiveToast, IndividualConfig } from 'ngx-mat-toast';
