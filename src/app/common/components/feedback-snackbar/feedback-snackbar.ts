import { Component, inject } from '@angular/core';
import { HttpFeedbackService } from '@common/services/http-feedback.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-feedback-snackbar',
  imports: [TranslatePipe],
  templateUrl: './feedback-snackbar.html',
  styleUrl: './feedback-snackbar.scss'
})
export class FeedbackSnackbar {
  #feedback = inject(HttpFeedbackService);

  protected readonly notifications = this.#feedback.notifications;

  protected dismiss(id: string): void {
    this.#feedback.dismiss(id);
  }
}
