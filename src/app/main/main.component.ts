import { DocumentUploadComponent } from './../document-upload/document-upload.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { UserComponent } from '../user/user.component';
import { UserService } from '../user/user.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { User } from '../../model/model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterModule, HeaderComponent, CommonModule, DocumentUploadComponent, UserComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  showDocumentUpload: boolean = true; // Aggiunta della proprietà per controllare quale componente mostrare
  user: User | null = null;

  constructor(private userService: UserService, private http: HttpClient) {
    this.initializeUser();
  }

  private async initializeUser(): Promise<void> {
    let user: User = await firstValueFrom(this.userService.getUser());
    this.user = user;
    if(user.documents && user.documents.length > 0) {
      this.showDocumentUpload = false;
    }
  }


}
