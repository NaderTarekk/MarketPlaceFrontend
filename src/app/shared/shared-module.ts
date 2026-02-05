import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar.component/navbar.component';
import { FooterComponent } from './components/footer.component/footer.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppRoutingModule } from "../app-routing-module";
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './components/loader.component/loader.component';



@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule
],
  exports: [
    NavbarComponent,
    FooterComponent,
    TranslateModule,
    LoaderComponent
  ]
})
export class SharedModule { }
