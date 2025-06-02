import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Enable dark mode for PrimeNG (only in browser)
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('p-dark');
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
