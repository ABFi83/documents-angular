import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Experience } from '../model/model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  providers: [DatePipe]
})
export class ExperienceComponent {
  @Input() experiences: Experience[] = [];

  constructor(private datePipe: DatePipe) {

    console.log('Experiences:', this.experiences);
  }
  addExperience() {
    // Logica per aggiungere una nuova esperienza (da implementare)
    alert('Aggiungi esperienza (da implementare)');
  }

  removeExperience(exp: Experience) {
    // Logica per rimuovere l'esperienza (da implementare)
    this.experiences = this.experiences.filter(e => e.id !== exp.id);
  }
}
