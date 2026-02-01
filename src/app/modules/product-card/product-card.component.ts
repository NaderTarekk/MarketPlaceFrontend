// product-card.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../home/home.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() wishlistToggle = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  constructor(public i18n: I18nService) {}

  onWishlist(): void {
    this.wishlistToggle.emit(this.product);
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }

  getStars(): number[] {
    return Array(5).fill(0).map((_, i) => i < this.product.rating ? 1 : 0);
  }
}