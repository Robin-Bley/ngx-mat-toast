import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';

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
 * // React when the toast becomes visible
 * ref.onShown().subscribe(() => console.log('Toast is visible!'));
 *
 * // React when the user taps the toast
 * ref.onTap().subscribe(() => console.log('Toast tapped!'));
 * ```
 */
export class NgxMatToastRef {
  /**
   * @internal
   * Overload for backward compatibility. Creates a ref with minimal functionality.
   * Lifecycle observables return EMPTY, and dismiss() is a no-op.
   * Only use when instantiating directly for testing; normal consumers should use
   * the service-provided signature with all lifecycle observables.
   */
  constructor(
    /** The unique ID of the toast. */
    id: string,
  );
  constructor(
    /** The unique ID of the toast. */
    id: string,
    dismissed$: Observable<void>,
    shown$: Observable<void>,
    tapped$: Observable<void>,
    dismissFn: () => void,
  );
  // Implementation
  constructor(
    /** The unique ID of the toast. */
    public readonly id: string,
    private readonly _dismissed$?: Observable<void>,
    private readonly _shown$?: Observable<void>,
    private readonly _tapped$?: Observable<void>,
    private readonly _dismissFn?: () => void,
  ) {}

  /**
   * Programmatically dismiss the toast.
   */
  public dismiss(): void {
    this._dismissFn?.();
  }

  /**
   * Returns an Observable that emits once when the toast is dismissed.
   */
  public afterDismissed(): Observable<void> {
    return this._dismissed$ ?? EMPTY;
  }

  /**
   * Returns an Observable that emits once when the toast becomes visible.
   *
   * Note: subscribe immediately after calling `show()` / `success()` / etc.
   * to avoid missing the first emission.
   */
  public onShown(): Observable<void> {
    return this._shown$ ?? EMPTY;
  }

  /**
   * Returns an Observable that emits every time the user taps / clicks the toast.
   */
  public onTap(): Observable<void> {
    return this._tapped$ ?? EMPTY;
  }
}
