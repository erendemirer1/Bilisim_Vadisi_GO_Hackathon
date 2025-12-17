export interface Appointment {
  id?: number;
  user_id: number;
  doctor_id: number;
  date: string; // Format: YYYY-MM-DD
  hour: number; // 0-23 arası saat
  status?: 'booked' | 'completed' | 'cancelled';
  createdAt?: string;
}
