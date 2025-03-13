import { TestBed } from '@angular/core/testing';
import { StockStatus } from '../models/inventory-item.model';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a new inventory item', (done) => {
    const initialLength = 4; // Based on our mock data

    const newItem = {
      name: 'Test Item',
      category: 'Test Category',
      quantity: 10,
      lastUpdated: new Date(),
      price: 99.99,
      description: 'Test description'
    };

    service.addInventoryItem(newItem).subscribe(result => {
      expect(result).toBeTruthy();
      expect(result.name).toBe('Test Item');
      expect(result.status).toBe(StockStatus.IN_STOCK);

      service.getInventoryItems().subscribe(items => {
        expect(items.length).toBe(initialLength + 1);
        done();
      });
    });
  });

  it('should filter items by search term and status', (done) => {
    // Search for 'laptop' in the Electronics category
    service.searchAndFilterItems('laptop', StockStatus.IN_STOCK).subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Laptop');
      done();
    });
  });
});
