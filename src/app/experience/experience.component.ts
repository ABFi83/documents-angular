import { Component, ChangeDetectionStrategy, input, linkedSignal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Experience } from '../model/model';
import { ExperiencePopupComponent } from './experience-popup.component';
import { ExperienceService } from './experience.service';


@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [ExperiencePopupComponent],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [DatePipe]
})
export class ExperienceComponent {
  experiencesInput = input<Experience[]>([], { alias: "experiences" });
  experiences = linkedSignal(() => sortExperiences(this.experiencesInput()));

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
        console.log('OK', response);
        this.experienceService.getExperiences().subscribe({
          next: (response) => {
            this.experiences.set(sortExperiences(response));
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
        this.experiences.update(list => list.filter(e => e.id !== experience.id));
      },
      error: (error) => {
        console.error('Error saving experience:', error);
      }
    });
  }
}

// Current position first, then by end date descending.
function sortExperiences(experiences: Experience[]): Experience[] {
  return [...experiences].sort((a, b) => {
    if (a.is_current !== b.is_current) return a.is_current ? -1 : 1;
    return new Date(b.end_date || "9999-12-31").getTime() - new Date(a.end_date || "9999-12-31").getTime();
  });
}
