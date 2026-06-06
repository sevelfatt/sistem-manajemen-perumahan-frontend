// Type definitions matching the API schema

export type ResidentStatus = 'tetap' | 'kontrak';

export interface Resident {
  id: number;
  full_name: string;
  ktp_photo: string | null;
  status: ResidentStatus;
  phone_number: string;
  is_married: boolean;
  created_at: string;
  updated_at: string;
}

export type HouseStatus = 'dihuni' | 'tidak_dihuni';

export interface House {
  id: number;
  house_code: string;
  status: HouseStatus;
  current_resident_id: number | null;
  created_at: string;
  updated_at: string;
  current_resident?: Resident;
  histories?: HouseHistory[];
}

export interface HouseHistory {
  id: number;
  house_id: number;
  resident_id: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  resident?: Resident;
}

export type PaymentType = 'kebersihan' | 'satpam';
export type PaymentStatus = 'lunas' | 'belum';

export interface Payment {
  id: number;
  house_id: number;
  resident_id: number;
  amount: number;
  payment_date: string;
  type: PaymentType;
  for_month: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  house?: House;
  resident?: Resident;
}

export type ExpenseType = 'rutin' | 'insidental';

export interface Expense {
  id: number;
  description: string;
  amount: number;
  expense_date: string;
  type: ExpenseType;
  created_at: string;
  updated_at: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ReportDetail {
  month: string;
  incomes: Payment[];
  expenses: Expense[];
}
