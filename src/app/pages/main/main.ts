import { Component, inject, linkedSignal } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentUpload } from '@common/components/document-upload/document-upload';
import { CurrentUserService } from '@common/services/current-user.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CvSummary } from './cv-summary/cv-summary';
import { Experiences } from './experiences/experiences';
import { Skills } from './skills/skills';

/**
 * The profile: the summary of the analyzed CVs, plus the skills and experiences the user adds by hand.
 * Until the first CV is uploaded it shows the upload instead.
 */
@Component({
  selector: 'app-main',
  imports: [CvSummary, DocumentUpload, Experiences, Skills, TranslatePipe],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {
  #router = inject(Router);

  protected readonly user = inject(CurrentUserService).user;
  protected readonly showDocumentUpload = linkedSignal(() => !this.user()?.documents?.length);

  // The analysis goes on in the BE: its progress and result are in the CV list.
  protected onUploaded(): void {
    void this.#router.navigate(['/documents']);
  }
}
