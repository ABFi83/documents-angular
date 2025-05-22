import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  showError(message: string): void {
    alert(message); // Puoi sostituire questo con un componente di notifica personalizzato
  }
}
