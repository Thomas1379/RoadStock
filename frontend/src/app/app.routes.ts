import { Routes } from '@angular/router';
import { InventoryComponent } from './components/inventory/inventory.component';
import {PosComponent} from './pos/pos.component';
import {HistoryComponent} from './history/history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'inventory', component: InventoryComponent },
  { path: 'pos', component: PosComponent },
  { path: 'history', component: HistoryComponent }
];
