import { db } from "../config/database.js";
import { Appointment } from "../entity/Appointment.js";

export class AppointmentRepository {
  async create(appointment: Appointment) {
    const stmt = db.prepare(`
      INSERT INTO appointments (user_id, doctor_id, date, hour, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      appointment.user_id,
      appointment.doctor_id,
      appointment.date,
      appointment.hour,
      appointment.status || 'booked',
    );
  }

  async findAll(): Promise<Appointment[]> {
    return db.prepare("SELECT * FROM appointments ORDER BY date, hour").all() as Appointment[];
  }

  async findById(id: number): Promise<Appointment | null> {
    const stmt = db.prepare("SELECT * FROM appointments WHERE id = ?");
    const appointment = stmt.get(id) as Appointment | undefined;
    return appointment || null;
  }

  async findByUserId(userId: number): Promise<Appointment[]> {
    const stmt = db.prepare(`
      SELECT a.id, 
             a.user_id, 
             u.name as name, 
             u.surname as surname,
             d.id as doctor_id,
             d.fullname as doctor_name, 
             d.expertise as doctor_expertise,
             a.date, 
             a.hour, 
             a.status,
             a.createdAt
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.user_id = ?
      ORDER BY a.date DESC, a.hour DESC
    `);
    return stmt.all(userId) as Appointment[];
  }

  async findByDoctorId(doctorId: number): Promise<Appointment[]> {
    const stmt = db.prepare(`
      SELECT a.id,
             a.user_id,
             u.name as name,
             u.surname as surname,
             u.phone as phone,
             d.id as doctor_id,
             d.fullname as doctor_name,
             d.expertise as doctor_expertise,
             a.date,
             a.hour,
             a.status,
             a.createdAt
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.doctor_id = ?
      ORDER BY a.date, a.hour
    `);
    return stmt.all(doctorId) as Appointment[];
  }

  async exists(doctorId: number, date: string, hour: number): Promise<boolean> {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE doctor_id = ? AND date = ? AND hour = ?
    `);
    const result = stmt.get(doctorId, date, hour) as { count: number };
    return result.count > 0;
  }

  async delete(id: number) {
    const stmt = db.prepare("DELETE FROM appointments WHERE id = ?");
    return stmt.run(id);
  }
}

