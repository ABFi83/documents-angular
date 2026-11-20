export interface Experience {
  id: number;
  company_name: string;
  role: string;
  description: string;
  start_date: string;
  // `'Present'` when `is_current`.
  end_date: string;
  is_current: boolean;
}
