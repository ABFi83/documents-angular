import { Component, EventEmitter, Output, Input, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Experience } from '../model/model';

@Component({
  selector: 'app-experience-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './experience-popup.component.html',
  styleUrls: ['./experience-popup.component.css']
})
export class ExperiencePopupComponent implements OnInit, OnChanges {
  @Input() userExperiences: Experience | undefined;
  @Input() isViewing: boolean = false;

  @Output() confirm = new EventEmitter<{ experience: Experience }>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('experienceForm') experienceForm!: NgForm;

  company_name: string = '';
  role: string = '';
  experienceDescription: string = '';
  experienceStartDate: string = '';
  experienceEndDate: string = '';
  isCurrentPosition: boolean = false;
  addedExperiences: Experience[] = [];
  showErrors: boolean = false;

  ngOnInit() {
    if (this.userExperiences) {
      this.setFormFromExperience(this.userExperiences);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userExperiences'] && changes['userExperiences'].currentValue) {
      this.setFormFromExperience(changes['userExperiences'].currentValue);
    }
  }

  setFormFromExperience(exp: Experience) {
    this.company_name = exp.company_name || '';
    this.role = exp.role || '';
    this.experienceDescription = exp.description || '';
    this.experienceStartDate = exp.start_date || '';
    this.experienceEndDate = exp.end_date && exp.end_date !== 'Present' ? exp.end_date : '';
    this.isCurrentPosition = !!exp.is_current;
  }

  removeExperience(experience: Experience) {
    this.addedExperiences = this.addedExperiences.filter(e => e !== experience);
  }

  onConfirm() {
    this.showErrors = true;
    this.experienceForm.form.markAllAsTouched();
    const controls: Array<{ value: any; ref: any }> = [
      { value: this.company_name, ref: this.experienceForm.controls['company_name'] },
      { value: this.role, ref: this.experienceForm.controls['role'] },
      { value: this.experienceStartDate, ref: this.experienceForm.controls['experienceStartDate'] }
    ];
    if (!this.isCurrentPosition) {
      controls.push({ value: this.experienceEndDate, ref: this.experienceForm.controls['experienceEndDate'] });
    }
    let valid = true;
    controls.forEach(ctrl => {
      if (!ctrl.value) {
        ctrl.ref?.control.markAsTouched();
        valid = false;
      }
    });
    if (valid) {
      this.confirm.emit({ experience: {
        id: this.userExperiences ? this.userExperiences.id : 0,
        company_name: this.company_name,
        role: this.role,
        description: this.experienceDescription,
        start_date: this.experienceStartDate,
        end_date: this.isCurrentPosition ? 'Present' : this.experienceEndDate,
        is_current: this.isCurrentPosition
     } });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
