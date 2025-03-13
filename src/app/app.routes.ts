import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/inventory', pathMatch: 'full' },
  {
    path: 'inventory', loadComponent: () => import('./components/inventory-list/inventory-list.component')
      .then(m => m.InventoryListComponent),
  },
  {
    path: 'inventory/new', loadComponent: () => import('./components/inventory-form/inventory-form.component')
      .then(m => m.InventoryFormComponent)
  },
  {
    path: 'inventory/:id', loadComponent: () => import('./components/inventory-detail/inventory-detail.component')
      .then(m => m.InventoryDetailComponent)
  },
  {
    path: 'inventory/:id/edit', loadComponent: () => import('./components/inventory-form/inventory-form.component')
      .then(m => m.InventoryFormComponent)
  },
  { path: '**', redirectTo: '/inventory' }
];
