import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCategory, StockTransferRequest } from '../models/product.model';

export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateSaleRequest {
  paymentMethod: 'CASH' | 'CARD';
  items: SaleItemRequest[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItemResponse {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface SaleResponse {
  id: number;
  saleDate: string;
  paymentMethod: 'CASH' | 'CARD';
  totalAmount: number;
  items: SaleItemResponse[];
}

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/products';

  getAllProducts(category?: ProductCategory): Observable<Product[]> {
    if (category) {
      return this.http.get<Product[]>(`${this.apiUrl}?category=${category}`);
    }
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getGigAvailableProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/gig-available`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  transferStock(id: number, request: StockTransferRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/transfer`, request);
  }

  createSale(request: CreateSaleRequest): Observable<any> {
    return this.http.post('http://localhost:8080/api/sales', request);
  }

  getAllSales(): Observable<SaleResponse[]> {
    return this.http.get<SaleResponse[]>('http://localhost:8080/api/sales');
  }

}
