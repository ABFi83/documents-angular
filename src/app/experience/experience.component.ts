import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Experience } from '../model/model';
import { ExperiencePopupComponent } from './experience-popup.component';
import { ExperienceService } from './experience.service';


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

  ngOnInit(): void {
    if (this.experiences && Array.isArray(this.experiences)) {
      this.experiences.sort((a: Experience, b: Experience) => {
        if (a.is_current && !b.is_current) {
          return -1;
        } else if (!a.is_current && b.is_current) {
          return 1;
        } else {
          const dateA = new Date(a.end_date || '9999-12-31');
          const dateB = new Date(b.end_date || '9999-12-31');
          return dateB.getTime() - dateA.getTime();
        }
      });
    }
  }

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
        console.log('OK', response);
        this.experienceService.getExperiences().subscribe({
          next: (response) => {
            this.experiences = response;
            console.log('Experiences:', this.experiences);
          }
        });
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
