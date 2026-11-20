import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { environment } from '@environments/environment';
import { provideTranslateService } from '@ngx-translate/core';
import { SkillDialog } from './skill-dialog/skill-dialog';
import { Skills } from './skills';

describe('Skills', () => {
  let fixture: ComponentFixture<Skills>;
  let http: HttpTestingController;
  let element: HTMLElement;
  const url = `${environment.apiBaseUrl}/users/skill`;

  const names = (): string[] => [...element.querySelectorAll('li span')].map(item => item.textContent?.trim() ?? '');

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()] });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Skills);
    fixture.componentRef.setInput('skills', [
      { id: 1, name: 'Java' },
      { id: 5, name: 'Angular' }
    ]);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('removes a skill once the BE has deleted it', async () => {
    (element.querySelector('li button') as HTMLButtonElement).click();
    http.expectOne(`${url}/1`).flush({});
    await fixture.whenStable();
    expect(names()).toEqual(['Angular']);
  });

  it('saves the list confirmed in the dialog', async () => {
    (element.querySelector('button[data-role="add"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    const dialog = fixture.debugElement.query(By.directive(SkillDialog));
    expect(dialog.componentInstance.skills()).toHaveLength(2);

    dialog.componentInstance.confirmed.emit([{ id: 3, name: 'Python' }]);
    await fixture.whenStable();

    expect(http.expectOne(url).request.body).toEqual({ skills: [{ id: 3, name: 'Python' }] });
    expect(names()).toEqual(['Python']);
    expect(element.querySelector('app-skill-dialog')).toBeNull();
  });
});
