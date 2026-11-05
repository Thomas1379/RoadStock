import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, SaleResponse } from '../services/product.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  sales: SaleResponse[] = [];
  filteredSales: SaleResponse[] = [];

  // Filtres
  selectedPaymentFilter: 'ALL' | 'CARD' | 'CASH' = 'ALL';

  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadSalesHistory();
  }

  loadSalesHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getAllSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger l\'historique des ventes.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(payment: 'ALL' | 'CARD' | 'CASH'): void {
    this.selectedPaymentFilter = payment;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedPaymentFilter === 'ALL') {
      this.filteredSales = [...this.sales];
    } else {
      this.filteredSales = this.sales.filter(s => s.paymentMethod === this.selectedPaymentFilter);
    }
  }

  // --- Indicateurs KPI calculés dynamiquement ---

  get totalRevenue(): number {
    return this.filteredSales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  }

  get cardRevenue(): number {
    return this.filteredSales
      .filter(s => s.paymentMethod === 'CARD')
      .reduce((acc, sale) => acc + sale.totalAmount, 0);
  }

  get cashRevenue(): number {
    return this.filteredSales
      .filter(s => s.paymentMethod === 'CASH')
      .reduce((acc, sale) => acc + sale.totalAmount, 0);
  }

  get cardPercentage(): number {
    if (this.totalRevenue === 0) return 0;
    return Math.round((this.cardRevenue / this.totalRevenue) * 100);
  }

  get cashPercentage(): number {
    if (this.totalRevenue === 0) return 0;
    return Math.round((this.cashRevenue / this.totalRevenue) * 100);
  }

  get totalItemsSold(): number {
    return this.filteredSales.reduce((total, sale) => {
      const itemsInSale = sale.items ? sale.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      return total + itemsInSale;
    }, 0);
  }

  // Méthode de simulation de l'export CSV
  exportToCsv(): void {
    if (this.filteredSales.length === 0) {
      alert('Aucune vente à exporter.');
      return;
    }

    const headers = ['N Ticket', 'Date', 'Moyen de paiement', 'Montant Total', 'Articles vendus'];
    const rows = this.filteredSales.map(sale => {
      const articlesStr = sale.items
        ? sale.items.map(i => `${i.quantity}x ${i.product?.name || 'Article'} (${i.unitPrice}€)`).join(' | ')
        : '';
      return [
        `TK-${sale.id.toString().padStart(4, '0')}`,
        new Date(sale.saleDate).toLocaleString('fr-FR'),
        sale.paymentMethod === 'CARD' ? 'CB (SumUp)' : 'Espèces',
        `${sale.totalAmount.toFixed(2)} €`,
        `"${articlesStr}"`
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_ventes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
