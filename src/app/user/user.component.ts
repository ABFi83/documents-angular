import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User, Experience } from '../model/model';
import { CommonModule } from '@angular/common';
import { SkillComponent } from "../skill/skill.component";
import { ExperienceComponent } from "../experience/experience.component";
import e from 'express';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, SkillComponent, ExperienceComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  @Input() user: User | null = null;




}
