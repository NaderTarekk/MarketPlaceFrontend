import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar.component/navbar.component';
import { FooterComponent } from './components/footer.component/footer.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    TranslateModule
  ]
})
export class SharedModule { }
