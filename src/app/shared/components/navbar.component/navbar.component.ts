import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService, Lang } from '../../../core/services/i18n.service';
import { TranslateService } from '@ngx-translate/core';

export interface NavLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  searchQuery = '';
  currentLang: Lang = 'ar';
  lang: string = '';
  navLinks: NavLink[] = [];

  private langSub!: Subscription;

  constructor(public i18n: I18nService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'en';

    this.langSub = this.i18n.lang$Observable().subscribe(lang => {
      this.currentLang = lang;
      this.updateNavLinks();
    });
  }

  ChangeLag(event: any) {
    const selectedLang = event.target.value;

    localStorage.setItem('lang', selectedLang);

    this.translate.use(selectedLang);
  }

  switchLang(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    this.i18n.switch(lang as Lang);
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    this.translate.use(lang);
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }


  private updateNavLinks(): void {
    this.navLinks = [
      { label: 'home', url: '/' },
      { label: 'products', url: '/about' },
      { label: 'profile', url: '/contact' },
      { label: 'logout', url: '/contact' },
    ];
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }

}