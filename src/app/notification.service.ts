import { Injectable, inject } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toast = inject(HotToastService);

  showError(message: string): void {
    this.toast.error(message);
  }

  showSuccess(message: string): void {
    this.toast.success(message);
  }
}
