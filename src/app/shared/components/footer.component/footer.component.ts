import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent  implements OnInit, OnDestroy {
  currentYear: number = new Date().getFullYear();
  isLogged: boolean = false;
  private authSub!: Subscription;

  constructor(
    public i18n: I18nService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.isLoggedIn$.subscribe(isLogged => {
      this.isLogged = isLogged;
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}
