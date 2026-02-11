import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { HomeService } from './services/home.service';
import { Category } from '../../models/category';
import { debounceTime, distinctUntilChanged, Observable, Subject, switchMap } from 'rxjs';
import { ProductsService } from '../products/services/products.service';
import { Router } from '@angular/router';

export interface Product {
  id: number;
  name: string;
  nameKey: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  isWishlisted: boolean;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isSidebarOpen = false;
  categories: Category[] = [];
  categories$!: Observable<Category[]>;
  products: Product[] = [
    {
      id: 1,
      nameKey: 'prod_keyboard',
      name: 'AK-900 Wired Keyboard',
      brand: 'Logitech',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&h=350',
      price: 632,
      originalPrice: 1100,
      discount: 40,
      rating: 4,
      reviewCount: 35,
      isWishlisted: false
    },
    {
      id: 2,
      nameKey: 'prod_gamepad',
      name: 'HAVIT HV-G92 Gamepad',
      brand: 'HAVIT',
      image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=400&h=350',
      price: 120,
      originalPrice: 160,
      discount: 25,
      rating: 4,
      reviewCount: 446,
      isWishlisted: false
    },
    {
      id: 3,
      nameKey: 'prod_monitor',
      name: 'IPS LCD Gaming Monitor',
      brand: 'IPS',
      image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&w=400&h=350',
      price: 310,
      originalPrice: 400,
      discount: 20,
      rating: 4,
      reviewCount: 371,
      isWishlisted: false
    },
    {
      id: 4,
      nameKey: 'prod_chair',
      name: 'E-Series Comfort Chair',
      brand: 'Seatmatic',
      image: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format&fit=crop&w=400&h=350',
      price: 375,
      originalPrice: 400,
      discount: 10,
      rating: 4,
      reviewCount: 267,
      isWishlisted: false
    }
  ];
  banners = [
    {
      titleKey: 'banner_upto',
      subtitleKey: 'banner_voucher',
      limitedKey: 'banner_limited',
      bg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=400&fit=crop',
      product: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=320&fit=crop',
    },
    {
      titleKey: 'banner_upto',
      subtitleKey: 'banner_voucher',
      limitedKey: 'banner_limited',
      bg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=400&fit=crop',
      product: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=320&fit=crop',
    },
    {
      titleKey: 'banner_upto',
      subtitleKey: 'banner_voucher',
      limitedKey: 'banner_limited',
      bg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=400&fit=crop',
      product: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=320&fit=crop',
    }
  ];
  currentBanner = 0;

  // Search
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  showSearchDropdown = false;
  private searchSubject = new Subject<string>();

  constructor(public i18n: I18nService, private router: Router, private homeService: HomeService, private cdr: ChangeDetectorRef, private productsService: ProductsService) { }

  ngOnInit(): void {
    this.loadCategories();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchResults = [];
          this.showSearchDropdown = false;
          return [];
        }
        this.isSearching = true;
        return this.productsService.search(query);
      })
    ).subscribe({
      next: (res: any) => {
        this.isSearching = false;
        if (res.success) {
          this.searchResults = res.data.slice(0, 6);
          this.showSearchDropdown = this.searchResults.length > 0 || this.searchQuery.length >= 2;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  selectSearchResult(product: any): void {
    this.showSearchDropdown = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.router.navigate(['/products', product.id]);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.showSearchDropdown = false;
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  closeSearchDropdown(): void {
    setTimeout(() => {
      this.showSearchDropdown = false;
    }, 200);
  }

  getProductName(product: any): string {
    return this.i18n.currentLang === 'ar' ? product.nameAr : product.nameEn;
  }

  getProductImage(image: string): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `http://localhost:5078${image}`;
  }

  loadCategories(): void {
    this.homeService.getCategories(true).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categories = response.data.map((cat: any) => ({
            id: cat.id,
            nameAr: cat.nameAr,
            nameEn: cat.nameEn,
            productCount: cat.productCount,
            hasChildren: cat.productCount > 0
          }));
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  toggleWishlist(product: Product): void {
    product.isWishlisted = !product.isWishlisted;
  }

  prevBanner(): void {
    this.currentBanner = (this.currentBanner - 1 + this.banners.length) % this.banners.length;
  }

  nextBanner(): void {
    this.currentBanner = (this.currentBanner + 1) % this.banners.length;
  }

  addToCart(product: Product): void {
    console.log('Added to cart:', product.name);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}