import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  ViewEncapsulation,
  inject,
  type Signal,
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import type { ToastData } from '../toast.model';
import type { ToastPosition } from '../toast.types';
import { ToastItemComponent } from '../toast-item/toast-item.component';
import type { ToastOutletData } from './toast-outlet-data';

/**
 * Stack container rendered inside Angular Material `MatSnackBar`.
 *
 * @internal
 */
@Component({
  selector: 'ngx-mat-toast-container',
  standalone: true,
  imports: [ToastItemComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  private readonly data: ToastOutletData = inject<ToastOutletData>(MAT_SNACK_BAR_DATA);

  public readonly toasts: Signal<ToastData[]> = this.data.toasts;

  @HostBinding('attr.data-vertical')
  protected get verticalPosition(): ToastPosition['vertical'] {
    return this.data.position.vertical;
  }

  @HostBinding('attr.data-horizontal')
  protected get horizontalPosition(): ToastPosition['horizontal'] {
    return this.data.position.horizontal;
  }

  public onDismiss(id: string): void {
    this.data.dismiss(id);
  }
}
