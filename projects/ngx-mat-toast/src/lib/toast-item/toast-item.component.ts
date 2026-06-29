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
import { ToastData } from '../toast.model';
import { ToastType } from '../toast.types';

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
  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) toast!: ToastData;
  @Output() readonly dismissed = new EventEmitter<string>();

  isLeaving = false;
  progressValue = 100;

  private progressInterval?: ReturnType<typeof setInterval>;
  private leaveTimer?: ReturnType<typeof setTimeout>;
  private startTime = 0;

  get progressColor(): 'primary' | 'accent' | 'warn' {
    return PROGRESS_COLORS[this.toast.type];
  }

  ngOnInit(): void {
    this.progressValue = this.toast.config.progressBarDirection === 'increasing' ? 0 : 100;

    if (this.shouldStartProgressBar() && !this.progressInterval) {
      this.startProgressBar();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.progressValue = this.toast.config.progressBarDirection === 'increasing' ? 0 : 100;

    const toastChange = changes['toast'];

    if (toastChange && this.shouldStartProgressBar() && !toastChange.previousValue?.isVisible) {
      this.stopProgressBar();
      this.startProgressBar();
    }
  }

  ngOnDestroy(): void {
    this.stopProgressBar();

    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = undefined;
    }
  }

  onTap(): void {
    if (this.toast.config.tapToDismiss) {
      this.startLeave();
    }
  }

  onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.startLeave();
  }

  startLeave(): void {
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
    const duration = this.toast.config.duration;
    const direction = this.toast.config.progressBarDirection;

    this.progressInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const ratio = Math.min(elapsed / duration, 1);
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
