/*
 * Public API Surface of ngx-mat-toast/toastr-adapter
 *
 * Secondary entry point for the ngx-toastr compatibility layer.
 * This entry point enables better tree-shaking by providing
 * a dedicated export for the ToastrService adapter.
 * While the primary entry point may also export the adapter
 * for backward compatibility, using this entry point allows
 * bundlers to more effectively exclude adapter code if unused.
 *
 * @example
 * ```ts
 * import { ToastrService } from 'ngx-mat-toast/toastr-adapter';
 * ```
 */

export { ToastrService, mapNgxToastrConfigToNgxMatToastConfig } from '../../src/lib/toastr.service';
export type { ToastrPositionClass } from '../../src/lib/toastr.types';
export type { ActiveToast } from '../../src/lib/active-toast';
export type { IndividualConfig } from '../../src/lib/individual-config';
