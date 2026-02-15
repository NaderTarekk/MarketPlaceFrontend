import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesComponent } from './components/categories/categories.component';
import { FormsModule } from '@angular/forms';
import { CategoriesRoutingModule } from '../../routing/categories-routing-module';



@NgModule({
  declarations: [
    CategoriesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CategoriesRoutingModule
  ]
})
export class CategoriesModule { }
