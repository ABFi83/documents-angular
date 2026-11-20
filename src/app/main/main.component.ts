import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { HeaderComponent } from '../header/header.component';
import { UserComponent } from '../user/user.component';
import { UserService } from '../user/user.service';
import { User } from '../model/model';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, DocumentUploadComponent, UserComponent],
  templateUrl: './main.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  showDocumentUpload = signal(true);
  user = signal<User | null>(null);

  constructor(private userService: UserService) {
    this.initializeUser();
  }

  uploadFileCompleted() {
    this.showDocumentUpload.set(false);
    this.getUser();
  }

  resetEvent() {
    this.showDocumentUpload.set(true);
  }

  async initializeUser(): Promise<void> {
    const user = await firstValueFrom(this.userService.getUser());
    this.user.set(user);
    if (user.documents && user.documents.length > 0) {
      this.showDocumentUpload.set(false);
    }
  }

  async getUser() {
    this.user.set(await firstValueFrom(this.userService.getUser()));
  }
}
