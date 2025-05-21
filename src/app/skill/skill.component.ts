import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Skill } from '../model/model';

@Component({
  selector: 'app-skill',
  imports: [CommonModule],
  templateUrl: './skill.component.html',
  styleUrls: ['./skill.component.css']
})
export class SkillComponent {
  @Input() skills: Skill[] = [];

  removeSkill(skill: Skill) {
    // Logica per rimuovere la skill (da implementare secondo le necessità)
    this.skills = this.skills.filter(s => s.id !== skill.id);
  }

  addSkill() {
    // Logica per aggiungere una skill (da implementare secondo le necessità)
    alert('Aggiungi skill (da implementare)');
  }
}
