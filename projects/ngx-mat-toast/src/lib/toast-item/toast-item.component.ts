import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  input,
  type InputSignal,
  Output,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { ToastData } from '../toast.model';
import type { ToastType } from '../toast.types';

/**
 * Renders a single toast card inside the snackbar-hosted outlet.
 *
 * @internal
 */
@Component({
  selector: 'ngx-mat-toast-item',
  standalone: true,
  imports: [MatButtonModule, MatProgressBarModule],
  templateUrl: './toast-item.component.html',
  styleUrl: './toast-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastItemComponent {
  public readonly toast: InputSignal<ToastData> = input.required<ToastData>();

  @Output()
  public readonly dismissed: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Emits the toast id whenever the user taps or clicks the toast body,
   * regardless of whether `tapToDismiss` is enabled.
   */
  @Output()
  public readonly tapped: EventEmitter<string> = new EventEmitter<string>();

  public readonly isLeaving: WritableSignal<boolean> = signal<boolean>(false);

  private readonly _startTime: WritableSignal<number> = signal<number>(0);
  private readonly _tick: WritableSignal<number> = signal<number>(0);
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Current progress-bar value (0–100), reactively computed from elapsed time.
   * Updates every ≈50 ms while the progress bar is active.
   */
  public readonly progressValue: Signal<number> = computed((): number => {
    this._tick(); // subscribe to tick signal so the computed re-evaluates
    const toastData: ToastData = this.toast();
    const startTime: number = this._startTime();
    const initialValue: number = toastData.config.progressBarDirection === 'increasing' ? 0 : 100;

    if (!startTime || this.isLeaving()) {
      return initialValue;
    }

    const elapsed: number = Date.now() - startTime;
    const ratio: number = Math.min(elapsed / toastData.config.duration, 1);
    return toastData.config.progressBarDirection === 'decreasing' ? (1 - ratio) * 100 : ratio * 100;
  });

  /** ARIA `role` attribute value based on the toast type. */
  public readonly ariaRole: Signal<'status' | 'alert'> = computed((): 'status' | 'alert' => {
    const type: ToastType = this.toast().type;
    return type === 'error' || type === 'warning' ? 'alert' : 'status';
  });

  /** ARIA `aria-live` politeness based on the toast type. */
  public readonly ariaLive: Signal<'assertive' | 'polite'> = computed(
    (): 'assertive' | 'polite' => {
      const type: ToastType = this.toast().type;
      return type === 'error' || type === 'warning' ? 'assertive' : 'polite';
    },
  );

  constructor() {
    const destroyRef: DestroyRef = inject(DestroyRef);

    // Start the progress timer reactively the first time the toast becomes visible.
    effect((): void => {
      const toastData: ToastData = this.toast();
      const shouldStart: boolean =
        toastData.isVisible &&
        toastData.config.progressBar &&
        toastData.config.duration > 0 &&
        !this.isLeaving();

      if (shouldStart && this._startTime() === 0) {
        this._startTime.set(Date.now());
      }
    });

    // Start the progress bar tick interval only when the progress bar is active.
    effect((onCleanup: (cleanup: () => void) => void): void => {
      const toastData: ToastData = this.toast();
      const shouldTick: boolean =
        toastData.isVisible &&
        toastData.config.progressBar &&
        toastData.config.duration > 0 &&
        !this.isLeaving() &&
        this._startTime() > 0;

      if (shouldTick) {
        // Subscribe to the interval and update the tick signal
        const subscription: Subscription = interval(50)
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe((): void => {
            this._tick.update((value: number): number => value + 1);

            const elapsed: number = Date.now() - this._startTime();
            if (elapsed >= toastData.config.duration) {
              subscription.unsubscribe();
            }
          });

        // Register cleanup function to unsubscribe when effect re-runs or is destroyed
        onCleanup((): void => {
          subscription.unsubscribe();
        });
      }
    });

    // Clean up the leave timer when the component is destroyed.
    destroyRef.onDestroy((): void => {
      if (this.leaveTimer !== undefined) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = undefined;
      }
    });
  }

  public onTap(): void {
    this.tapped.emit(this.toast().id);
    if (this.toast().config.tapToDismiss) {
      this.startLeave();
    }
  }

  public onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.startLeave();
  }

  public startLeave(): void {
    if (this.isLeaving()) {
      return;
    }

    this.isLeaving.set(true);
    this.leaveTimer = setTimeout((): void => this.dismissed.emit(this.toast().id), 200);
  }
}
