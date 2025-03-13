export enum StockStatus {
  LOW = 'Low Stock',
  IN_STOCK = 'In Stock',
  OUT_OF_STOCK = 'Out of Stock'
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  lastUpdated: Date;
  description?: string;
  price?: number;
  status?: StockStatus;
}
