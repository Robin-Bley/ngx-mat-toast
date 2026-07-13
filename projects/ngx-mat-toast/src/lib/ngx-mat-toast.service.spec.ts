import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { NgxMatToastService } from './ngx-mat-toast.service';
import { provideNgxMatToast } from './provide-ngx-mat-toast';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import type { NgxMatToastRef } from './toast.ref';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockOutletRef(): {
  fakeRef: MatSnackBarRef<ToastContainerComponent>;
  triggerOpened: () => void;
  triggerDismissed: () => void;
} {
  const afterOpened$: Subject<void> = new Subject<void>();
  const afterDismissed$: Subject<void> = new Subject<void>();

  const fakeRef: MatSnackBarRef<ToastContainerComponent> = {
    afterOpened: (): Subject<void> => afterOpened$,
    afterDismissed: (): Subject<void> => afterDismissed$,
    dismiss: vi.fn((): void => {
      afterDismissed$.next();
      afterDismissed$.complete();
    }),
  } as unknown as MatSnackBarRef<ToastContainerComponent>;

  return {
    fakeRef,
    triggerOpened: (): void => afterOpened$.next(),
    triggerDismissed: (): void => {
      afterDismissed$.next();
      afterDismissed$.complete();
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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
    const mock = createMockOutletRef();
    vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(mock.fakeRef);

    service.success('Saved successfully');

    expect(service.toasts()[0]?.isVisible).toBe(false);

    mock.triggerOpened();

    expect(service.toasts()[0]?.isVisible).toBe(true);
  });

  it('shows additional toasts immediately once the outlet is open', () => {
    const mock = createMockOutletRef();
    vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(mock.fakeRef);

    service.success('First');
    mock.triggerOpened();

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

    const mock = createMockOutletRef();
    vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(mock.fakeRef);

    service.success('Dismiss me', undefined, { duration: 100 });
    mock.triggerOpened();

    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(150);

    expect(service.toasts()).toHaveLength(0);
  });

  it('keeps persistent toasts open when duration is 0', () => {
    vi.useFakeTimers();

    const mock = createMockOutletRef();
    vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(mock.fakeRef);

    service.info('Persistent', undefined, { duration: 0 });
    mock.triggerOpened();

    vi.advanceTimersByTime(10_000);

    expect(service.toasts()).toHaveLength(1);
  });

  it('dismisses a toast by id and notifies its ref', () => {
    const ref: NgxMatToastRef = service.success('Dismiss me');
    const dismissedSpy: () => void = vi.fn();

    ref.afterDismissed().subscribe((): void => dismissedSpy());

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

    ref.afterDismissed().subscribe({ next: handleNext, complete: handleComplete });

    service.dismiss(ref.id);

    expect(nextCalls).toBe(1);
    expect(completeCalls).toBe(1);
  });

  it('emits onTap when the outlet data tapped callback is invoked', () => {
    const mock = createMockOutletRef();
    vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(mock.fakeRef);

    const ref: NgxMatToastRef = service.success('Tap me');
    const tapSpy: () => void = vi.fn();
    ref.onTap().subscribe((): void => tapSpy());

    // Retrieve the data passed to openFromComponent and call tapped()
    const openCall = (snackBar.openFromComponent as ReturnType<typeof vi.spyOn>).mock.calls[0];
    const data = (openCall?.[1] as { data: { tapped: (id: string) => void } })?.data;
    data?.tapped(ref.id);

    expect(tapSpy).toHaveBeenCalledTimes(1);
  });

  it('emits onShown when the outlet opens and the toast becomes visible', async () => {
    const mock = createMockOutletRef();
    vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(mock.fakeRef);

    const ref: NgxMatToastRef = service.success('Watch me');
    const shownSpy: () => void = vi.fn();
    ref.onShown().subscribe((): void => shownSpy());

    mock.triggerOpened();

    expect(shownSpy).toHaveBeenCalledTimes(1);
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

    service.success('Normal', undefined, { fullWidth: false });
    service.success('Full width', undefined, { fullWidth: true });

    expect(openSpy).toHaveBeenCalledTimes(2);
  });

  it('adds the full-width panel class when fullWidth is true', () => {
    const openSpy: ReturnType<typeof vi.spyOn> = vi.spyOn(snackBar, 'openFromComponent');

    service.success('Full width', undefined, { fullWidth: true });

    const config = (openSpy.mock.calls[0] as unknown[])[1] as { panelClass: string[] };
    expect(config.panelClass).toContain('ngx-mat-toast-snack-panel--full-width');
  });
});
