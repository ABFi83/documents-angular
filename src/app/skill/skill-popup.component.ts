import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Skill } from '../model/model';

@Component({
  selector: 'app-skill-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skill-popup.component.html',
  styleUrls: ['./skill-popup.component.css']
})
export class SkillPopupComponent implements OnInit {
  @Input() userSkills: Skill[] = [];

  @Output() confirm = new EventEmitter<{ skills: { id:number, name: string;}[] }>();
  @Output() cancel = new EventEmitter<void>();


  // Lista di skill suggerite per l'autocomplete
  allSkills: Skill[] = [
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
  filteredSkills: Skill[] = this.allSkills;
  skillName: string = '';
  addedSkills: Skill[] = [];
  skillLevel: string = 'Beginner';

  ngOnInit(): void {
    if (this.userSkills.length > 0) {
      this.addedSkills = [...this.userSkills];
    }
    console.log('SkillPopupComponent initialized with userSkills:', this.userSkills);
  }

  onSkillInput() {
    const value = this.skillName.toLowerCase();
    this.filteredSkills = this.allSkills.filter(skill => skill.name.toLowerCase().includes(value) && !this.addedSkills.some(s => s.name === skill.name));
  }

  addSkillToList() {
    const found = this.allSkills.find(s => s.name === this.skillName);
    if (this.skillName && found && !this.addedSkills.some(s => s.name === found.name)) {
      this.addedSkills.push({ ...found });
      this.skillName = '';
      this.skillLevel = 'Beginner'; // Reset the level to default
      this.filteredSkills = this.allSkills;
    }
  }

  onSkillBlur() {
    this.addSkillToList();
  }

  onSkillSelect() {
    this.addSkillToList();
  }

  onSkillOptionClick(option: Skill) {
    if (option && !this.addedSkills.some(s => s.name === option.name)) {
      this.addedSkills.push(option);
      this.skillName = '';
      this.filteredSkills = this.allSkills;
    }
  }

  removeAddedSkill(skill: Skill) {
    this.addedSkills = this.addedSkills.filter(s => s.name !== skill.name);
  }

  onConfirm() {
    this.confirm.emit({ skills: this.addedSkills.map(s => ({ id: s.id, name: s.name})) });
  }

  onCancel() {
    this.cancel.emit();
  }
}
