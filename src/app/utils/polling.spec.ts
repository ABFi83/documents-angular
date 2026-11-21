import { CvDocument, ProcessStatus } from '@interfaces/document.interface';
import { defer, of } from 'rxjs';
import { vi } from 'vitest';
import { isAnalyzing, POLLING_INTERVAL_MS, pollWhile } from './polling';

describe('polling utils', () => {
  afterEach(() => vi.useRealTimers());

  it('polls until the value is no longer pending, emitting the last one too', () => {
    vi.useFakeTimers();
    const answers = ['PENDING', 'PENDING', 'COMPLETED', 'NEVER'];
    let call = 0;
    const emitted: string[] = [];

    pollWhile(
      defer(() => of(answers[call++])),
      value => value === 'PENDING'
    ).subscribe(value => emitted.push(value));
    vi.advanceTimersByTime(POLLING_INTERVAL_MS * 5);

    expect(emitted).toEqual(['PENDING', 'PENDING', 'COMPLETED']);
    expect(call).toBe(3);
  });

  it('tells which CVs are under analysis', () => {
    const cv = (status: ProcessStatus | null): CvDocument => ({ process: status ? { status } : null }) as CvDocument;
    expect(isAnalyzing(cv('PENDING'))).toBe(true);
    expect(isAnalyzing(cv('IN_PROGRESS'))).toBe(true);
    expect(isAnalyzing(cv('COMPLETED'))).toBe(false);
    expect(isAnalyzing(cv('ERROR'))).toBe(false);
    expect(isAnalyzing(cv(null))).toBe(false);
  });
});
