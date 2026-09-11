export enum ProductCategory {
  TEE_SHIRT = 'TEE_SHIRT',
  CD = 'CD',
  VINYLE = 'VINYLE'
}

export enum Size {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL'
}

export interface Product {
  id?: number;
  name: string;
  category: ProductCategory;
  size?: Size | null;
  price: number;
  homeStock: number;
  gigStock: number;
  alertThreshold: number;
}

export interface StockTransferRequest {
  quantity: number;
  toGigLocation: boolean;
}
