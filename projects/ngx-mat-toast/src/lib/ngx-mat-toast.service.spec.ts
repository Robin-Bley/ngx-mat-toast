import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { NgxMatToastService } from './ngx-mat-toast.service';
import { provideNgxMatToast } from './provide-ngx-mat-toast';

describe('NgxMatToastService', () => {
  let service: NgxMatToastService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
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
    const openSpy = vi.spyOn(snackBar, 'openFromComponent');

    service.success('Saved successfully');

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(service._toasts()).toHaveLength(1);
    expect(service._toasts()[0]?.type).toBe('success');
  });

  it('reveals the first toast after the snackbar outlet finishes opening', async () => {
    service.success('Saved successfully');

    expect(service._toasts()[0]?.isVisible).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(service._toasts()[0]?.isVisible).toBe(true);
  });

  it('shows additional toasts immediately once the outlet is open', async () => {
    service.success('First');

    await new Promise((resolve) => setTimeout(resolve, 10));

    service.success('Second');

    expect(service._toasts()[0]?.isVisible).toBe(true);
    expect(service._toasts()[1]?.isVisible).toBe(true);
  });

  it('creates success, error, warning, and info toasts', () => {
    service.success('Success');
    service.error('Error');
    service.warning('Warning');
    service.info('Info');

    expect(service._toasts().map((toast) => toast.type)).toEqual([
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

    expect(service._toasts()[0]?.config.position).toEqual({
      horizontal: 'end',
      vertical: 'bottom',
    });
  });

  it('returns the existing ref when preventDuplicates is enabled', () => {
    const first = service.success('Duplicate', undefined, { preventDuplicates: true });
    const second = service.success('Duplicate', undefined, { preventDuplicates: true });

    expect(first).toBe(second);
    expect(service._toasts()).toHaveLength(1);
  });

  it('allows duplicates when preventDuplicates is disabled', () => {
    service.success('Duplicate', undefined, { preventDuplicates: false });
    service.success('Duplicate', undefined, { preventDuplicates: false });

    expect(service._toasts()).toHaveLength(2);
  });

  it('removes the oldest toast when maxToasts is exceeded', () => {
    service.success('First', undefined, { maxToasts: 2 });
    service.success('Second', undefined, { maxToasts: 2 });
    service.success('Third', undefined, { maxToasts: 2 });

    expect(service._toasts().map((toast) => toast.message)).toEqual(['Second', 'Third']);
  });

  it('auto-dismisses a toast after its configured duration', async () => {
    service.success('Dismiss me', undefined, { duration: 10 });

    expect(service._toasts()).toHaveLength(1);

    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(service._toasts()).toHaveLength(0);
  });

  it('keeps persistent toasts open when duration is 0', async () => {
    service.info('Persistent', undefined, { duration: 0 });

    await new Promise((resolve) => setTimeout(resolve, 25));

    expect(service._toasts()).toHaveLength(1);
  });

  it('dismisses a toast by id and notifies its ref', () => {
    const ref = service.success('Dismiss me');
    const dismissedSpy = vi.fn();

    ref.afterDismissed().subscribe(dismissedSpy);

    expect(service.dismiss(ref.id)).toBe(true);
    expect(service.dismiss('missing-id')).toBe(false);
    expect(dismissedSpy).toHaveBeenCalledTimes(1);
    expect(service._toasts()).toHaveLength(0);
  });

  it('clears all active toasts', () => {
    service.success('One');
    service.error('Two');
    service.warning('Three');

    service.clear();

    expect(service._toasts()).toHaveLength(0);
  });

  it('reopens the snackbar outlet when the requested position changes', () => {
    const openSpy = vi.spyOn(snackBar, 'openFromComponent');

    service.success('Top right');
    service.success('Bottom left', undefined, {
      position: { horizontal: 'start', vertical: 'bottom' },
    });

    expect(openSpy).toHaveBeenCalledTimes(2);
  });
});
