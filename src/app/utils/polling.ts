import { exhaustMap, Observable, takeWhile, timer } from 'rxjs';
import { CvDocument } from '@interfaces/document.interface';

export const POLLING_INTERVAL_MS = 2500;

/** Requests `source` now and again every few seconds while `pending` holds; emits every answer, the last one too. */
export function pollWhile<T>(source: Observable<T>, pending: (value: T) => boolean): Observable<T> {
  return timer(0, POLLING_INTERVAL_MS).pipe(
    exhaustMap(() => source),
    takeWhile(value => pending(value), true)
  );
}

/** Whether the CV is still waiting for (or under) analysis. */
export function isAnalyzing(document: CvDocument): boolean {
  const status = document.process?.status;
  return status === 'PENDING' || status === 'IN_PROGRESS';
}
