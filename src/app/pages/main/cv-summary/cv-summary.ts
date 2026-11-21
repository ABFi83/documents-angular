import { Component, computed, DOCUMENT, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CurrentUserService } from '@common/services/current-user.service';
import { DocumentApiService } from '@common/services/document-api.service';
import { CvSummary as Summary, SummaryName } from '@interfaces/document.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { formatMonth } from '@utils/date';

/** A CV an item of the summary comes from, labelled with its title (its id until the CV list is loaded). */
interface Source {
  id: number;
  label: string;
}

/**
 * What the analyzed CVs add up to (`GET /documents/summary`): languages and frameworks with the number of CVs they
 * appear in, and the timeline of the experiences. Every item opens the CVs it comes from.
 */
@Component({
  selector: 'app-cv-summary',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './cv-summary.html',
  styleUrl: './cv-summary.scss'
})
export class CvSummary {
  #documentApi = inject(DocumentApiService);
  readonly #locale = inject(DOCUMENT).documentElement.lang;
  readonly #user = inject(CurrentUserService).user;

  // Both reloaded with the user, so uploading or deleting a CV updates the summary.
  #summary = rxResource({ params: () => this.#user() ?? undefined, stream: () => this.#documentApi.summary() });
  // Only for the titles of the source CVs: the summary has their ids.
  #documents = rxResource({ params: () => this.#user() ?? undefined, stream: () => this.#documentApi.list() });

  protected readonly view = computed(() => {
    if (!this.#summary.hasValue()) return null;
    const summary: Summary = this.#summary.value();
    const titles = new Map((this.#documents.hasValue() ? this.#documents.value() : []).map(document => [document.id, document.title]));
    const sources = (ids: number[]): Source[] => ids.map(id => ({ id, label: titles.get(id) ?? `#${id}` }));
    // The popover id comes from group and position: a name like "Spring Boot" is not a valid id.
    const names = (key: string, items: SummaryName[]) =>
      items.map((item, index) => ({ name: item.nome, sources: sources(item.document_ids), popoverId: `cv-summary-${key}-${index}` }));

    return {
      documents: summary.documenti,
      groups: [
        { key: 'languages', titleKey: 'DOCUMENTS.LANGUAGES', items: names('languages', summary.linguaggi) },
        { key: 'frameworks', titleKey: 'DOCUMENTS.FRAMEWORKS', items: names('frameworks', summary.frameworks) }
      ],
      experiences: summary.esperienze.map((experience, index) => ({
        index,
        role: experience.ruolo,
        company: experience.azienda,
        start: experience.start_date ? formatMonth(experience.start_date, this.#locale) : null,
        // null = current position.
        end: experience.end_date ? formatMonth(experience.end_date, this.#locale) : null,
        description: experience.description,
        sources: sources(experience.document_ids)
      }))
    };
  });
}
