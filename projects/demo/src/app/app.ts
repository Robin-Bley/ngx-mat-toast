import { Component, inject, signal, type WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  NgxMatToastOptions,
  NgxMatToastRef,
  NgxMatToastService,
  ToastHorizontalPosition,
  ToastType,
  ToastVerticalPosition,
} from 'ngx-mat-toast';

interface ToastDemo {
  type: ToastType;
  label: string;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatToolbarModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly toast: NgxMatToastService = inject(NgxMatToastService);

  public readonly message: WritableSignal<string> = signal('This is a sample toast notification.');
  public readonly title: WritableSignal<string> = signal('Notification');
  public readonly duration: WritableSignal<number> = signal(3000);
  public readonly closeable: WritableSignal<boolean> = signal(true);
  public readonly progressBar: WritableSignal<boolean> = signal(true);
  public readonly tapToDismiss: WritableSignal<boolean> = signal(true);
  public readonly preventDuplicates: WritableSignal<boolean> = signal(false);
  public readonly progressBarDirection: WritableSignal<'increasing' | 'decreasing'> = signal<'increasing' | 'decreasing'>('decreasing');
  public readonly horizontalPosition: WritableSignal<ToastHorizontalPosition> = signal<ToastHorizontalPosition>('end');
  public readonly verticalPosition: WritableSignal<ToastVerticalPosition> = signal<ToastVerticalPosition>('top');

  public readonly toastTypes: ToastDemo[] = [
    { type: 'success', label: 'Success', color: '#4caf50' },
    { type: 'error', label: 'Error', color: '#f44336' },
    { type: 'warning', label: 'Warning', color: '#ff9800' },
    { type: 'info', label: 'Info', color: '#2196f3' },
  ];

  public readonly horizontalPositions: { value: ToastHorizontalPosition; label: string }[] = [
    { value: 'start', label: 'Start (left)' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End (right)' },
  ];

  public readonly verticalPositions: { value: ToastVerticalPosition; label: string }[] = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
  ];

  public showToast(type: ToastType): void {
    const config: NgxMatToastOptions = {
      duration: this.duration(),
      closeable: this.closeable(),
      progressBar: this.progressBar(),
      tapToDismiss: this.tapToDismiss(),
      preventDuplicates: this.preventDuplicates(),
      progressBarDirection: this.progressBarDirection(),
      position: {
        horizontal: this.horizontalPosition(),
        vertical: this.verticalPosition(),
      },
    };

    this.toast.show(this.message(), type, this.title() || undefined, config);
  }

  public showQuickSuccess(): void {
    this.toast.success('Changes saved successfully.', 'Saved');
  }

  public showQuickError(): void {
    this.toast.error('Failed to connect to the server.', 'Connection error');
  }

  public showPersistentToast(): void {
    const ref: NgxMatToastRef = this.toast.info(
      'This toast will stay open until you dismiss it manually.',
      'Persistent toast',
      { duration: 0 },
    );

    ref.afterDismissed().subscribe((): void => {
      console.log('Persistent toast dismissed:', ref.id);
    });
  }

  public clearAll(): void {
    this.toast.clear();
  }
}
