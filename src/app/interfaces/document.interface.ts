export type ProcessStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';

/** An experience extracted from a CV (Italian keys, as the BE stores them). */
export interface ExtractedExperience {
  azienda: string;
  ruolo: string;
  // ISO dates (`YYYY-MM-DD`); `end_date` is null for the current position.
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

/** What the BE extracted from one CV. It does not touch the user's profile, except name and surname. */
export interface Extraction {
  nome: string | null;
  cognome: string | null;
  linguaggi: string[];
  frameworks: string[];
  esperienze: ExtractedExperience[];
}

/** The analysis of one uploaded CV. */
export interface Process {
  id: number;
  user_id: number;
  document_id: number | null;
  status: ProcessStatus;
  start_date: string;
  end_date: string | null;
  error_message: string | null;
  result: Extraction | null;
}

export interface UploadedDocument {
  id: number;
  title: string;
  meta_data: string;
  file_path: string;
  version: number;
  // UTC, without the zone designator.
  created_at: string;
}

/** A CV of the list, with its analysis. */
export interface CvDocument extends UploadedDocument {
  process: Process | null;
}

/** A language or framework of the summary, with the CVs it appears in (newest first). */
export interface SummaryName {
  nome: string;
  document_ids: number[];
}

/** An experience of the summary: the same experience in several CVs appears once, with the newest CV's data. */
export interface SummaryExperience extends ExtractedExperience {
  document_ids: number[];
}

/** Sum of the extractions of the user's analyzed (`COMPLETED`) CVs, computed by the BE. */
export interface CvSummary {
  // How many CVs it adds up.
  documenti: number;
  // Most frequent first.
  linguaggi: SummaryName[];
  frameworks: SummaryName[];
  // Newest first, undated last.
  esperienze: SummaryExperience[];
}
