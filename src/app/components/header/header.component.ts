import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterLink],
  template: `
    <mat-toolbar color="primary" class="header">
      <span>Inventory Management System</span>
      <div class="spacer"></div>
      <button mat-button routerLink="/inventory">Inventory List</button>
      <button mat-button routerLink="/inventory/new">Add New Item</button>
    </mat-toolbar>
  `,
  styles: `
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    .spacer {
      flex: 1 1 auto;
    }
  `
})
export class HeaderComponent { }
