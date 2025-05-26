import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SubmitComponent } from './submit/submit.component';

export const routes: Routes = [
	{ path: 'menu', component: SubmitComponent },
	{ path: 'home', component: HomeComponent },
	{ path: '', redirectTo: '/home', pathMatch: 'full' },
	{ path: '**', redirectTo: '/home' } // Redirect any unknown paths to home
];
