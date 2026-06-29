import { Subject, Observable } from 'rxjs';
import { NgxMatToastService } from './ngx-mat-toast.service';

/**
 * A reference to an active toast notification.
 * Provides methods to programmatically control and observe the toast's lifecycle.
 *
 * @example
 * ```ts
 * const ref = this.toastService.success('File saved!');
 *
 * // Dismiss after 1 second
 * setTimeout(() => ref.dismiss(), 1000);
 *
 * // React when dismissed
 * ref.afterDismissed().subscribe(() => console.log('Toast gone!'));
 * ```
 */
export class NgxMatToastRef {
  private readonly _dismissed$: Subject<void> = new Subject<void>();

  constructor(
    /** The unique ID of the toast. */
    public readonly id: string,
    private readonly _service: NgxMatToastService,
  ) {}

  /**
   * Programmatically dismiss the toast.
   */
  public dismiss(): void {
    this._service.dismiss(this.id);
  }

  /**
   * Returns an Observable that emits once when the toast is dismissed.
   */
  public afterDismissed(): Observable<void> {
    return this._dismissed$.asObservable();
  }

  /**
   * @internal Called by the service when the toast is removed.
   */
  public _notifyDismissed(): void {
    this._dismissed$.next();
    this._dismissed$.complete();
  }
}
