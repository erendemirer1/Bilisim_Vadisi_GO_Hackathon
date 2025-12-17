import { AppointmentRepository } from "../repository/AppointmentRepository.js";
import { Appointment } from "../entity/Appointment.js";
import { StatusCodes } from "http-status-codes";
import Result from "../bean/Result.js";

export class AppointmentService {
  private appointmentRepository: AppointmentRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
  }

  async createAppointment(appointment: Appointment, user_id: number): Promise<Result<any>> {
    try {
      const { doctor_id, date, hour  } = appointment;

      if (!doctor_id || !date || hour === undefined) {
        return new Result(
          StatusCodes.BAD_REQUEST,
          null,
          "Doctor ID, Date ve Hour zorunludur"
        );
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return new Result(
          StatusCodes.BAD_REQUEST,
          null,
          "Tarih formatı YYYY-MM-DD olmalıdır"
        );
      }

      if (hour < 9 || hour > 17) {
        return new Result(
          StatusCodes.BAD_REQUEST,
          null,
          "Saat 9-17 arası olmalıdır"
        );
      }

      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        return new Result(
          StatusCodes.BAD_REQUEST,
          null,
          "Geçmiş tarihe randevu alınamaz"
        );
      }

      const exists = await this.appointmentRepository.exists(doctor_id, date, hour);
      if (exists) {
        return new Result(
          StatusCodes.CONFLICT,
          { field: "appointment" },
          "Bu tarih ve saatte randevu zaten alınmış"
        );
      }

      const result = await this.appointmentRepository.create({
        user_id,
        doctor_id,
        date,
        hour,
        status: 'booked'
      });

      return new Result(
        StatusCodes.CREATED,
        { appointmentId: result.lastInsertRowid },
        "Randevu başarıyla oluşturuldu"
      );
    } catch (error) {
      console.error("Create appointment error:", error);
      return new Result(
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        "Randevu oluşturulurken hata oluştu"
      );
    }
  }

  async getAllAppointments(): Promise<Result<any>> {
    try {
      const appointments = await this.appointmentRepository.findAll();
      return new Result(
        StatusCodes.OK,
        appointments,
        "Randevular başarıyla getirildi"
      );
    } catch (error) {
      return new Result(
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        "Randevular getirilemedi"
      );
    }
  }

  async getAppointmentById(id: number): Promise<Result<any>> {
    try {
      const appointment = await this.appointmentRepository.findById(id);

      if (!appointment) {
        return new Result(
          StatusCodes.NOT_FOUND,
          null,
          "Randevu bulunamadı"
        );
      }

      return new Result(
        StatusCodes.OK,
        appointment,
        "Randevu başarıyla getirildi"
      );
    } catch (error) {
      return new Result(
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        "Randevu getirilemedi"
      );
    }
  }

  async getAppointmentByUserId(userId: number): Promise<Result<any>> {
    try {
      const appointments = await this.appointmentRepository.findByUserId(userId);
      return new Result(
        StatusCodes.OK,
        appointments,
        "Kullanıcının randevuları başarıyla getirildi"
      );
    } catch (error) {
      return new Result(
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        "Randevular getirilemedi"
      );
    }
  }

  async getDoctorAppointments(doctorId: number): Promise<Result<any>> {
    try {
      const appointments = await this.appointmentRepository.findByDoctorId(doctorId);
      return new Result(
        StatusCodes.OK,
        appointments,
        "Doktorun randevuları başarıyla getirildi"
      );
    } catch (error) {
      return new Result(
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        "Randevular getirilemedi"
      );
    }
  }

  async deleteAppointment(id: number): Promise<Result<any>> {
    try {
      const appointment = await this.appointmentRepository.findById(id);
      if (!appointment) {
        return new Result(
          StatusCodes.NOT_FOUND,
          null,
          "Randevu bulunamadı"
        );
      }

      const result = await this.appointmentRepository.delete(id);

      if (result.changes > 0) {
        return new Result(
          StatusCodes.OK,
          null,
          "Randevu başarıyla silindi"
        );
      }

      return new Result(
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        "Randevu silinemedi"
      );
    } catch (error) {
      return new Result(
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        "Randevu silinirken hata oluştu"
      );
    }
  }
}

