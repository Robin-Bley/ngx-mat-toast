import { TestBed } from '@angular/core/testing';
import { ToastrService } from './toastr.service';
import { provideNgxMatToast } from './provide-ngx-mat-toast';
import { NgxMatToastService } from './ngx-mat-toast.service';

describe('ToastrService compatibility adapter', () => {
  let service: ToastrService;
  let toastService: NgxMatToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNgxMatToast()],
    });

    service = TestBed.inject(ToastrService);
    toastService = TestBed.inject(NgxMatToastService);
  });

  afterEach(() => {
    toastService.clear();
  });

  it('maps common ngx-toastr options to ngx-mat-toast config', () => {
    service.success('Saved', 'Success', {
      timeOut: 4500,
      closeButton: true,
      progressBar: true,
      tapToDismiss: false,
      preventDuplicates: true,
      maxOpened: 2,
      progressAnimation: 'increasing',
      positionClass: 'toast-bottom-left',
    });

    expect(toastService.toasts()[0]?.config).toMatchObject({
      duration: 4500,
      closeable: true,
      progressBar: true,
      tapToDismiss: false,
      preventDuplicates: true,
      maxToasts: 2,
      progressBarDirection: 'increasing',
      position: { horizontal: 'start', vertical: 'bottom' },
    });
  });

  it('supports disableTimeOut as a persistent toast', () => {
    service.info('Persistent', 'Info', {
      disableTimeOut: true,
    });

    expect(toastService.toasts()[0]?.config.duration).toBe(0);
  });

  it('supports disableTimeOut: "timeOut" as a persistent toast', () => {
    service.info('Persistent via timeOut string', 'Info', {
      disableTimeOut: 'timeOut',
    });

    expect(toastService.toasts()[0]?.config.duration).toBe(0);
  });

  it('returns an ActiveToast-like object and can clear a specific toast', () => {
    const activeToast = service.warning('Heads up', 'Warning');

    expect(activeToast.toastId).toBeTruthy();
    expect(activeToast.message).toBe('Heads up');
    expect(activeToast.title).toBe('Warning');

    service.clear(activeToast.toastId);

    expect(toastService.toasts()).toHaveLength(0);
  });

  it('normalizes ngx-toastr style type strings in show()', () => {
    service.show('Problem', 'Error', undefined, 'toast-error');

    expect(toastService.toasts()[0]?.type).toBe('error');
  });

  it('remove() without id clears all toasts', () => {
    service.success('First');
    service.error('Second');

    const result: boolean = service.remove();

    expect(result).toBe(true);
    expect(toastService.toasts()).toHaveLength(0);
  });

  it('remove() with a valid id dismisses only that toast', () => {
    const first = service.success('First');
    service.error('Second');

    const result: boolean = service.remove(first.toastId);

    expect(result).toBe(true);
    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0]?.message).toBe('Second');
  });

  it('remove() with an unknown id returns false', () => {
    const result: boolean = service.remove('nonexistent-id');

    expect(result).toBe(false);
  });

  it('maps all top-row positionClass values to the correct positions', () => {
    const cases: Array<
      [Parameters<typeof service.success>[2], { horizontal: string; vertical: string }]
    > = [
      [{ positionClass: 'toast-top-left' }, { horizontal: 'start', vertical: 'top' }],
      [{ positionClass: 'toast-top-center' }, { horizontal: 'center', vertical: 'top' }],
      [{ positionClass: 'toast-top-right' }, { horizontal: 'end', vertical: 'top' }],
    ];

    for (const [override, expectedPosition] of cases) {
      service.success('msg', undefined, override);
      const last = toastService.toasts().at(-1);
      expect(last?.config.position).toEqual(expectedPosition);
    }
  });

  it('maps all bottom-row positionClass values to the correct positions', () => {
    const cases: Array<
      [Parameters<typeof service.success>[2], { horizontal: string; vertical: string }]
    > = [
      [{ positionClass: 'toast-bottom-left' }, { horizontal: 'start', vertical: 'bottom' }],
      [{ positionClass: 'toast-bottom-center' }, { horizontal: 'center', vertical: 'bottom' }],
      [{ positionClass: 'toast-bottom-right' }, { horizontal: 'end', vertical: 'bottom' }],
    ];

    for (const [override, expectedPosition] of cases) {
      service.success('msg', undefined, override);
      const last = toastService.toasts().at(-1);
      expect(last?.config.position).toEqual(expectedPosition);
    }
  });

  it('sets fullWidth: true for toast-top-full-width', () => {
    service.success('Full', undefined, { positionClass: 'toast-top-full-width' });

    expect(toastService.toasts()[0]?.config.fullWidth).toBe(true);
    expect(toastService.toasts()[0]?.config.position).toEqual({
      horizontal: 'center',
      vertical: 'top',
    });
  });

  it('sets fullWidth: true for toast-bottom-full-width', () => {
    service.success('Full bottom', undefined, { positionClass: 'toast-bottom-full-width' });

    expect(toastService.toasts()[0]?.config.fullWidth).toBe(true);
    expect(toastService.toasts()[0]?.config.position).toEqual({
      horizontal: 'center',
      vertical: 'bottom',
    });
  });

  it('does not set fullWidth for non-full-width position classes', () => {
    service.success('Normal', undefined, { positionClass: 'toast-top-right' });

    // fullWidth should remain at the default value (false)
    expect(toastService.toasts()[0]?.config.fullWidth).toBeFalsy();
  });
});
