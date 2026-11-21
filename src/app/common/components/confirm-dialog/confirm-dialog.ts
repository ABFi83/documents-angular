import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** Modal asking to confirm a destructive action. Render it with `@if` to open it; it closes through its outputs. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [TranslatePipe],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  title = input.required<string>();
  message = input.required<string>();
  confirmLabel = input.required<string>();

  confirmed = output();
  cancelled = output();

  protected readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected confirm(): void {
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
