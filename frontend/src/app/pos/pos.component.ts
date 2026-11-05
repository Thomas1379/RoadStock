import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, CartItem, CreateSaleRequest } from '../services/product.service';
import {Product} from '../models/product.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Tous'];
  selectedCategory: string = 'Tous';

  cart: CartItem[] = [];
  paymentMethod: 'CASH' | 'CARD' = 'CARD';

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        // En caisse concert, on ne vend que les articles ayant du stock sur place
        this.products = data.filter(p => p.gigStock > 0);
        this.extractCategories();
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les articles de caisse.';
        this.isLoading = false;
      }
    });
  }

  extractCategories(): void {
    const set = new Set(this.products.map(p => p.category).filter(Boolean));
    this.categories = ['Tous', ...Array.from(set)];
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedCategory === 'Tous') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p => p.category === this.selectedCategory);
    }
  }

  addToCart(product: Product): void {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.gigStock) {
        existing.quantity++;
      }
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.product.gigStock) {
      item.quantity++;
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeFromCart(item);
    }
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(i => i.product.id !== item.product.id);
  }

  clearCart(): void {
    this.cart = [];
  }

  get totalAmount(): number {
    return this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  get totalItemsCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  validateSale(): void {
    if (this.cart.length === 0) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateSaleRequest = {
      paymentMethod: this.paymentMethod,
      items: this.cart.map(item => ({
        productId: item.product.id!,
        quantity: item.quantity
      }))
    };

    this.productService.createSale(payload).subscribe({
      next: () => {
        this.successMessage = `Vente de ${this.totalAmount.toFixed(2)} € validée (${this.paymentMethod === 'CARD' ? 'CB' : 'Espèces'}) !`;
        this.clearCart();
        this.loadProducts(); // recharge les stocks décrémentés
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'encaissement.';
        this.isLoading = false;
      }
    });
  }
}
