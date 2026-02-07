import { Component } from '@angular/core';
import { SharedService, ToastState } from '../../services/shared.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toastr',
  standalone: false,
  templateUrl: './toastr.component.html',
  styleUrl: './toastr.component.css',
})
export class ToastrComponent {
  toast$!: Observable<ToastState>;

  constructor(public toastService: SharedService) {
    this.toast$ = this.toastService.toast$;
  }
}
