import { ToastType } from './toast.types';
import { NgxMatToastConfig } from './toast.config';

/**
 * Internal data model for a single toast notification.
 */
export interface ToastData {
  /** Unique identifier for this toast instance. */
  id: string;
  /** The toast message text. */
  message: string;
  /** Optional title shown above the message. */
  title?: string;
  /** The visual type of the toast. */
  type: ToastType;
  /** The resolved configuration for this specific toast. */
  config: NgxMatToastConfig;
  /** Timestamp when the toast was created. */
  createdAt: number;
  /** Whether the toast card should be visible and run its enter animation. */
  isVisible: boolean;
}
