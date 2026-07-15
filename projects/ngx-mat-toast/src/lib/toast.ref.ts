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
 *
 * // React when the user taps the toast
 * ref.onTap().subscribe(() => console.log('Toast tapped!'));
 *
 * // React once the toast becomes visible
 * ref.onShown().subscribe(() => console.log('Toast is visible!'));
 * ```
 */
export class NgxMatToastRef {
  private readonly _dismissed$: Subject<void> = new Subject<void>();
  private readonly _tapped$: Subject<void> = new Subject<void>();
  private readonly _shown$: Subject<void> = new Subject<void>();

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
   * Returns an Observable that emits each time the user taps or clicks the toast.
   * Completes when the toast is dismissed.
   */
  public onTap(): Observable<void> {
    return this._tapped$.asObservable();
  }

  /**
   * Returns an Observable that emits once when the toast first becomes visible
   * (i.e. after the snackbar outlet has finished its opening animation).
   */
  public onShown(): Observable<void> {
    return this._shown$.asObservable();
  }

  /**
   * @internal Called by the service when the toast is removed.
   */
  public _notifyDismissed(): void {
    this._dismissed$.next();
    this._dismissed$.complete();
    this._tapped$.complete();
    this._shown$.complete();
  }

  /**
   * @internal Called by the service when the user taps the toast.
   */
  public _notifyTapped(): void {
    this._tapped$.next();
  }

  /**
   * @internal Called by the service when the toast first becomes visible.
   */
  public _notifyShown(): void {
    this._shown$.next();
    this._shown$.complete();
  }
}
