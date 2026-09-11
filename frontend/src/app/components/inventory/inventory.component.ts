import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, ProductCategory, StockTransferRequest } from '../../models/product.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  private readonly productService = inject(ProductService);

  products: Product[] = [];
  selectedCategory: string = 'ALL';
  onlyLowStock: boolean = false;
  searchQuery: string = '';

  // Gestion de la modale de transfert rapide
  selectedProductForTransfer: Product | null = null;
  transferQuantity: number = 1;
  transferToGig: boolean = true;
  transferErrorMessage: string | null = null;

  readonly categories = Object.values(ProductCategory);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const categoryFilter = this.selectedCategory !== 'ALL'
      ? (this.selectedCategory as ProductCategory)
      : undefined;

    this.productService.getAllProducts(categoryFilter).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Erreur de chargement des produits :', err);
      }
    });
  }

  // Filtrage combiné en mémoire pour la recherche et l'alerte
  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesAlert = this.onlyLowStock ? this.isLowStock(p) : true;
      return matchesSearch && matchesAlert;
    });
  }

  // Calculs pour les indicateurs (KPIs)
  get totalValue(): number {
    return this.products.reduce((acc, p) => acc + (p.price * (p.homeStock + p.gigStock)), 0);
  }

  get lowStockCount(): number {
    return this.products.filter(p => this.isLowStock(p)).length;
  }

  isLowStock(p: Product): boolean {
    return (p.homeStock + p.gigStock) <= p.alertThreshold;
  }

  // Actions de transfert
  openTransferModal(product: Product): void {
    this.selectedProductForTransfer = product;
    this.transferQuantity = 1;
    this.transferToGig = true;
    this.transferErrorMessage = null;
  }

  closeTransferModal(): void {
    this.selectedProductForTransfer = null;
    this.transferErrorMessage = null;
  }

  confirmTransfer(): void {
    if (!this.selectedProductForTransfer?.id) return;

    const request: StockTransferRequest = {
      quantity: this.transferQuantity,
      toGigLocation: this.transferToGig
    };

    this.productService.transferStock(this.selectedProductForTransfer.id, request).subscribe({
      next: () => {
        this.closeTransferModal();
        this.loadProducts();
      },
      error: (err) => {
        this.transferErrorMessage = err.error?.message || 'Erreur lors du transfert de stock.';
      }
    });
  }
}
