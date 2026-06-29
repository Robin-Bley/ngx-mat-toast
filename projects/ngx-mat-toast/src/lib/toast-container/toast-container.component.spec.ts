import { signal, type DebugElement, type WritableSignal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DEFAULT_TOAST_CONFIG } from '../toast.config';
import type { ToastData } from '../toast.model';
import { ToastItemComponent } from '../toast-item/toast-item.component';
import { ToastContainerComponent } from './toast-container.component';
import type { ToastOutletData } from './toast-outlet-data';

function createToast(overrides: Partial<ToastData> = {}): ToastData {
  const createdAt: number = Date.now();

  return {
    id: 'toast-1',
    message: 'Toast message',
    title: 'Toast title',
    type: 'info',
    createdAt,
    isVisible: true,
    config: {
      ...DEFAULT_TOAST_CONFIG,
    },
    ...overrides,
  };
}

describe('ToastContainerComponent', () => {
  let toasts: WritableSignal<ToastData[]>;
  let dismissedIds: string[];
  let outletData: ToastOutletData;

  beforeEach(async () => {
    toasts = signal<ToastData[]>([createToast()]);
    dismissedIds = [];
    outletData = {
      toasts: toasts.asReadonly(),
      dismiss: (id: string): void => {
        dismissedIds.push(id);
      },
      position: { horizontal: 'start', vertical: 'top' },
    };

    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: outletData,
        },
      ],
    }).compileComponents();
  });

  function createFixture(): ComponentFixture<ToastContainerComponent> {
    const fixture: ComponentFixture<ToastContainerComponent> =
      TestBed.createComponent(ToastContainerComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the current toast stack from the provided signal', () => {
    const fixture: ComponentFixture<ToastContainerComponent> = createFixture();
    const element: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('ngx-mat-toast-item')).toHaveLength(1);
    expect(element.textContent).toContain('Toast title');
    expect(element.textContent).toContain('Toast message');
  });

  it('updates the rendered toast stack when the signal changes', () => {
    const fixture: ComponentFixture<ToastContainerComponent> = createFixture();

    toasts.set([
      createToast({ id: 'toast-1', message: 'First toast' }),
      createToast({ id: 'toast-2', message: 'Second toast', title: 'Another title' }),
    ]);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('ngx-mat-toast-item')).toHaveLength(2);
    expect(element.textContent).toContain('First toast');
    expect(element.textContent).toContain('Second toast');
  });

  it('forwards toast dismiss events to the snackbar outlet callback', () => {
    const fixture: ComponentFixture<ToastContainerComponent> = createFixture();
    const firstToastItemDebugElement: DebugElement | null = fixture.debugElement.query(
      By.directive(ToastItemComponent),
    );

    expect(firstToastItemDebugElement).not.toBeNull();

    const firstToastItem: ToastItemComponent = firstToastItemDebugElement!
      .componentInstance as ToastItemComponent;
    firstToastItem.dismissed.emit('toast-1');

    expect(dismissedIds).toEqual(['toast-1']);
  });

  it('exposes horizontal and vertical host attributes for position-aware styling', () => {
    const fixture: ComponentFixture<ToastContainerComponent> = createFixture();
    const hostElement: HTMLElement = fixture.nativeElement as HTMLElement;

    expect(hostElement.getAttribute('data-horizontal')).toBe('start');
    expect(hostElement.getAttribute('data-vertical')).toBe('top');
  });
});
