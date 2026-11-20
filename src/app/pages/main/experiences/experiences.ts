import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { ExperienceApiService } from '@common/services/experience-api.service';
import { Experience } from '@interfaces/experience.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { switchMap } from 'rxjs';
import { ExperienceDialog } from './experience-dialog/experience-dialog';

interface DialogState {
  // Absent when adding a new experience.
  experience?: Experience;
  viewing: boolean;
}

@Component({
  selector: 'app-experiences',
  imports: [ExperienceDialog, TranslatePipe],
  templateUrl: './experiences.html',
  styleUrl: './experiences.scss'
})
export class Experiences {
  #experienceApi = inject(ExperienceApiService);

  experiences = input<Experience[]>([]);

  // Edited locally after each save; reset whenever the parent passes a new list.
  protected readonly items = linkedSignal(() => this.#sort(this.experiences()));
  protected readonly dialog = signal<DialogState | null>(null);

  protected add(): void {
    this.dialog.set({ viewing: false });
  }

  protected edit(experience: Experience): void {
    this.dialog.set({ experience, viewing: false });
  }

  protected view(experience: Experience): void {
    this.dialog.set({ experience, viewing: true });
  }

  protected closeDialog(): void {
    this.dialog.set(null);
  }

  protected save(experience: Experience): void {
    this.dialog.set(null);
    this.#experienceApi
      .save(experience)
      .pipe(switchMap(() => this.#experienceApi.list()))
      .subscribe({
        next: experiences => this.items.set(this.#sort(experiences)),
        error: error => console.error('Error saving experience:', error)
      });
  }

  protected delete(experience: Experience): void {
    this.#experienceApi.delete(experience.id).subscribe({
      next: () => this.items.update(items => items.filter(item => item.id !== experience.id)),
      error: error => console.error('Error deleting experience:', error)
    });
  }

  // Current position first, then by end date, most recent first.
  #sort(experiences: Experience[]): Experience[] {
    const endTime = (experience: Experience): number => new Date(experience.end_date || '9999-12-31').getTime();
    return [...experiences].sort((a, b) => {
      if (a.is_current !== b.is_current) return a.is_current ? -1 : 1;
      return endTime(b) - endTime(a);
    });
  }
}
