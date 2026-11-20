import { afterNextRender, Component, computed, ElementRef, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Skill } from '@interfaces/skill.interface';
import { TranslatePipe } from '@ngx-translate/core';

// Suggestions for the skill input; only these skills can be added.
const SKILL_CATALOG: readonly Skill[] = [
  { id: 1, name: 'Javascript' },
  { id: 2, name: 'Java' },
  { id: 3, name: 'Python' },
  { id: 4, name: 'C#' },
  { id: 5, name: 'Angular' },
  { id: 6, name: 'React' },
  { id: 7, name: 'Vue.js' },
  { id: 8, name: 'Spring Boot' },
  { id: 9, name: 'Google Suite' },
  { id: 10, name: 'SQL' },
  { id: 11, name: 'Node.js' },
  { id: 12, name: 'HTML' },
  { id: 13, name: 'CSS' },
  { id: 14, name: 'TypeScript' },
  { id: 15, name: 'Docker' },
  { id: 16, name: 'Kubernetes' },
  { id: 17, name: 'AWS' },
  { id: 18, name: 'Azure' },
  { id: 19, name: 'GCP' },
  { id: 20, name: 'Git' },
  { id: 21, name: 'Linux' }
];

@Component({
  selector: 'app-skill-dialog',
  imports: [FormField, TranslatePipe],
  templateUrl: './skill-dialog.html',
  styleUrl: './skill-dialog.scss'
})
export class SkillDialog {
  skills = input<Skill[]>([]);
  confirmed = output<Skill[]>();
  cancelled = output();

  protected readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly added = linkedSignal(() => [...this.skills()]);
  protected readonly search = form(signal({ name: '' }));
  protected readonly suggestions = computed(() => {
    const query = this.search.name().value().toLowerCase();
    return SKILL_CATALOG.filter(skill => skill.name.toLowerCase().includes(query) && !this.#isAdded(skill));
  });

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  // Adds the typed skill when it matches a catalog entry exactly.
  protected addTyped(): void {
    const found = SKILL_CATALOG.find(skill => skill.name === this.search.name().value());
    if (!found || this.#isAdded(found)) return;
    this.added.update(added => [...added, { ...found }]);
    this.search.name().value.set('');
  }

  protected remove(skill: Skill): void {
    this.added.update(added => added.filter(item => item.name !== skill.name));
  }

  protected confirm(): void {
    this.confirmed.emit(this.added().map(({ id, name }) => ({ id, name })));
  }

  protected cancel(): void {
    this.cancelled.emit();
  }

  #isAdded(skill: Skill): boolean {
    return this.added().some(item => item.name === skill.name);
  }
}
