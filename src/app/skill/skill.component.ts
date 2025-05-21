import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Skill } from '../model/model';
import { SkillPopupComponent } from './skill-popup.component';
import { SkillService } from './skill.service';

@Component({
  selector: 'app-skill',
  imports: [CommonModule, FormsModule, SkillPopupComponent],
  templateUrl: './skill.component.html',
  styleUrls: ['./skill.component.css']
})
export class SkillComponent {
  @Input() skills: Skill[] = [];
  userSkills: Skill[] = [];

  showAddSkillPopup = false;


  constructor(private skillService:SkillService) {
  }
  removeSkill(skill: Skill) {
    // Logica per rimuovere la skill (da implementare secondo le necessità)
    this.skills = this.skills.filter(s => s.id !== skill.id);
    this.skillService.deleteSkill(skill).subscribe({
      next: (response) => {
        console.log('Skills saved successfully:', response);
      },
      error: (error) => {
        console.error('Error saving skills:', error);
      }
    });
  }

  addSkill() {
    // Aggiorna userSkills con una copia delle skills attuali
    this.userSkills = this.skills ? [...this.skills] : [];
    console.log('userSkills on open:', this.userSkills);
    this.showAddSkillPopup = true;
  }

  onSkillPopupConfirm(event: { skills: { id: number,  name: string; }[] }) {
    this.skills = event.skills.map(s => ({ ...s }));
    this.showAddSkillPopup = false;
    this.skillService.postSkill(this.skills).subscribe({
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
