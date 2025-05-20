import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../../model/model';
import { CommonModule } from '@angular/common';
import { SkillComponent } from "../skill/skill.component";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, SkillComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  @Input() user: User | null = null;
}
