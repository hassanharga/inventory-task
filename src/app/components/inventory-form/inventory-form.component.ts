
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InventoryItem } from '../../models/inventory-item.model';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
]
})
export class InventoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);
  private snackBar = inject(MatSnackBar);

  inventoryForm!: FormGroup;
  isEditMode = false;
  itemId?: number;
  loading = false;
  categories = ['Electronics', 'Furniture', 'Appliances', 'Office Supplies', 'Other'];

  ngOnInit(): void {
    this.createForm();
    this.checkEditMode();
  }

  createForm(): void {
    this.inventoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
      price: [null, [Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      description: [''],
      lastUpdated: [new Date(), Validators.required]
    });
  }

  checkEditMode(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.itemId = +id;
          this.loading = true;
          return this.inventoryService.getInventoryItem(+id).pipe(
            catchError(err => {
              this.snackBar.open('Item not found', 'Close', { duration: 3000 });
              this.router.navigate(['/inventory']);
              return of(null);
            })
          );
        }
        return of(null);
      })
    ).subscribe(item => {
      if (item) {
        this.populateForm(item);
      }
      this.loading = false;
    });
  }

  populateForm(item: InventoryItem): void {
    this.inventoryForm.patchValue({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      description: item.description,
      lastUpdated: new Date(item.lastUpdated)
    });
  }

  onSubmit(): void {
    if (this.inventoryForm.invalid) {
      this.markFormGroupTouched(this.inventoryForm);
      return;
    }

    const formValues = this.inventoryForm.value;
    this.loading = true;

    if (this.isEditMode && this.itemId) {
      const updatedItem: InventoryItem = {
        ...formValues,
        id: this.itemId
      };

      this.inventoryService.updateInventoryItem(updatedItem).subscribe({
        next: () => {
          this.snackBar.open('Item updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/inventory']);
        },
        error: (err) => {
          console.error('Error updating item', err);
          this.snackBar.open('Error updating item', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.inventoryService.addInventoryItem(formValues).subscribe({
        next: () => {
          this.snackBar.open('Item added successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/inventory']);
        },
        error: (err) => {
          console.error('Error adding item', err);
          this.snackBar.open('Error adding item', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  get title(): string {
    return this.isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item';
  }
}
