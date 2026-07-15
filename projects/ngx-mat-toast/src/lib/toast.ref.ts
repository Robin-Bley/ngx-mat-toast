import type { Observable } from 'rxjs';
import { NEVER } from 'rxjs';

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
  /**
   * @deprecated Do not instantiate `NgxMatToastRef` directly. Use `NgxMatToastService` methods (success/error/info/...) to obtain a ref.
   * This overload is kept only for backward compatibility with legacy code that passed a service-like object.
   */
  constructor(
    /** The unique ID of the toast. */
    id: string,
    /** A service object with a dismiss(id) method (for backward compatibility). */
    service?: { dismiss(id: string): void },
  );
  // Implementation
  constructor(
    /** The unique ID of the toast. */
    public readonly id: string,
    private _dismissed$?: Observable<void> | { dismiss(id: string): void },
    private _shown$?: Observable<void>,
    private _tapped$?: Observable<void>,
    private _dismissFn?: () => void,
  ) {
    // Handle backward-compatible constructor with service object
    if (
      this._dismissed$ &&
      typeof this._dismissed$ === 'object' &&
      'dismiss' in this._dismissed$ &&
      !('subscribe' in this._dismissed$)
    ) {
      const service: { dismiss(id: string): void } = this._dismissed$ as { dismiss(id: string): void };
      this._dismissFn = (): void => service.dismiss(id);
      this._dismissed$ = undefined;
      this._shown$ = undefined;
      this._tapped$ = undefined;
    }
  }

  /**
   * @internal
   * Sets up lifecycle observables and dismiss function for the toast.
   * Used internally by NgxMatToastService to wire lifecycle events.
   */
  public _setupLifecycle(
    dismissed$: Observable<void>,
    shown$: Observable<void>,
    tapped$: Observable<void>,
    dismissFn: () => void,
  ): void {
    this._dismissed$ = dismissed$ as Observable<void> | { dismiss(id: string): void };
    this._shown$ = shown$;
    this._tapped$ = tapped$;
    this._dismissFn = dismissFn;
  }

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
    if (this._dismissed$ && typeof this._dismissed$ === 'object' && 'subscribe' in this._dismissed$) {
      return this._dismissed$ as Observable<void>;
    }
    return NEVER;
  }

  /**
   * Returns an Observable that emits once when the toast becomes visible.
   *
   * Note: subscribe immediately after calling `show()` / `success()` / etc.
   * to avoid missing the first emission.
   */
  public onShown(): Observable<void> {
    return this._shown$ ?? NEVER;
  }

  /**
   * Returns an Observable that emits every time the user taps / clicks the toast.
   */
  public onTap(): Observable<void> {
    return this._tapped$ ?? NEVER;
  }
}
