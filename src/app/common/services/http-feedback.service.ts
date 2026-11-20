import { Service, signal } from '@angular/core';
import { HttpFeedbackNotification } from '@interfaces/http-feedback.interface';

const DISMISS_AFTER_MS = 3000;

/** Error notifications shown by `FeedbackSnackbar`, closed after a few seconds or by the user. */
@Service()
export class HttpFeedbackService {
  readonly #items = signal<HttpFeedbackNotification[]>([]);
  readonly notifications = this.#items.asReadonly();

  notifyError(message: string): void {
    // Parallel failing requests would otherwise stack identical snackbars.
    if (this.#items().some(item => item.message === message)) return;
    const id = crypto.randomUUID();
    this.#items.update(items => [...items, { id, message }]);
    setTimeout(() => this.dismiss(id), DISMISS_AFTER_MS);
  }

  dismiss(id: string): void {
    this.#items.update(items => items.filter(item => item.id !== id));
  }
}
