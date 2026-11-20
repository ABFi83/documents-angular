import { afterNextRender, Component, ElementRef, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { disabled, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Experience } from '@interfaces/experience.interface';
import { TranslatePipe } from '@ngx-translate/core';

type ExperienceModel = Omit<Experience, 'id'>;

// The BE stores the end date of the current position as this literal.
const PRESENT = 'Present';

@Component({
  selector: 'app-experience-dialog',
  imports: [FormField, FormRoot, TranslatePipe],
  templateUrl: './experience-dialog.html',
  styleUrl: './experience-dialog.scss'
})
export class ExperienceDialog {
  // Absent when adding a new experience.
  experience = input<Experience>();
  viewing = input(false);
  confirmed = output<Experience>();
  cancelled = output();

  protected readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  // Red borders on the missing required fields, from the first confirm on.
  protected readonly showErrors = signal(false);
  protected readonly experienceForm = form(
    linkedSignal(() => this.#toModel(this.experience())),
    path => {
      disabled(path, () => this.viewing());
      required(path.company_name);
      required(path.role);
      required(path.start_date);
      required(path.end_date, { when: ({ valueOf }) => !valueOf(path.is_current) });
      disabled(path.end_date, ({ valueOf }) => valueOf(path.is_current));
    },
    {
      submission: {
        action: async () => this.#confirm(),
        onInvalid: () => this.showErrors.set(true)
      }
    }
  );

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  #confirm(): undefined {
    const value = this.experienceForm().value();
    this.confirmed.emit({
      ...value,
      id: this.experience()?.id ?? 0,
      end_date: value.is_current ? PRESENT : value.end_date
    });
  }

  #toModel(experience: Experience | undefined): ExperienceModel {
    return {
      company_name: experience?.company_name ?? '',
      role: experience?.role ?? '',
      description: experience?.description ?? '',
      start_date: experience?.start_date ?? '',
      end_date: experience?.end_date && experience.end_date !== PRESENT ? experience.end_date : '',
      is_current: !!experience?.is_current
    };
  }
}
