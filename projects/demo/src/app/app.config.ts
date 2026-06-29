import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideNgxMatToast } from 'ngx-mat-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNgxMatToast({
      duration: 3000,
      position: { horizontal: 'end', vertical: 'top' },
      closeable: true,
      progressBar: true,
    }),
  ],
};
