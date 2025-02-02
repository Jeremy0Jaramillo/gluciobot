import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  navigateTo(section: string): void {
    console.log(`Navigating to: ${section}`);
    // Add router navigation logic if routes are configured.
  }
}
