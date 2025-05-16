import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  template: '<router-outlet></router-outlet>',
  standalone: true,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'documents-angular';
}
