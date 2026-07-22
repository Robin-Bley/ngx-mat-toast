import { TestBed } from '@angular/core/testing';
import { ToastItemComponent } from './toast-item.component';
import type { ToastData } from '../toast.model';
import { DEFAULT_TOAST_CONFIG } from '../toast.config';
import { vi } from 'vitest';

function createToast(overrides: Partial<ToastData> = {}): ToastData {
  return {
    id: 'toast-1',
    message: 'Toast message',
    title: 'Toast title',
    type: 'success',
    createdAt: Date.now(),
    isVisible: true,
    config: {
      ...DEFAULT_TOAST_CONFIG,
      duration: 3000,
      closeable: true,
      progressBar: false,
      tapToDismiss: true,
    },
    ...overrides,
  };
}

describe('ToastItemComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastItemComponent],
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast());
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the title and message', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast());
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.ngx-mat-toast-item__title')?.textContent).toContain(
      'Toast title',
    );
    expect(element.querySelector('.ngx-mat-toast-item__message')?.textContent).toContain(
      'Toast message',
    );
  });

  it('omits the title when one is not provided', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast({ title: undefined }));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.ngx-mat-toast-item__title')).toBeNull();
  });

  it('shows the close button when closeable is enabled', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast());
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.ngx-mat-toast-item__close')).not.toBeNull();
  });

  it('hides the close button when closeable is disabled', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput(
      'toast',
      createToast({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          closeable: false,
        },
      }),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.ngx-mat-toast-item__close')).toBeNull();
  });

  it('shows the progress bar only when enabled and duration is positive', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput(
      'toast',
      createToast({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          progressBar: true,
          duration: 3000,
        },
      }),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('mat-progress-bar')).not.toBeNull();
  });

  it('does not show the progress bar when duration is 0', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput(
      'toast',
      createToast({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          progressBar: true,
          duration: 0,
        },
      }),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('mat-progress-bar')).toBeNull();
  });

  it('starts the progress bar at 0 when increasing direction is used', () => {
    // Freeze time so that Date.now() is identical when _startTime is set and when
    // progressValue is first read, yielding elapsed = 0 and therefore ratio = 0.
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput(
      'toast',
      createToast({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          progressBar: true,
          duration: 3000,
          progressBarDirection: 'increasing',
        },
      }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.progressValue()).toBe(0);
  });

  it('only applies the enter state once the toast becomes visible', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast({ isVisible: false }));
    fixture.detectChanges();

    let element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.ngx-mat-toast-item')?.classList.contains('state-enter')).toBe(
      false,
    );

    fixture.componentRef.setInput('toast', createToast({ isVisible: true }));
    fixture.detectChanges();

    element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.ngx-mat-toast-item')?.classList.contains('state-enter')).toBe(
      true,
    );
  });

  it('dismisses after clicking the toast when tapToDismiss is enabled', () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast());
    fixture.detectChanges();

    const dismissedSpy = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissedSpy);

    (fixture.nativeElement as HTMLElement)
      .querySelector('.ngx-mat-toast-item')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    vi.advanceTimersByTime(200);

    expect(dismissedSpy).toHaveBeenCalledWith('toast-1');
  });

  it('does not dismiss on tap when tapToDismiss is disabled', () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput(
      'toast',
      createToast({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          tapToDismiss: false,
        },
      }),
    );
    fixture.detectChanges();

    const dismissedSpy = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissedSpy);

    (fixture.nativeElement as HTMLElement)
      .querySelector('.ngx-mat-toast-item')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    vi.advanceTimersByTime(200);

    expect(dismissedSpy).not.toHaveBeenCalled();
  });

  it('emits tapped regardless of tapToDismiss setting', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput(
      'toast',
      createToast({
        config: {
          ...DEFAULT_TOAST_CONFIG,
          tapToDismiss: false,
        },
      }),
    );
    fixture.detectChanges();

    const tappedSpy = vi.fn();
    fixture.componentInstance.tapped.subscribe(tappedSpy);

    (fixture.nativeElement as HTMLElement)
      .querySelector('.ngx-mat-toast-item')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(tappedSpy).toHaveBeenCalledWith('toast-1');
  });

  it('only triggers leave once even if startLeave is called multiple times', () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast());
    fixture.detectChanges();

    const dismissedSpy = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissedSpy);

    fixture.componentInstance.startLeave();
    fixture.componentInstance.startLeave();

    vi.advanceTimersByTime(200);

    expect(dismissedSpy).toHaveBeenCalledTimes(1);
  });

  it('does not expose the content wrapper as a live region', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast());
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const contentWrapper = element.querySelector('.ngx-mat-toast-item__content');

    expect(contentWrapper?.getAttribute('role')).toBeNull();
    expect(contentWrapper?.getAttribute('aria-live')).toBeNull();
    expect(contentWrapper?.getAttribute('aria-atomic')).toBeNull();
  });

  it('applies role="status" and aria-live="polite" for info toast', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast({ type: 'info' }));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const item = element.querySelector('.ngx-mat-toast-item');

    expect(item?.getAttribute('role')).toBe('status');
    expect(item?.getAttribute('aria-live')).toBe('polite');
    expect(item?.getAttribute('aria-atomic')).toBe('true');
  });

  it('applies role="status" and aria-live="polite" for success toast', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast({ type: 'success' }));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const item = element.querySelector('.ngx-mat-toast-item');

    expect(item?.getAttribute('role')).toBe('status');
    expect(item?.getAttribute('aria-live')).toBe('polite');
  });

  it('applies role="alert" and aria-live="assertive" for error toast', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast({ type: 'error' }));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const item = element.querySelector('.ngx-mat-toast-item');

    expect(item?.getAttribute('role')).toBe('alert');
    expect(item?.getAttribute('aria-live')).toBe('assertive');
  });

  it('applies role="alert" and aria-live="assertive" for warning toast', () => {
    const fixture = TestBed.createComponent(ToastItemComponent);
    fixture.componentRef.setInput('toast', createToast({ type: 'warning' }));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const item = element.querySelector('.ngx-mat-toast-item');

    expect(item?.getAttribute('role')).toBe('alert');
    expect(item?.getAttribute('aria-live')).toBe('assertive');
  });
});
