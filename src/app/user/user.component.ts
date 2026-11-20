import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, Experience } from '../model/model';

import { SkillComponent } from "../skill/skill.component";
import { ExperienceComponent } from "../experience/experience.component";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [SkillComponent, ExperienceComponent],
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  @Input() user: User | null = null;




}
