import { Routes } from '@angular/router';
import { InventoryComponent } from './components/inventory/inventory.component';
import {PosComponent} from './pos/pos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'inventory', component: InventoryComponent },
  { path: 'pos', component: PosComponent }
];
