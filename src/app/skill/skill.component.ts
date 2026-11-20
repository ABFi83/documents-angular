
import { Component, ChangeDetectionStrategy, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Skill } from '../model/model';
import { SkillPopupComponent } from './skill-popup.component';
import { SkillService } from './skill.service';

@Component({
  selector: 'app-skill',
  imports: [FormsModule, SkillPopupComponent],
  templateUrl: './skill.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./skill.component.css']
})
export class SkillComponent {
  skillsInput = input<Skill[]>([], { alias: "skills" });
  skills = linkedSignal(() => this.skillsInput());
  userSkills: Skill[] = [];

  showAddSkillPopup = false;

  constructor(private skillService:SkillService) {
  }
  removeSkill(skill: Skill) {

    this.skillService.deleteSkill(skill).subscribe({
      next: (response) => {
        this.skills.update(skills => skills.filter(s => s.id !== skill.id));
        console.log('Skills saved successfully:', response);
      },
      error: (error) => {
        console.error('Error saving skills:', error);
      }
    });
  }

  addSkill() {
    this.userSkills = [...this.skills()];
    console.log('userSkills on open:', this.userSkills);
    this.showAddSkillPopup = true;
  }

  onSkillPopupConfirm(event: { skills: { id: number,  name: string; }[] }) {
    this.skills.set(event.skills.map(s => ({ ...s })));
    this.showAddSkillPopup = false;
    this.skillService.postSkill(this.skills()).subscribe({
        next: (response) => {
          console.log('Skills saved successfully:', response);
        },
        error: (error) => {
          console.error('Error saving skills:', error);
        }
      }
    );
    }




  generateId(): number {
    return Math.floor(Math.random() * 10000);
  }

  onSkillPopupCancel() {
    this.showAddSkillPopup = false;
  }

}
