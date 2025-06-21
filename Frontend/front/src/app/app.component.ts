import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SlideshowComponent } from './slideshow/slideshow.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SlideshowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simple-menu';
}
