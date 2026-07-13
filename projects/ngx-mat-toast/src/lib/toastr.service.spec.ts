import { TestBed } from '@angular/core/testing';
import { ToastrService } from './toastr.service';
import { provideNgxMatToast } from './provide-ngx-mat-toast';
import { NgxMatToastService } from './ngx-mat-toast.service';
import { mapNgxToastrConfigToNgxMatToastConfig } from './toastr.service';

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

  // ---------------------------------------------------------------------------
  // Core option mapping
  // ---------------------------------------------------------------------------

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
      fullWidth: false,
    });
  });

  it('supports disableTimeOut as a persistent toast', () => {
    service.info('Persistent', 'Info', {
      disableTimeOut: true,
    });

    expect(toastService.toasts()[0]?.config.duration).toBe(0);
  });

  it('maps disableTimeOut: "timeOut" to duration 0', () => {
    service.info('Persistent', 'Info', {
      disableTimeOut: 'timeOut',
    });

    expect(toastService.toasts()[0]?.config.duration).toBe(0);
  });

  // ---------------------------------------------------------------------------
  // Full-width position class mapping
  // ---------------------------------------------------------------------------

  it('maps toast-top-full-width to center/top with fullWidth: true', () => {
    service.success('Full width top', undefined, {
      positionClass: 'toast-top-full-width',
    });

    expect(toastService.toasts()[0]?.config.position).toEqual({
      horizontal: 'center',
      vertical: 'top',
    });
    expect(toastService.toasts()[0]?.config.fullWidth).toBe(true);
  });

  it('maps toast-bottom-full-width to center/bottom with fullWidth: true', () => {
    service.warning('Full width bottom', undefined, {
      positionClass: 'toast-bottom-full-width',
    });

    expect(toastService.toasts()[0]?.config.position).toEqual({
      horizontal: 'center',
      vertical: 'bottom',
    });
    expect(toastService.toasts()[0]?.config.fullWidth).toBe(true);
  });

  it('maps toast-top-right to end/top with fullWidth: false', () => {
    service.error('Top right', undefined, {
      positionClass: 'toast-top-right',
    });

    expect(toastService.toasts()[0]?.config.position).toEqual({
      horizontal: 'end',
      vertical: 'top',
    });
    expect(toastService.toasts()[0]?.config.fullWidth).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // clear() / remove() behaviour
  // ---------------------------------------------------------------------------

  it('returns an ActiveToast-like object and can clear a specific toast', () => {
    const activeToast = service.warning('Heads up', 'Warning');

    expect(activeToast.toastId).toBeTruthy();
    expect(activeToast.message).toBe('Heads up');
    expect(activeToast.title).toBe('Warning');

    service.clear(activeToast.toastId);

    expect(toastService.toasts()).toHaveLength(0);
  });

  it('clears all toasts when clear() is called without an id', () => {
    service.success('One');
    service.error('Two');

    service.clear();

    expect(toastService.toasts()).toHaveLength(0);
  });

  it('removes a specific toast by id via remove()', () => {
    const a = service.success('Keep me');
    const b = service.error('Remove me');

    const result: boolean = service.remove(b.toastId);

    expect(result).toBe(true);
    expect(toastService.toasts()).toHaveLength(1);
    expect(toastService.toasts()[0]?.id).toBe(a.toastId);
  });

  it('clears all toasts when remove() is called without an id', () => {
    service.success('One');
    service.info('Two');

    const result: boolean = service.remove();

    expect(result).toBe(true);
    expect(toastService.toasts()).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // Lifecycle observables on ActiveToast
  // ---------------------------------------------------------------------------

  it('exposes onShown and onTap as observables on the returned ActiveToast', () => {
    const activeToast = service.info('Observable toast');

    expect(typeof activeToast.onShown.subscribe).toBe('function');
    expect(typeof activeToast.onTap.subscribe).toBe('function');
  });

  // ---------------------------------------------------------------------------
  // Type string normalisation in show()
  // ---------------------------------------------------------------------------

  it('normalizes ngx-toastr style type strings in show()', () => {
    service.show('Problem', 'Error', undefined, 'toast-error');

    expect(toastService.toasts()[0]?.type).toBe('error');
  });

  it('defaults to info for unknown type strings in show()', () => {
    service.show('Unknown', undefined, undefined, 'toast-unknown');

    expect(toastService.toasts()[0]?.type).toBe('info');
  });

  // ---------------------------------------------------------------------------
  // mapCompatConfig standalone tests (exported helper)
  // ---------------------------------------------------------------------------

  it('mapNgxToastrConfigToNgxMatToastConfig returns empty object for undefined input', () => {
    const result = mapNgxToastrConfigToNgxMatToastConfig(undefined);
    expect(result).toEqual({});
  });

  it('mapNgxToastrConfigToNgxMatToastConfig preserves timeOut when disableTimeOut is false', () => {
    const result = mapNgxToastrConfigToNgxMatToastConfig({
      timeOut: 2000,
      disableTimeOut: false,
    });
    expect(result.duration).toBe(2000);
  });
});
