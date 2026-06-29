import type { ToastrPositionClass } from './toastr.types';

/**
 * Compatibility options for migrating from `ngx-toastr`.
 *
 * Only the most common `ngx-toastr` options are mapped. Unsupported properties are
 * intentionally omitted to keep the adapter predictable.
 */
export interface IndividualConfig {
  timeOut?: number;
  disableTimeOut?: boolean | 'timeOut' | 'extendedTimeOut';
  closeButton?: boolean;
  progressBar?: boolean;
  tapToDismiss?: boolean;
  preventDuplicates?: boolean;
  maxOpened?: number;
  positionClass?: ToastrPositionClass;
  progressAnimation?: 'increasing' | 'decreasing';
}
