import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { UserApiService } from '@common/services/user-api.service';
import { DocumentUpload } from './document-upload/document-upload';
import { Experiences } from './experiences/experiences';
import { MainHeader } from './main-header/main-header';
import { Skills } from './skills/skills';

@Component({
  selector: 'app-main',
  imports: [DocumentUpload, Experiences, MainHeader, Skills],
  templateUrl: './main.html'
})
export class Main {
  #userApi = inject(UserApiService);

  #userResource = rxResource({ stream: () => this.#userApi.get() });

  protected readonly user = computed(() => (this.#userResource.hasValue() ? this.#userResource.value() : null));
  // The upload is shown until the user has a document; upload and reset switch it explicitly.
  protected readonly showDocumentUpload = linkedSignal(() => !this.user()?.documents?.length);

  protected onUploadCompleted(): void {
    this.showDocumentUpload.set(false);
    this.#userResource.reload();
  }

  protected onProfileReset(): void {
    this.showDocumentUpload.set(true);
  }
}
