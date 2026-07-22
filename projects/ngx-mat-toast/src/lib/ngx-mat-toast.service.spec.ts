import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef, type MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { NgxMatToastService } from './ngx-mat-toast.service';
import { provideNgxMatToast } from './provide-ngx-mat-toast';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import type { ToastOutletData } from './toast-container/toast-outlet-data';
import { TOAST_PROGRESS_UPDATE_INTERVAL_MS } from './toast-progress.constants';
import type { NgxMatToastRef } from './toast.ref';

/**
 * Replaces `snackBar.openFromComponent` with a controllable stub so tests can
 * trigger `afterOpened()` and `afterDismissed()` deterministically, without
 * depending on real animation timing or running into jsdom's overlay limitations.
 */
interface OutletControl {
  triggerOpened(): void;
  triggerDismissed(): void;
  triggerTap(id: string): void;
}

function stubOutlet(snackBar: MatSnackBar): OutletControl[] {
  const controls: OutletControl[] = [];

  vi.spyOn(snackBar, 'openFromComponent').mockImplementation(
    (_component: unknown, config?: unknown): MatSnackBarRef<ToastContainerComponent> => {
      const opened$: Subject<void> = new Subject<void>();
      const dismissed$: Subject<void> = new Subject<void>();

      const stub = {
        afterOpened: (): Subject<void> => opened$,
        afterDismissed: (): Subject<void> => dismissed$,
        dismiss: (): void => {
          dismissed$.next();
          dismissed$.complete();
        },
      } as unknown as MatSnackBarRef<ToastContainerComponent>;

      controls.push({
        triggerOpened: (): void => {
          opened$.next();
          opened$.complete();
        },
        triggerDismissed: (): void => {
          dismissed$.next();
          dismissed$.complete();
        },
        triggerTap: (id: string): void => {
          const configTyped: MatSnackBarConfig<ToastOutletData> | undefined = config as
            MatSnackBarConfig<ToastOutletData> | undefined;
          if (configTyped?.data) {
            configTyped.data.tap(id);
          }
        },
      });

      return stub;
    },
  );

  return controls;
}

