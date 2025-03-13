import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { InventoryItem, StockStatus } from '../models/inventory-item.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  // Mock data for inventory items
  private initialItems: InventoryItem[] = [
    {
      id: 1,
      name: 'Laptop',
      category: 'Electronics',
      quantity: 15,
      lastUpdated: new Date('2023-12-01'),
      price: 999.99,
      description: 'High performance laptop with 16GB RAM'
    },
    {
      id: 2,
      name: 'Desk Chair',
      category: 'Furniture',
      quantity: 5,
      lastUpdated: new Date('2023-12-10'),
      price: 199.99,
      description: 'Ergonomic office chair'
    },
    {
      id: 3,
      name: 'Wireless Mouse',
      category: 'Electronics',
      quantity: 0,
      lastUpdated: new Date('2023-11-15'),
      price: 29.99,
      description: 'Bluetooth wireless mouse'
    },
    {
      id: 4,
      name: 'Coffee Maker',
      category: 'Appliances',
      quantity: 3,
      lastUpdated: new Date('2023-12-05'),
      price: 89.99,
      description: 'Programmable coffee machine'
    }
  ];

  // BehaviorSubject for state management
  private inventorySubject = new BehaviorSubject<InventoryItem[]>(this.initialItems);
  inventory$ = this.inventorySubject.asObservable();

  constructor() {
    // Set the stock status for each item
    this.updateInventoryStatus();
  }

  private updateInventoryStatus(): void {
    const updatedItems = this.inventorySubject.getValue().map(item => ({
      ...item,
      status: this.calculateStockStatus(item.quantity)
    }));
    this.inventorySubject.next(updatedItems);
  }

  private calculateStockStatus(quantity: number): StockStatus {
    if (quantity <= 0) {
      return StockStatus.OUT_OF_STOCK;
    } else if (quantity < 5) {
      return StockStatus.LOW;
    } else {
      return StockStatus.IN_STOCK;
    }
  }

  getInventoryItems(): Observable<InventoryItem[]> {
    return this.inventory$.pipe(
      delay(300) // Simulate network delay
    );
  }

  getInventoryItem(id: number): Observable<InventoryItem> {
    return this.inventory$.pipe(
      map(items => items.find(item => item.id === id)),
      map(item => {
        if (!item) {
          throw new Error(`Item with ID ${id} not found`);
        }
        return item;
      }),
      delay(300) // Simulate network delay
    );
  }

  addInventoryItem(item: Omit<InventoryItem, 'id' | 'status'>): Observable<InventoryItem> {
    const currentItems = this.inventorySubject.getValue();
    const newId = Math.max(...currentItems.map(i => i.id), 0) + 1;

    const newItem: InventoryItem = {
      ...item,
      id: newId,
      status: this.calculateStockStatus(item.quantity)
    };

    const updatedItems = [...currentItems, newItem];
    this.inventorySubject.next(updatedItems);

    return of(newItem).pipe(delay(300)); // Simulate network delay
  }

  updateInventoryItem(updatedItem: InventoryItem): Observable<InventoryItem> {
    const currentItems = this.inventorySubject.getValue();
    const itemIndex = currentItems.findIndex(item => item.id === updatedItem.id);

    if (itemIndex === -1) {
      return throwError(() => new Error(`Item with ID ${updatedItem.id} not found`));
    }

    updatedItem.status = this.calculateStockStatus(updatedItem.quantity);
    const updatedItems = [...currentItems];
    updatedItems[itemIndex] = updatedItem;

    this.inventorySubject.next(updatedItems);
    return of(updatedItem).pipe(delay(300)); // Simulate network delay
  }

  deleteInventoryItem(id: number): Observable<void> {
    const currentItems = this.inventorySubject.getValue();
    const updatedItems = currentItems.filter(item => item.id !== id);

    if (currentItems.length === updatedItems.length) {
      return throwError(() => new Error(`Item with ID ${id} not found`));
    }

    this.inventorySubject.next(updatedItems);
    return of(undefined).pipe(delay(300)); // Simulate network delay
  }

  searchAndFilterItems(searchTerm: string = '', statusFilter: StockStatus | null = null): Observable<InventoryItem[]> {
    return this.inventory$.pipe(
      map(items => {
        let filteredItems = items;

        // Apply search term filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term)
          );
        }

        // Apply status filter
        if (statusFilter) {
          filteredItems = filteredItems.filter(item => item.status === statusFilter);
        }

        return filteredItems;
      }),
      delay(300) // Simulate network delay
    );
  }
}
