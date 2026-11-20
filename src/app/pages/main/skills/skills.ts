import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { SkillApiService } from '@common/services/skill-api.service';
import { Skill } from '@interfaces/skill.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { SkillDialog } from './skill-dialog/skill-dialog';

@Component({
  selector: 'app-skills',
  imports: [SkillDialog, TranslatePipe],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class Skills {
  #skillApi = inject(SkillApiService);

  skills = input<Skill[]>([]);

  // Edited locally after each save; reset whenever the parent passes a new list.
  protected readonly items = linkedSignal(() => this.skills());
  protected readonly dialogOpen = signal(false);

  protected remove(skill: Skill): void {
    this.#skillApi.delete(skill.id).subscribe({
      next: () => this.items.update(items => items.filter(item => item.id !== skill.id)),
      error: error => console.error('Error deleting skill:', error)
    });
  }

  protected openDialog(): void {
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
  }

  protected save(skills: Skill[]): void {
    this.items.set(skills);
    this.dialogOpen.set(false);
    this.#skillApi.save(skills).subscribe({ error: error => console.error('Error saving skills:', error) });
  }
}
