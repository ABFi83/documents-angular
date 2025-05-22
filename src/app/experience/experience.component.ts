import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Experience } from '../model/model';
import { ExperiencePopupComponent } from './experience-popup.component';
import { ExperienceService } from './experience.service';
import e from 'express';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, ExperiencePopupComponent],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  providers: [DatePipe]
})
export class ExperienceComponent {
  @Input() experiences: Experience[] = [];
  userExperiences: Experience | undefined;
  showAddExperiencePopup = false;
  isViewing=false;
constructor(private experienceService:ExperienceService) { }
  addExperience() {
    this.showAddExperiencePopup = true;
    this.userExperiences=undefined
    this.isViewing=false;
  }

  onExperiencePopupConfirm(event: { experience: Experience }) {
    this.userExperiences = event.experience;
    this.showAddExperiencePopup = false;
    this.experienceService.manageExperience(this.userExperiences).subscribe({
      next: (response) => {
        window.location.reload();
      },
      error: (error) => {
        console.error('Error saving experience:', error);
      }
    });
  }

  onExperiencePopupCancel() {
    this.showAddExperiencePopup = false;
  }

  editExperience(experience: Experience) {
    console.log('Editing experience:', experience);
    this.showAddExperiencePopup = true;
    this.userExperiences = experience;
    this.isViewing = false;
  }

  viewExperience(experience: Experience) {
    console.log('View experience:', experience);
    this.showAddExperiencePopup = true;
    this.userExperiences = experience;
    this.isViewing = true;
  }


  deleteExperience(experience: Experience) {
    this.experienceService.deleteExperience(experience.id).subscribe({
      next: (response) => {
        this.experiences = this.experiences.filter(e => e.id !== experience.id);
      },
      error: (error) => {
        console.error('Error saving experience:', error);
      }
    });
  }
}
