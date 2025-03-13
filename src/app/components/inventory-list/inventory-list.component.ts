import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { InventoryItem, StockStatus } from '../../models/inventory-item.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule
  ]
})
export class InventoryListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'category', 'quantity', 'status', 'lastUpdated', 'actions'];
  dataSource = new MatTableDataSource<InventoryItem>([]);
  searchControl = new FormControl('');
  statusFilter = new FormControl<StockStatus | null>(null);
  loading = true;
  stockStatusOptions = Object.values(StockStatus);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadInventoryItems();

    // Set up search with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Set up status filter
    this.statusFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadInventoryItems(): void {
    this.loading = true;
    this.inventoryService.getInventoryItems().subscribe({
      next: (items) => {
        this.dataSource.data = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading inventory items', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loading = true;
    this.inventoryService.searchAndFilterItems(
      this.searchControl.value || '',
      this.statusFilter.value
    ).subscribe({
      next: (filteredItems) => {
        this.dataSource.data = filteredItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error applying filters', error);
        this.loading = false;
      }
    });
  }

  viewItem(item: InventoryItem): void {
    this.router.navigate(['/inventory', item.id]);
  }

  editItem(item: InventoryItem): void {
    this.router.navigate(['/inventory', item.id, 'edit']);
  }

  getStockStatusClass(status?: StockStatus): string {
    if (status === StockStatus.OUT_OF_STOCK) return 'status-out';
    if (status === StockStatus.LOW) return 'status-low';
    return 'status-in';
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue(null);
  }
}