describe('NgxMatToastService', () => {
  let service: NgxMatToastService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideNgxMatToast({
          duration: 3000,
          position: { horizontal: 'end', vertical: 'top' },
          maxToasts: 5,
        }),
      ],
    });

    service = TestBed.inject(NgxMatToastService);
    snackBar = TestBed.inject(MatSnackBar);
  });

  afterEach(() => {
    vi.useRealTimers();
    service.clear();
    snackBar.dismiss();
    vi.restoreAllMocks();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('opens the Angular Material snackbar outlet when the first toast is shown', () => {
    const openSpy: ReturnType<typeof vi.spyOn> = vi.spyOn(snackBar, 'openFromComponent');

    service.success('Saved successfully');

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]?.type).toBe('success');
  });

  it('reveals the first toast after the snackbar outlet finishes opening', () => {
    const controls: OutletControl[] = stubOutlet(snackBar);

    service.success('Saved successfully');

    expect(service.toasts()[0]?.isVisible).toBe(false);

    controls[0]?.triggerOpened();

    expect(service.toasts()[0]?.isVisible).toBe(true);
  });

  it('shows additional toasts immediately once the outlet is open', () => {
    const controls: OutletControl[] = stubOutlet(snackBar);

    service.success('First');
    controls[0]?.triggerOpened();

    service.success('Second');

    expect(service.toasts()[0]?.isVisible).toBe(true);
    expect(service.toasts()[1]?.isVisible).toBe(true);
  });

  it('creates success, error, warning, and info toasts', () => {
    service.success('Success');
    service.error('Error');
    service.warning('Warning');
    service.info('Info');

    expect(service.toasts().map((toast) => toast.type)).toEqual([
      'success',
      'error',
      'warning',
      'info',
    ]);
  });

  it('deep merges nested position overrides with the global config', () => {
    service.success('Custom position', 'Toast', {
      position: { vertical: 'bottom' },
    });

    expect(service.toasts()[0]?.config.position).toEqual({
      horizontal: 'end',
      vertical: 'bottom',
    });
  });

  it('returns the existing ref when preventDuplicates is enabled', () => {
    const first: NgxMatToastRef = service.success('Duplicate', undefined, {
      preventDuplicates: true,
    });
    const second: NgxMatToastRef = service.success('Duplicate', undefined, {
      preventDuplicates: true,
    });

    expect(first).toBe(second);
    expect(service.toasts()).toHaveLength(1);
  });

  it('does not treat toasts with different titles as duplicates when preventDuplicates is enabled', () => {
    const first: NgxMatToastRef = service.success('Duplicate', 'First title', {
      preventDuplicates: true,
    });
    const second: NgxMatToastRef = service.success('Duplicate', 'Second title', {
      preventDuplicates: true,
    });

    expect(first).not.toBe(second);
    expect(service.toasts()).toHaveLength(2);
  });

  it('allows duplicates when preventDuplicates is disabled', () => {
    service.success('Duplicate', undefined, { preventDuplicates: false });
    service.success('Duplicate', undefined, { preventDuplicates: false });

    expect(service.toasts()).toHaveLength(2);
  });

  it('removes the oldest toast when maxToasts is exceeded', () => {
    service.success('First', undefined, { maxToasts: 2 });
    service.success('Second', undefined, { maxToasts: 2 });
    service.success('Third', undefined, { maxToasts: 2 });

    expect(service.toasts().map((toast) => toast.message)).toEqual(['Second', 'Third']);
  });

  it('auto-dismisses a toast after its configured duration', () => {
    vi.useFakeTimers();

    const controls: OutletControl[] = stubOutlet(snackBar);

    service.success('Dismiss me', undefined, { duration: 10 });
    expect(service.toasts()).toHaveLength(1);

    controls[0]?.triggerOpened(); // reveal the toast and schedule dismiss(10ms)

    vi.advanceTimersByTime(11);

    expect(service.toasts()).toHaveLength(0);
  });

  it('keeps a progress-bar toast visible until the bar can visually complete', () => {
    vi.useFakeTimers();

    const controls: OutletControl[] = stubOutlet(snackBar);

    service.success('Dismiss me', undefined, {
      duration: 10,
      progressBar: true,
    });
    expect(service.toasts()).toHaveLength(1);

    controls[0]?.triggerOpened();

    vi.advanceTimersByTime(10);

    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(TOAST_PROGRESS_UPDATE_INTERVAL_MS + 1);

    expect(service.toasts()).toHaveLength(0);
  });

  it('keeps persistent toasts open when duration is 0', () => {
    vi.useFakeTimers();

    const controls: OutletControl[] = stubOutlet(snackBar);

    service.info('Persistent', undefined, { duration: 0 });

    controls[0]?.triggerOpened();

    vi.advanceTimersByTime(5000);

    expect(service.toasts()).toHaveLength(1);
  });

  it('dismisses a toast by id and notifies its ref', () => {
    const ref: NgxMatToastRef = service.success('Dismiss me');
    const dismissedSpy = vi.fn();

    ref.afterDismissed().subscribe(dismissedSpy);

    expect(service.dismiss(ref.id)).toBe(true);
    expect(service.dismiss('missing-id')).toBe(false);
    expect(dismissedSpy).toHaveBeenCalledTimes(1);
    expect(service.toasts()).toHaveLength(0);
  });

  it('completes the dismissal stream when a toast is removed', () => {
    const ref: NgxMatToastRef = service.success('Dismiss me');
    let nextCalls: number = 0;
    let completeCalls: number = 0;
    const handleNext: () => void = (): void => {
      nextCalls += 1;
    };
    const handleComplete: () => void = (): void => {
      completeCalls += 1;
    };

    ref.afterDismissed().subscribe(handleNext, undefined, handleComplete);

    service.dismiss(ref.id);

    expect(nextCalls).toBe(1);
    expect(completeCalls).toBe(1);
  });

  it('clears all active toasts', () => {
    service.success('One');
    service.error('Two');
    service.warning('Three');

    service.clear();

    expect(service.toasts()).toHaveLength(0);
  });

  it('reopens the snackbar outlet when the requested position changes', () => {
    const openSpy: ReturnType<typeof vi.spyOn> = vi.spyOn(snackBar, 'openFromComponent');

    service.success('Top right');
    service.success('Bottom left', undefined, {
      position: { horizontal: 'start', vertical: 'bottom' },
    });

    expect(openSpy).toHaveBeenCalledTimes(2);
  });

  it('reopens the snackbar outlet when fullWidth changes', () => {
    const openSpy: ReturnType<typeof vi.spyOn> = vi.spyOn(snackBar, 'openFromComponent');

    service.success('Normal width');
    service.success('Full width', undefined, { fullWidth: true });

    expect(openSpy).toHaveBeenCalledTimes(2);
  });

  it('notifies the ref via onTap() when the service receives a tap event', () => {
    const controls: OutletControl[] = stubOutlet(snackBar);

    const ref: NgxMatToastRef = service.success('Tap me');
    const tappedSpy = vi.fn();
    ref.onTap().subscribe(tappedSpy);

    controls[0]?.triggerOpened();

    // Simulate a tap via the outlet's tap callback
    controls[0]?.triggerTap(ref.id);

    // Verify the tap was received
    expect(tappedSpy).toHaveBeenCalledTimes(1);
  });

  it('notifies the ref via onShown() when a toast transitions from pending to visible', () => {
    const controls: OutletControl[] = stubOutlet(snackBar);

    const ref: NgxMatToastRef = service.success('Pending');
    const shownSpy = vi.fn();
    ref.onShown().subscribe(shownSpy);

    expect(shownSpy).not.toHaveBeenCalled();

    controls[0]?.triggerOpened();

    expect(shownSpy).toHaveBeenCalledTimes(1);
  });

  it('notifies onShown() for a toast created when the outlet is already open', () => {
    const controls: OutletControl[] = stubOutlet(snackBar);

    service.success('First');
    controls[0]?.triggerOpened();

    // Second toast is immediately visible; when outlet is already open,
    // _notifyShown() fires synchronously during show() before the caller can subscribe.
    // With ReplaySubject(1), late subscribers still receive the emission.
    const ref: NgxMatToastRef = service.success('Second — immediately visible');
    const shownSpy = vi.fn();
    // Subscribing after the notification: ReplaySubject replays the single emission
    ref.onShown().subscribe(shownSpy);
    expect(shownSpy).toHaveBeenCalledTimes(1); // late subscriber receives the replayed emission
  });
});
