import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { InventoryService } from '../../services/inventory.service';
import { InventoryFormComponent } from './inventory-form.component';

describe('InventoryFormComponent', () => {
  let component: InventoryFormComponent;
  let fixture: ComponentFixture<InventoryFormComponent>;
  let inventoryServiceSpy: jasmine.SpyObj<InventoryService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const spyInventoryService = jasmine.createSpyObj('InventoryService', [
      'getInventoryItem',
      'addInventoryItem',
      'updateInventoryItem'
    ]);

    const spySnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        InventoryFormComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: InventoryService, useValue: spyInventoryService },
        { provide: MatSnackBar, useValue: spySnackBar },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => null }) // Set up for create mode
          }
        }
      ]
    }).compileComponents();

    inventoryServiceSpy = TestBed.inject(InventoryService) as jasmine.SpyObj<InventoryService>;
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture = TestBed.createComponent(InventoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.inventoryForm).toBeDefined();
    expect(component.inventoryForm.get('name')?.value).toBe('');
    expect(component.inventoryForm.get('category')?.value).toBe('');
    expect(component.inventoryForm.get('quantity')?.value).toBe(0);
  });

  it('should validate required fields', () => {
    const nameControl = component.inventoryForm.get('name');
    const categoryControl = component.inventoryForm.get('category');

    nameControl?.setValue('');
    categoryControl?.setValue('');

    expect(nameControl?.valid).toBeFalsy();
    expect(categoryControl?.valid).toBeFalsy();
    expect(component.inventoryForm.valid).toBeFalsy();
  });

  it('should validate quantity is non-negative', () => {
    const quantityControl = component.inventoryForm.get('quantity');

    quantityControl?.setValue(-1);
    expect(quantityControl?.valid).toBeFalsy();

    quantityControl?.setValue(0);
    expect(quantityControl?.valid).toBeTruthy();

    quantityControl?.setValue(10);
    expect(quantityControl?.valid).toBeTruthy();
  });
});
