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

    expect(toastService._toasts()[0]?.config).toMatchObject({
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

    expect(toastService._toasts()[0]?.config.duration).toBe(0);
  });

  it('returns an ActiveToast-like object and can clear a specific toast', () => {
    const activeToast = service.warning('Heads up', 'Warning');

    expect(activeToast.toastId).toBeTruthy();
    expect(activeToast.message).toBe('Heads up');
    expect(activeToast.title).toBe('Warning');

    service.clear(activeToast.toastId);

    expect(toastService._toasts()).toHaveLength(0);
  });

  it('normalizes ngx-toastr style type strings in show()', () => {
    service.show('Problem', 'Error', undefined, 'toast-error');

    expect(toastService._toasts()[0]?.type).toBe('error');
  });
});
