import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import type { ToastData } from '../toast.model';
import type { ToastType } from '../toast.types';

const PROGRESS_COLORS: Record<ToastType, 'primary' | 'accent' | 'warn'> = {
  success: 'accent',
  error: 'warn',
  warning: 'accent',
  info: 'primary',
};

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
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input({ required: true }) public toast!: ToastData;
  @Output() public readonly dismissed: EventEmitter<string> = new EventEmitter<string>();

  public isLeaving: boolean = false;
  public progressValue: number = 100;

  private progressInterval?: ReturnType<typeof setInterval>;
  private leaveTimer?: ReturnType<typeof setTimeout>;
  private startTime: number = 0;

  public get progressColor(): 'primary' | 'accent' | 'warn' {
    return PROGRESS_COLORS[this.toast.type];
  }

  public ngOnInit(): void {
    this.progressValue = this.toast.config.progressBarDirection === 'increasing' ? 0 : 100;

    if (this.shouldStartProgressBar() && !this.progressInterval) {
      this.startProgressBar();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.progressValue = this.toast.config.progressBarDirection === 'increasing' ? 0 : 100;

    const toastChange: SimpleChanges['toast'] = changes['toast'];

    if (toastChange && this.shouldStartProgressBar() && !toastChange.previousValue?.isVisible) {
      this.stopProgressBar();
      this.startProgressBar();
    }
  }

  public ngOnDestroy(): void {
    this.stopProgressBar();

    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = undefined;
    }
  }

  public onTap(): void {
    if (this.toast.config.tapToDismiss) {
      this.startLeave();
    }
  }

  public onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.startLeave();
  }

  public startLeave(): void {
    if (this.isLeaving) {
      return;
    }

    this.isLeaving = true;
    this.stopProgressBar();
    this.cdr.markForCheck();
    this.leaveTimer = setTimeout(() => this.dismissed.emit(this.toast.id), 200);
  }

  private startProgressBar(): void {
    this.startTime = Date.now();
    const duration: number = this.toast.config.duration;
    const direction: ToastData['config']['progressBarDirection'] =
      this.toast.config.progressBarDirection;

    this.progressInterval = setInterval((): void => {
      const elapsed: number = Date.now() - this.startTime;
      const ratio: number = Math.min(elapsed / duration, 1);
      this.progressValue = direction === 'decreasing' ? (1 - ratio) * 100 : ratio * 100;
      this.cdr.markForCheck();

      if (ratio >= 1) {
        this.stopProgressBar();
      }
    }, 50);
  }

  private shouldStartProgressBar(): boolean {
    return (
      this.toast.isVisible &&
      this.toast.config.progressBar &&
      this.toast.config.duration > 0 &&
      !this.isLeaving
    );
  }

  private stopProgressBar(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = undefined;
    }
  }
}
