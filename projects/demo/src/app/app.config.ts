import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Use the library's default configuration (no overrides).
    // Defaults include the brand color palette and no progress bar.
    provideNgxMatToast(),
  ],
};
