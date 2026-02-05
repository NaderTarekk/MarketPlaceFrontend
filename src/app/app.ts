// app.component.ts — كاملها كدة:

import { Component, OnInit } from '@angular/core';
import { I18nService } from './core/services/i18n.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from './modules/auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLogged: boolean = false;
  private authSub!: Subscription; 

  constructor(private router: Router, private i18n:
    I18nService, private translate: TranslateService, private authService: AuthService) {
    translate.setDefaultLang('en');
    translate.use(localStorage.getItem('lang') || 'en');
  }

  ngOnInit(): void {
    const lang = this.i18n.currentLang;
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    // ✅ Subscribe على الـ auth state
    this.authSub = this.authService.isLoggedIn$.subscribe(isLogged => {
      this.isLogged = isLogged;
    });
  }
}