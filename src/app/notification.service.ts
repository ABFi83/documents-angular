import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  showError(message: string): void {
    this.toastr.error(message, 'Errore', {
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
    });
  }

  showSuccess(message: string): void {
    this.toastr.success(message, 'Successo', {
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
    });
  }
}
