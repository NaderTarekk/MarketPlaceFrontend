import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../../../core/services/i18n.service';
import { ProductsService } from '../../services/products.service';
import { Store } from '../../../../models/products';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-stores',
  standalone: false,
  templateUrl: './stores.component.html',
  styleUrl: './stores.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoresComponent implements OnInit {
  stores: Store[] = [];
  isLoading = true;
  search = '';

  constructor(
    public i18n: I18nService,
    private productService: ProductsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productService.getStores().subscribe({
      next: (res) => {
        if (res.success) this.stores = res.data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredStores(): Store[] {
    if (!this.search.trim()) return this.stores;
    const q = this.search.toLowerCase();
    return this.stores.filter(s => s.vendorName.toLowerCase().includes(q));
  }

  browseStore(store: Store): void {
    this.router.navigate(['/products'], {
      queryParams: { vendorId: store.vendorId, storeName: store.vendorName }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getImageUrl(image: string | null): string {
    if (!image) return '';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }
}
