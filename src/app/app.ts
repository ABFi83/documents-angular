import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackSnackbar } from '@common/components/feedback-snackbar/feedback-snackbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FeedbackSnackbar],
  template: '<router-outlet /><app-feedback-snackbar />'
})
export class App {}
