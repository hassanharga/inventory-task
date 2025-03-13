import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { InventoryItem, StockStatus } from '../../models/inventory-item.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-detail',
  templateUrl: './inventory-detail.component.html',
  styleUrls: ['./inventory-detail.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ]
})
export class InventoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private snackBar = inject(MatSnackBar);

  item: InventoryItem | undefined;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.inventoryService.getInventoryItem(id);
      })
    ).subscribe({
      next: (item) => {
        this.item = item;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading item details', err);
        this.error = true;
        this.loading = false;
        this.snackBar.open('Error loading item details', 'Close', {
          duration: 3000
        });
      }
    });
  }

  editItem(): void {
    if (this.item) {
      this.router.navigate(['/inventory', this.item.id, 'edit']);
    }
  }

  deleteItem(): void {
    if (!this.item) return;

    if (confirm('Are you sure you want to delete this item?')) {
      this.inventoryService.deleteInventoryItem(this.item.id).subscribe({
        next: () => {
          this.snackBar.open('Item deleted successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/inventory']);
        },
        error: (err) => {
          console.error('Error deleting item', err);
          this.snackBar.open('Error deleting item', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/inventory']);
  }

  getStockStatusClass(status?: StockStatus): string {
    if (status === StockStatus.OUT_OF_STOCK) return 'status-out';
    if (status === StockStatus.LOW) return 'status-low';
    return 'status-in';
  }
}
