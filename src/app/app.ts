// app.component.ts — كاملها كدة:

import { Component, OnInit } from '@angular/core';
import { I18nService } from './core/services/i18n.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private i18n: I18nService, private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use(localStorage.getItem('lang') || 'en');
  }

  ngOnInit(): void {
    const lang = this.i18n.currentLang;
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }
}