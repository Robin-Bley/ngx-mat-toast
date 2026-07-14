import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import type { Signal, SimpleChanges, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  animationFrameScheduler,
  concat,
  EMPTY,
  interval,
  map,
  of,
  Subject,
  switchMap,
  takeWhile,
} from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { ToastData } from '../toast.model';
import type { ProgressParams } from './progress-params';

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
export class ToastItemComponent implements OnChanges, OnInit, OnDestroy {
  @Input({ required: true })
  public toast!: ToastData;

  @Output()
  public readonly dismissed: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  public readonly tapped: EventEmitter<string> = new EventEmitter<string>();

  public readonly isLeaving: WritableSignal<boolean> = signal<boolean>(false);

  private readonly progressParams$: Subject<ProgressParams | null> =
    new Subject<ProgressParams | null>();

  public readonly progressValue: Signal<number> = toSignal(
    this.progressParams$.pipe(
      switchMap((params: ProgressParams | null) => {
        if (!params) {
          return EMPTY;
        }
        const {
          startTime,
          duration,
          direction,
        }: { startTime: number; duration: number; direction: 'increasing' | 'decreasing' } = params;
        const computeValue = (): number => {
          const elapsed: number = Date.now() - startTime;
          const ratio: number = Math.min(elapsed / duration, 1);
          return direction === 'decreasing' ? (1 - ratio) * 100 : ratio * 100;
        };
        return concat(
          of(direction === 'decreasing' ? 100 : 0),
          interval(0, animationFrameScheduler).pipe(
            map(computeValue),
            takeWhile((v: number): boolean => (direction === 'decreasing' ? v > 0 : v < 100), true),
          ),
        );
      }),
    ),
    { initialValue: 100 },
  );

  private leaveTimer: ReturnType<typeof setTimeout> | undefined;

  public ngOnInit(): void {
    if (this.shouldStartProgressBar()) {
      this.startProgressBar();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const toastChange: SimpleChanges['toast'] = changes['toast'];
    if (
      toastChange &&
      !toastChange.isFirstChange() &&
      this.shouldStartProgressBar() &&
      !toastChange.previousValue?.isVisible
    ) {
      this.startProgressBar();
    }
  }

  public ngOnDestroy(): void {
    this.progressParams$.complete();
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = undefined;
    }
  }

  public onTap(): void {
    this.tapped.emit(this.toast.id);
    if (this.toast.config.tapToDismiss) {
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
    this.progressParams$.next(null);
    this.leaveTimer = setTimeout((): void => this.dismissed.emit(this.toast.id), 200);
  }

  private startProgressBar(): void {
    this.progressParams$.next({
      startTime: Date.now(),
      duration: this.toast.config.duration,
      direction: this.toast.config.progressBarDirection,
    });
  }

  private shouldStartProgressBar(): boolean {
    return (
      this.toast.isVisible &&
      this.toast.config.progressBar &&
      this.toast.config.duration > 0 &&
      !this.isLeaving()
    );
  }
}
